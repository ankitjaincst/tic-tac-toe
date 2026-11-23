const STORAGE_KEY = "ttt-sound-muted";

let ctx = null;
let muted = false;
try {
  muted = localStorage.getItem(STORAGE_KEY) === "1";
} catch {
  /* storage unavailable */
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = Boolean(value);
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

// Created lazily so it only starts after a user gesture (autoplay policy).
function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(ac, freq, start, dur, type = "triangle", gain = 0.18) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

export function playWin() {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  // C major arpeggio up, ending on a held chord.
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(ac, f, t + i * 0.11, 0.28));
  const end = t + 0.5;
  [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(ac, f, end, 0.7, "triangle", 0.1));
}

export function playDraw() {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime + 0.02;
  tone(ac, 392, t, 0.3, "sine", 0.15);
  tone(ac, 329.63, t + 0.22, 0.5, "sine", 0.15);
}
