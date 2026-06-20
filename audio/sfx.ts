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

export function playSfx(name: Sfx) {
  if (useSettingsStore.getState().muted) return;
  const c = audioCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const t = c.currentTime;
  switch (name) {
    case "lockIn":
      tone(c, 680, t, 0.08, "triangle", 0.1);
      break;
    case "tick":
      tone(c, 900, t, 0.04, "square", 0.05);
      break;
    case "correct":
      [523.25, 659.25, 783.99].forEach((f, i) => tone(c, f, t + i * 0.08, 0.13, "sine", 0.14));
      break;
    case "wrong":
      tone(c, 160, t, 0.32, "square", 0.12);
      tone(c, 120, t + 0.04, 0.32, "square", 0.1);
      break;
    case "advance":
      sweep(c, 320, 880, t, 0.25, "sine");
      break;
    case "eliminate":
      sweep(c, 520, 110, t, 0.45, "sawtooth");
      break;
    case "champion":
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, f, t + i * 0.12, 0.26, "sine", 0.16));
      break;
    case "tap":
      // Bubbly "bloop": a soft sine pops up an octave, with a faint higher shimmer
      // riding on top for a satisfying, gentle, watery click.
      bubble(c, 380, 720, t, 0.16, 0.085);
      bubble(c, 740, 1180, t + 0.012, 0.1, 0.022);
      break;
  }
}
