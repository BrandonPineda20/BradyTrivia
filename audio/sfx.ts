/**
 * Energetic SFX (spec §10.1). For the web demo these are synthesized with the Web
 * Audio API — zero asset files, fully in our control, and easy to swap for a
 * royalty-free / branded pack later. No-ops on platforms without Web Audio
 * (native uses expo-av + files, post-MVP) and when muted.
 */
import { useSettingsStore } from "../store/settingsStore";

export type Sfx = "lockIn" | "correct" | "wrong" | "advance" | "eliminate" | "champion" | "tick" | "tap";

let ctx: AudioContext | null = null;
function audioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC: typeof AudioContext | undefined =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

function tone(
  c: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "sine",
  gain = 0.14,
) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function sweep(c: AudioContext, from: number, to: number, start: number, dur: number, type: OscillatorType = "sine") {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.linearRampToValueAtTime(to, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(0.13, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/**
 * Soft "bubble" pop: a pure sine whose pitch curves upward (the watery bloop) under
 * a gentle attack + smooth decay. Kept low-gain so it's pleasant, never harsh.
 */
function bubble(c: AudioContext, from: number, to: number, start: number, dur: number, gain: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + dur * 0.6);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.016); // soft attack — no hard click
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur); // smooth round-off
  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

// Preloaded audio buffer for zero-latency playback via Web Audio API.
let _ctx: AudioContext | null = null;
let _buffer: AudioBuffer | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!_ctx) _ctx = new AC();
  return _ctx;
}

// Preload as soon as the module loads (browser only).
if (typeof window !== "undefined") {
  const CLICK_SRC = require("./677861__el_boss__ui-button-click.wav");
  const src = typeof CLICK_SRC === "string" ? CLICK_SRC : CLICK_SRC?.uri ?? String(CLICK_SRC);
  fetch(src)
    .then((r) => r.arrayBuffer())
    .then((ab) => getCtx()?.decodeAudioData(ab))
    .then((buf) => { if (buf) _buffer = buf; })
    .catch(() => {});
}

export function playSfx(_name: Sfx) {
  if (useSettingsStore.getState().muted) return;
  const c = getCtx();
  if (!c || !_buffer) return;
  try {
    if (c.state === "suspended") c.resume().catch(() => {});
    const src = c.createBufferSource();
    src.buffer = _buffer;
    const gain = c.createGain();
    gain.gain.value = 0.5;
    src.connect(gain).connect(c.destination);
    src.start(c.currentTime);
  } catch {}
}

export function playClick() {
  playSfx("tap");
}

const AUDIO_ASSETS = [
  () => require("./u_ss015dykrt-brass-fanfare-with-timpani-and-winchimes-reverberated-146260.mp3"),
  () => require("./correctaudio.mp3"),
  () => require("./ribhavagrawal-point-smooth-beep-230573.mp3"),
  () => require("./freesound_community-beep-6-96243.mp3"),
];

let _audioUnlocked = false;

/**
 * Call once from a direct user-gesture handler (button press) to unblock
 * mobile browser autoplay policy for all MP3 audio elements. Safe to call
 * multiple times — only runs once.
 */
export function unlockAudio() {
  if (_audioUnlocked || typeof window === "undefined") return;
  _audioUnlocked = true;
  // Also resume the Web Audio context if suspended.
  const c = getCtx();
  if (c?.state === "suspended") c.resume().catch(() => {});
  // Prime each audio file: play a silent instant then immediately pause.
  // This satisfies the browser's "must originate from user gesture" rule.
  for (const getter of AUDIO_ASSETS) {
    try {
      const mod = getter();
      const src = typeof mod === "string" ? mod : mod?.uri ?? String(mod);
      const a = new Audio(src);
      a.volume = 0;
      a.play().then(() => a.pause()).catch(() => {});
    } catch {}
  }
}
