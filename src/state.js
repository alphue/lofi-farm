import { SPECIES, START_SPECIES } from './plants.js';

export const COLS = 6, ROWS = 4;

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
