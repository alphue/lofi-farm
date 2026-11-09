import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newState, growth } from '../src/state.js';

test('new state has 24 empty tiles and 4 unlocked species', () => {
  const s = newState(0);
  assert.equal(s.grid.length, 24);
  assert.ok(s.grid.every(t => t === null));
  assert.deepEqual(s.unlocked.sort(), ['lavender', 'pumpkin', 'sunflower', 'wheat']);
});

test('growth is linear over growMin', () => {
  const t = { species: 'wheat', plantedAt: 0 };
  assert.equal(growth(t, 10 * 60_000), 0.5);
});

test('growth caps at 1 after weeks away', () => {
  assert.equal(growth({ species: 'wheat', plantedAt: 0 }, 30 * 86_400_000), 1);
});

test('growth is 0 when clock is earlier than plantedAt', () => {
  assert.equal(growth({ species: 'wheat', plantedAt: 1_000_000 }, 0), 0);
});
