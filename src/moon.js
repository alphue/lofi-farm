const SYNODIC_DAYS = 29.530588853;
const REF_NEW_MOON_MS = Date.parse('2000-01-06T18:14:00Z');
const DAY_MS = 86_400_000;

// 0 = new moon, 0.5 = full moon. Result is in [0, 1), including dates before the reference.
export function moonPhase(dateMs) {
  const cycles = (dateMs - REF_NEW_MOON_MS) / DAY_MS / SYNODIC_DAYS;
  return ((cycles % 1) + 1) % 1;
}

// True within about +/- 1 day of full moon.
export function isFullMoon(dateMs) {
  return Math.abs(moonPhase(dateMs) - 0.5) < 0.034;
}
