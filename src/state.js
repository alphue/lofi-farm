import { SPECIES, START_SPECIES } from './plants.js';

export const COLS = 6, ROWS = 4;
const DISCOVERY_CHANCE = 0.25;

export function newState(nowMs) {
  return {
    version: 1,
    grid: Array(COLS * ROWS).fill(null),
    unlocked: [...START_SPECIES],
  };
}

export function growth(tile, nowMs) {
  const totalMs = SPECIES[tile.species].growMin * 60_000;
  const t = (nowMs - tile.plantedAt) / totalMs;
  return Math.min(1, Math.max(0, t));
}

export function plant(state, idx, speciesId, nowMs) {
  if (state.grid[idx] !== null || !state.unlocked.includes(speciesId)) return false;
  state.grid[idx] = { species: speciesId, plantedAt: nowMs };
  return true;
}

export function remove(state, idx) {
  state.grid[idx] = null;
}

export function harvest(state, idx, nowMs, rng = Math.random) {
  const tile = state.grid[idx];
  if (!tile || growth(tile, nowMs) < 1) return { ok: false, discovered: null };
  tile.plantedAt = nowMs - SPECIES[tile.species].growMin * 60_000 * 0.5;
  let discovered = null;
  const locked = Object.keys(SPECIES).filter(id => !state.unlocked.includes(id));
  if (locked.length && rng() < DISCOVERY_CHANCE) {
    discovered = locked[Math.floor(rng() * locked.length)];
    state.unlocked.push(discovered);
  }
  return { ok: true, discovered };
}

export function serialize(state) {
  return JSON.stringify(state);
}

export function load(text, nowMs) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return newState(nowMs);
  }
  if (!data || data.version !== 1 || !Array.isArray(data.grid) || data.grid.length !== COLS * ROWS)
    return newState(nowMs);
  const known = id => Object.hasOwn(SPECIES, id);
  return {
    version: 1,
    grid: data.grid.map(t => (t && known(t.species) ? t : null)),
    unlocked: Array.isArray(data.unlocked) ? data.unlocked.filter(known) : [...START_SPECIES],
  };
}
