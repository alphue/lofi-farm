import { createAudio, runScheduler } from './audio.js';
import { voicesAt } from './music.js';
import { load, serialize, plant, remove, harvest, growth } from './state.js';
import { SPECIES } from './plants.js';
import { moonPhase, isFullMoon } from './moon.js';
import { draw, tileAt } from './render.js';

const KEY = 'lofi-farm-v1';
const canvas = document.getElementById('game'), ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay'), startBtn = document.getElementById('start');
const bar = document.getElementById('seeds'), toast = document.getElementById('toast');

let saved = null;
try { saved = localStorage.getItem(KEY); } catch {}
const state = load(saved, Date.now());
const save = () => { try { localStorage.setItem(KEY, serialize(state)); } catch {} };

let selected = state.unlocked[0];
const pulsedAt = new Map(); // tile idx -> Date.now() when its voice was scheduled

// ---- seed bar
function renderBar() {
  if (!state.unlocked.includes(selected)) selected = state.unlocked[0];
  bar.replaceChildren(...state.unlocked.map(id => {
    const b = document.createElement('button');
    b.textContent = SPECIES[id].name;
    b.style.borderColor = SPECIES[id].color;
    if (id === selected) b.className = 'sel';
    b.onclick = () => { selected = id; renderBar(); };
    return b;
  }));
}
renderBar();

let toastTimer;
function say(text) {
  toast.textContent = text; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---- input
const pos = e => {
  const r = canvas.getBoundingClientRect();
  return tileAt(e.clientX - r.left, e.clientY - r.top, r.width, r.height);
};
function removeAt(idx) {
  if (idx === null || !state.grid[idx]) return;
  remove(state, idx); save();
}
function clickAt(idx) {
  if (idx === null) return;
  const now = Date.now();
  if (!state.grid[idx]) plant(state, idx, selected, now);
  else if (growth(state.grid[idx], now) >= 1) {
    const { discovered } = harvest(state, idx, now);
    if (discovered) { say(`Yeni tohum: ${SPECIES[discovered].name}!`); renderBar(); }
  } else return;
  save();
}

let pressTimer = null, suppress = false, pressed = null; // pressed: tile idx where a canvas pointerdown began
canvas.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  suppress = false;
  const idx = pressed = pos(e);
  clearTimeout(pressTimer);
  if (e.pointerType !== 'mouse') pressTimer = setTimeout(() => { suppress = true; removeAt(idx); }, 600);
});
canvas.addEventListener('pointerup', e => {
  clearTimeout(pressTimer);
  const idx = pos(e), start = pressed;
  pressed = null;
  if (e.button === 0 && !suppress && start !== null && idx === start) clickAt(idx);
});
canvas.addEventListener('pointercancel', () => { clearTimeout(pressTimer); pressed = null; });
canvas.addEventListener('contextmenu', e => {
  e.preventDefault();
  suppress = true; clearTimeout(pressTimer);
  removeAt(pos(e));
});

// ---- audio (exactly one scheduler ever)
const audio = createAudio();
let stopScheduler = null;
startBtn.addEventListener('click', async () => {
  if (stopScheduler || startBtn.disabled) return;
  startBtn.disabled = true;
  try {
    await audio.start();
  } catch {
    startBtn.disabled = false; // let the player retry
    return;
  }
  stopScheduler = runScheduler(audio, step => {
    const now = Date.now();
    const voices = voicesAt(state, step, now, isFullMoon(now));
    for (const v of voices) pulsedAt.set(v.idx, now);
    return voices;
  });
  overlay.hidden = true;
});

// ---- loop
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener('resize', resize);
resize();

function frame() {
  const now = Date.now();
  const pulses = new Set();
  for (const [i, t] of pulsedAt) (now - t < 350 ? pulses.add(i) : pulsedAt.delete(i));
  draw(ctx, state, now, { phase: moonPhase(now), fullMoon: isFullMoon(now), pulses });
  requestAnimationFrame(frame);
}
frame();
