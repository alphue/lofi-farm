// Temporary demo (Task 6 replaces this with the real game).
import { createAudio, runScheduler } from './audio.js';
import { voicesAt } from './music.js';
import { newState, plant } from './state.js';
import { START_SPECIES } from './plants.js';
import { isFullMoon } from './moon.js';

const audio = createAudio();
const overlay = document.getElementById('overlay');

document.getElementById('start').addEventListener('click', async () => {
  await audio.start();
  overlay.hidden = true;
  const state = newState(Date.now());
  START_SPECIES.forEach((id, i) => plant(state, i, id, 0)); // planted long ago = mature
  runScheduler(audio, step => {
    const now = Date.now();
    return voicesAt(state, step, now, isFullMoon(now));
  });
});
