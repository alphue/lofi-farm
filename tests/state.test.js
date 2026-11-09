import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newState, growth, plant, harvest, remove, serialize, load } from '../src/state.js';
import { SPECIES } from '../src/plants.js';

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

test('plant only on empty tile with unlocked species', () => {
  const s = newState(0);
  assert.equal(plant(s, 0, 'wheat', 0), true);
  assert.equal(plant(s, 0, 'pumpkin', 0), false);
  assert.equal(plant(s, 1, 'moonflower', 0), false);
});
test('harvest needs maturity and drops plant to half growth', () => {
  const s = newState(0); plant(s, 0, 'wheat', 0);
  assert.equal(harvest(s, 0, 60_000).ok, false);
  const now = 20 * 60_000;
  assert.equal(harvest(s, 0, now, () => 0.9).ok, true);
  assert.equal(growth(s.grid[0], now), 0.5);
});
test('harvest discovers a locked species when rng < 0.25', () => {
  const s = newState(0); plant(s, 0, 'wheat', 0);
  const r = harvest(s, 0, 20 * 60_000, () => 0.1);
  assert.ok(['corn','carrot','blueberry','moonflower'].includes(r.discovered));
  assert.ok(s.unlocked.includes(r.discovered));
});
test('no discovery when everything is unlocked', () => {
  const s = newState(0); s.unlocked = Object.keys(SPECIES); plant(s, 0, 'wheat', 0);
  assert.equal(harvest(s, 0, 20 * 60_000, () => 0).discovered, null);
});
test('remove empties a tile', () => {
  const s = newState(0); plant(s, 2, 'wheat', 0);
  remove(s, 2);
  assert.equal(s.grid[2], null);
});
test('save round-trips', () => {
  const s = newState(0); plant(s, 3, 'pumpkin', 5);
  assert.deepEqual(load(serialize(s), 0), s);
});
for (const bad of [null, '', '{', '{"version":2}', '{"version":1,"grid":[]}'])
  test(`corrupt save ${JSON.stringify(bad)} gives fresh farm`, () => {
    assert.deepEqual(load(bad, 0), newState(0));
  });
test('load drops unknown species from tiles and unlocked', () => {
  const grid = [{ species: 'dragonfruit', plantedAt: 0 }, ...Array(23).fill(null)];
  const s = load(JSON.stringify({ version: 1, grid, unlocked: ['wheat', 'dragonfruit'] }), 0);
  assert.equal(s.grid[0], null);
  assert.deepEqual(s.unlocked, ['wheat']);
});
