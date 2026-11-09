import { COLS, growth } from './state.js';
import { SPECIES } from './plants.js';

export const BPM = 78, STEPS_PER_BAR = 8;
export const stepSeconds = () => 60 / BPM / 2;

export const PROGRESSION = [
  [53, 57, 60, 64], // Fmaj7
  [52, 55, 59, 62], // Em7
  [50, 53, 57, 60], // Dm7
  [48, 52, 55, 59], // Cmaj7
];

// role -> [8-step pattern, gain, octave shift (null = unpitched)]
const ROLES = {
  chords:  { pat: [1, 0, 0, 0, 1, 0, 0, 0], gain: 0.5,  shift: 0 },
  bass:    { pat: [1, 0, 0, 0, 0, 1, 0, 0], gain: 0.6,  shift: -12 },
  bell:    { pat: [0, 0, 0, 1, 0, 0, 0, 0], gain: 0.35, shift: 12 },
  texture: { pat: [1, 0, 0, 0, 0, 0, 0, 0], gain: 0.25, shift: null },
  hats:    { pat: [0, 1, 0, 1, 0, 1, 0, 1], gain: 0.2,  shift: null },
  pluck:   { pat: [0, 0, 1, 0, 0, 0, 0, 1], gain: 0.3,  shift: 12 },
  keys:    { pat: [0, 0, 1, 0, 0, 0, 1, 0], gain: 0.4,  shift: 0 },
  pad:     { pat: [1, 0, 0, 0, 0, 0, 0, 0], gain: 0.3,  shift: 0 },
};

export function voicesAt(state, step, nowMs, fullMoon) {
  const chord = PROGRESSION[Math.floor(step / STEPS_PER_BAR) % PROGRESSION.length];
  const voices = [];
  state.grid.forEach((tile, idx) => {
    if (!tile) return;
    const g = growth(tile, nowMs);
    if (g < 0.1) return;
    const role = SPECIES[tile.species].role;
    if (role === 'pad' && !fullMoon) return;
    const r = ROLES[role], col = idx % COLS, row = Math.floor(idx / COLS);
    if (!r.pat[(((step - col) % 8) + 8) % 8]) return;
    let midi = null;
    if (r.shift !== null) midi = chord[row % 4] + r.shift + (role === 'bell' && fullMoon ? 12 : 0);
    voices.push({ idx, role, midi, gain: g * r.gain });
  });
  const sum = voices.reduce((a, v) => a + v.gain, 0);
  if (sum > 1) voices.forEach(v => { v.gain /= sum; });
  return voices;
}
