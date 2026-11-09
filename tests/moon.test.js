import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moonPhase, isFullMoon } from '../src/moon.js';

test('known new moon is near phase 0', () => {
  const p = moonPhase(Date.parse('2024-04-08T18:21:00Z'));
  assert.ok(p < 0.02 || p > 0.98);
});
test('known full moon is full', () => {
  assert.equal(isFullMoon(Date.parse('2024-04-23T23:49:00Z')), true);
});
test('a week after full moon is not full', () => {
  assert.equal(isFullMoon(Date.parse('2024-04-30T23:49:00Z')), false);
});
test('phase stays in [0, 1) for dates before the reference', () => {
  for (const iso of ['1999-12-01T00:00:00Z', '1900-01-01T00:00:00Z', '1000-06-15T12:00:00Z']) {
    const p = moonPhase(Date.parse(iso));
    assert.ok(p >= 0 && p < 1, `${iso} gave ${p}`);
  }
});
