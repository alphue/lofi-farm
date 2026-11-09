import { stepSeconds } from './music.js';

const LOOKAHEAD = 0.1, TICK_MS = 25;
const hz = m => 440 * 2 ** ((m - 69) / 12);

// role -> tonal synth: osc type, attack, total length (s), peak scale
const TONES = {
  chords: { type: 'triangle', a: 0.08, len: 1.5, g: 0.5 },
  keys:   { type: 'triangle', a: 0.03, len: 0.9, g: 0.5 },
  pad:    { type: 'sine',     a: 0.6,  len: 2.4, g: 0.5 },
  bass:   { type: 'sine',     a: 0.02, len: 0.9, g: 0.8 },
  bell:   { type: 'sine',     a: 0.01, len: 1.6, g: 0.4 },
  pluck:  { type: 'triangle', a: 0.01, len: 0.5, g: 0.5 },
};

export function createAudio() {
  let ctx = null, master = null, noiseBuf = null;

  function build() {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.7;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 3000;
    const comp = ctx.createDynamicsCompressor();
    master.connect(lp).connect(comp).connect(ctx.destination);

    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    // constant quiet vinyl/cricket bed
    const bed = ctx.createBufferSource();
    bed.buffer = noiseBuf; bed.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 0.5;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, ctx.currentTime);
    bg.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 2);
    bed.connect(bp).connect(bg).connect(master);
    bed.start();
  }

  // gentle envelope: ramp from ~0, never a hard cut
  function env(t, peak, a, len) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    g.connect(master);
    return g;
  }

  function noise(t, peak, a, len, filterType, freq) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf; src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = filterType; f.frequency.value = freq;
    src.connect(f).connect(env(t, peak, a, len));
    src.start(t, Math.random()); src.stop(t + len + 0.05);
  }

  function schedule(voices, when) {
    if (!ctx) return;
    for (const v of voices) {
      const tone = TONES[v.role];
      if (tone) {
        const o = ctx.createOscillator();
        o.type = tone.type;
        o.frequency.value = hz(v.midi);
        o.detune.value = (Math.random() - 0.5) * 12; // tape-ish wobble
        o.connect(env(when, v.gain * tone.g, tone.a, tone.len));
        o.start(when); o.stop(when + tone.len + 0.05);
      } else if (v.role === 'hats') noise(when, v.gain * 0.5, 0.005, 0.07, 'highpass', 3000);
      else if (v.role === 'texture') noise(when, v.gain * 0.6, 0.8, 1.8, 'lowpass', 900);
    }
  }

  return {
    async start() {
      if (!ctx) build();
      if (ctx.state !== 'running') await ctx.resume();
    },
    schedule,
    now: () => (ctx ? ctx.currentTime : 0),
  };
}

// Look-ahead loop: calls getVoices(step) for each step due in the next 100 ms.
// Returns a stop function.
export function runScheduler(audio, getVoices) {
  let step = 0, next = audio.now() + 0.1;
  const id = setInterval(() => {
    const now = audio.now();
    if (next < now) next = now + 0.05; // tab was throttled: skip, don't burst
    while (next < now + LOOKAHEAD) {
      audio.schedule(getVoices(step), next);
      next += stepSeconds();
      step++;
    }
  }, TICK_MS);
  return () => clearInterval(id);
}
