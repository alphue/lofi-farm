import test from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES } from '../src/plants.js';
import { newState, plant } from '../src/state.js';
import { PROGRESSION, BPM, stepSeconds, voicesAt } from '../src/music.js';

const full = () => { const s = newState(0); s.unlocked = Object.keys(SPECIES);
  const ids = Object.keys(SPECIES); s.grid = s.grid.map((_, i) => ({ species: ids[i % 8], plantedAt: 0 })); return s; };
const LATE = 10 * 86_400_000;
test('empty farm is silent', () => {
  assert.deepEqual(voicesAt(newState(0), 0, 0, false), []);
});
test('seedling under 10% is silent', () => {
  const s = newState(0); plant(s, 0, 'wheat', 0);
  assert.deepEqual(voicesAt(s, 0, 60_000, false), []);
});
test('every melodic note belongs to the current chord (any octave)', () => {
  const s = full();
  for (let step = 0; step < 32; step++) {
    const chord = PROGRESSION[Math.floor(step / 8) % 4].map(n => n % 12);
    for (const v of voicesAt(s, step, LATE, true))
      if (v.midi !== null) assert.ok(chord.includes(v.midi % 12));
  }
});
test('full farm never exceeds total gain 1', () => {
  for (let step = 0; step < 32; step++) {
    const sum = voicesAt(full(), step, LATE, true).reduce((a, v) => a + v.gain, 0);
    assert.ok(sum <= 1 + 1e-9);
  }
});
test('moonflower is silent unless full moon', () => {
  const steps = [...Array(32).keys()];
  assert.ok(steps.every(st => voicesAt(full(), st, LATE, false).every(v => v.role !== 'pad')));
  assert.ok(steps.some(st => voicesAt(full(), st, LATE, true).some(v => v.role === 'pad')));
});
test('every species is audible somewhere in a bar (full moon)', () => {
  const roles = new Set();
  for (let st = 0; st < 8; st++) voicesAt(full(), st, LATE, true).forEach(v => roles.add(v.role));
  assert.deepEqual([...roles].sort(), [...new Set(Object.values(SPECIES).map(s => s.role))].sort());
});
test('single tile: gain, octave, rotation by column, no mutation', () => {
  const s = newState(0); plant(s, 7, 'pumpkin', 0); // col 1, row 1, bass
  const before = JSON.stringify(s);
  const hits = [...Array(8).keys()].flatMap(st => voicesAt(s, st, LATE, false).map(v => ({ st, ...v })));
  assert.ok(hits.length > 0);
  assert.ok(hits.every(v => v.idx === 7 && v.role === 'bass' && v.midi === PROGRESSION[0][1] - 12 && v.gain === 0.6));
  const s0 = newState(0); plant(s0, 1, 'pumpkin', 0); // same pattern, col 1 row 0
  const at = st => voicesAt(s0, st, LATE, false).length;
  const a = [...Array(8).keys()].map(st => at(st));
  const s1 = newState(0); plant(s1, 0, 'pumpkin', 0); // col 0
  const b = [...Array(8).keys()].map(st => voicesAt(s1, st, LATE, false).length);
  assert.deepEqual(a, [...b.slice(7), ...b.slice(0, 7)]);
  assert.equal(JSON.stringify(s), before);
});
test('bell goes up an extra octave on full moon', () => {
  const s = newState(0); plant(s, 0, 'sunflower', 0);
  const note = fm => [...Array(8).keys()].flatMap(st => voicesAt(s, st, LATE, fm))[0].midi;
  assert.equal(note(false), PROGRESSION[0][0] + 12);
  assert.equal(note(true), PROGRESSION[0][0] + 24);
});
test('timing', () => {
  assert.equal(BPM, 78);
  assert.ok(Math.abs(stepSeconds() - 60 / 78 / 2) < 1e-12);
});
