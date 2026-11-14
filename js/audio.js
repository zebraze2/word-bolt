// Voice clips (pre-recorded) + tiny synth sound effects, all through one AudioContext.
const GAP_MS = 650;          // clear pause between spoken pieces
const TEST = new URLSearchParams(location.search).has('test');
let ctx, master;
const buffers = {};
let seq = 0, current = null;

export const wait = ms => new Promise(r => setTimeout(r, TEST ? Math.min(ms, 30) : ms));

export async function initAudio(ids) {
  ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
  await ctx.resume();
  master = master || ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  await Promise.all(ids.map(async id => {
    if (buffers[id]) return;
    const url = id.startsWith('ph_') ? `audio/phonics/${id.slice(3)}.m4a` : `audio/${id}.m4a`;
    for (let tries = 0; tries < 3 && !buffers[id]; tries++) {   // retry: a dropped request shouldn't silence a word
      try {
        const r = await fetch(url);
        if (r.ok) buffers[id] = await ctx.decodeAudioData(await r.arrayBuffer());
        else break;
      } catch (e) { await wait(200); }
    }
  }));
}

function playOne(id) {
  return new Promise(res => {
    const b = buffers[id];
    (window.__voiceLog ||= []).push(id + (b ? '' : ' (missing)'));
    if (!b || TEST) { setTimeout(res, TEST ? 10 : 300); return; }
    const s = ctx.createBufferSource();
    s.buffer = b; s.connect(master);
    s.onended = () => { if (current === s) current = null; res(); };
    current = s; s.start();
  });
}

export function stopVoice() {
  seq++;
  if (current) { try { current.onended = null; current.stop(); } catch (e) {} current = null; }
}

// say('p_intro') or say('ph_m', 'ph_o', 'ph_p', 'w_mop', {gap: 450})
export async function say(...ids) {
  const opt = ids.length && typeof ids[ids.length - 1] === 'object' ? ids.pop() : {};
  stopVoice();
  const my = seq;
  // a number in the list is a pause of that many ms instead of the usual gap
  for (let i = 0; i < ids.length; i++) {
    if (my !== seq) return false;
    if (typeof ids[i] === 'number') { await wait(ids[i]); continue; }
    await playOne(ids[i]);
    if (i < ids.length - 1 && typeof ids[i + 1] !== 'number') await wait(opt.gap ?? GAP_MS);
  }
  return my === seq;
}

// ---- sound effects ----
function tone(type, f0, f1, dur, vol = .2, delay = 0) {
  if (!ctx || TEST) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, vol = .25) {
  if (!ctx || TEST) return;
  const n = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = 1400; g.gain.value = vol;
  s.buffer = n; s.connect(f); f.connect(g); g.connect(master); s.start();
}
export const sfx = {
  chime() { tone('sine', 660, 660, .14, .18); tone('sine', 880, 880, .14, .18, .09); tone('sine', 1320, 1320, .25, .16, .18); },
  spark() { tone('triangle', 500, 1600, .25, .15); },
  buzz() { tone('square', 180, 140, .22, .08); },
  nope() { tone('square', 220, 200, .1, .06); tone('square', 180, 170, .12, .06, .11); },
  hit() { noise(.25, .35); tone('sawtooth', 300, 60, .25, .12); },
  zap() { tone('sawtooth', 1200, 200, .45, .1); tone('square', 900, 150, .45, .05, .05); },
  whoosh() { noise(.4, .18); tone('sine', 300, 120, .4, .08); },
  splat() { noise(.35, .3); tone('sine', 160, 60, .3, .2); },
  boing() { tone('sine', 200, 700, .3, .2); },
  heal() { tone('sine', 523, 1046, .4, .15); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, .3, .15, i * .13)); },
};
