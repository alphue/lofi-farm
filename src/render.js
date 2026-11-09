import { SPECIES } from './plants.js';
import { COLS, ROWS, growth } from './state.js';

const BAR_H = 76; // bottom seed bar (HTML), keep in sync with index.html

function layout(w, h) {
  const top = h * 0.34, avail = h - BAR_H - top - 8;
  const cell = Math.max(10, Math.min((w - 24) / COLS, avail / ROWS));
  return { cell, x0: (w - cell * COLS) / 2, y0: top + (avail - cell * ROWS) / 2 };
}

export function tileAt(px, py, w, h) {
  const { cell, x0, y0 } = layout(w, h);
  const c = Math.floor((px - x0) / cell), r = Math.floor((py - y0) / cell);
  return c < 0 || r < 0 || c >= COLS || r >= ROWS ? null : r * COLS + c;
}

function moon(ctx, x, y, r, phase) {
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
  ctx.fillStyle = '#f4eccf';
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  // slide a dark disc across: waxing lit on the right, waning on the left
  const k = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
  ctx.fillStyle = '#2b3556';
  ctx.beginPath(); ctx.arc(x + (phase < 0.5 ? -1 : 1) * k * r * 2.1, y, r, 0, 7); ctx.fill();
  ctx.restore();
}

function glow(ctx, x, y, r, color, a) {
  ctx.save();
  ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.restore();
}

export function draw(ctx, state, nowMs, view) {
  const w = ctx.canvas.clientWidth, h = ctx.canvas.clientHeight, t = nowMs / 1000;
  const { cell, x0, y0 } = layout(w, h);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#141a30'); sky.addColorStop(1, '#1f2a44');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

  // stars (fixed pseudo-random positions, slow twinkle)
  ctx.fillStyle = '#f4eccf';
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 0.6 + i * 1.7);
    ctx.fillRect(((i * 0.618034) % 1) * w, ((i * 0.381966 * 7) % 1) * h * 0.3, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
  const mx = w - Math.min(70, w * 0.14), my = Math.min(60, h * 0.1), mr = Math.min(26, w * 0.06);
  glow(ctx, mx, my, mr * 3, '#f4eccf', view.fullMoon ? 0.35 : 0.15);
  moon(ctx, mx, my, mr, view.phase);

  // hill
  ctx.fillStyle = '#2f4a3a';
  ctx.beginPath(); ctx.ellipse(w / 2, h * 0.34 + (h - h * 0.34) * 0.45, w * 0.75, h * 0.55, 0, 0, 7); ctx.fill();

  // house with lit window
  const hw = Math.min(70, w * 0.16), hx = Math.max(8, x0 - hw * 0.2), hy = h * 0.34 - hw * 0.75;
  ctx.fillStyle = '#3b3550'; ctx.fillRect(hx, hy, hw, hw * 0.75);
  ctx.fillStyle = '#2a2540';
  ctx.beginPath(); ctx.moveTo(hx - 6, hy + 2); ctx.lineTo(hx + hw / 2, hy - hw * 0.45); ctx.lineTo(hx + hw + 6, hy + 2); ctx.fill();
  glow(ctx, hx + hw * 0.5, hy + hw * 0.35, hw * 0.7, '#ffcf6b', 0.3 + 0.05 * Math.sin(t * 1.3));
  ctx.fillStyle = '#ffcf6b'; ctx.fillRect(hx + hw * 0.36, hy + hw * 0.22, hw * 0.28, hw * 0.28);

  // tiles + plants
  for (let i = 0; i < COLS * ROWS; i++) {
    const x = x0 + (i % COLS) * cell, y = y0 + Math.floor(i / COLS) * cell;
    ctx.fillStyle = '#4a3a2c';
    ctx.beginPath(); ctx.roundRect(x + 2, y + 2, cell - 4, cell - 4, cell * 0.12); ctx.fill();
    const tile = state.grid[i];
    if (!tile) continue;
    const sp = SPECIES[tile.species], g = growth(tile, nowMs), cx = x + cell / 2, cy = y + cell / 2;
    const mature = g >= 1;
    const moonBoost = view.fullMoon && (sp.id === 'moonflower' || sp.id === 'sunflower');
    const a = (mature ? 0.22 + 0.06 * Math.sin(t * 2 + i) : 0) + (moonBoost && mature ? 0.3 : 0) + (view.pulses.has(i) ? 0.35 : 0);
    if (a > 0) glow(ctx, cx, cy, cell * 0.7, sp.color, Math.min(0.8, a));
    const r = cell * (0.08 + 0.3 * g);
    ctx.fillStyle = '#3d6b4c'; // stem
    ctx.fillRect(cx - 1, cy, 2, r * 0.9);
    ctx.fillStyle = sp.color;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill();
  }

  // fireflies
  for (let i = 0; i < 9; i++) {
    const x = (0.5 + 0.5 * Math.sin(t * 0.13 + i * 2.1)) * w;
    const y = h * 0.3 + (0.5 + 0.5 * Math.sin(t * 0.17 + i * 1.3)) * (h * 0.6 - BAR_H);
    glow(ctx, x, y, 8, '#ffe680', 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.1 + i * 3)));
    ctx.fillStyle = '#ffe680'; ctx.fillRect(x - 1, y - 1, 2, 2);
  }
}
