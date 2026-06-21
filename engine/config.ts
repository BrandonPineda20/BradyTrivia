/**
 * Engine tuning constants. Centralized so the demo can be tuned to feel
 * "tense, winnable" (§5.2) without hunting through logic.
 */
import type { RoundId } from "./types";

/** Per-question timers (§4.1), in milliseconds. */
export const ROUND_TIMERS_MS: Record<RoundId, number> = {
  1: 15_000,
  2: 15_000,
  3: 10_000,
  final: 20_000,
};

/** Sudden-death final prompt uses a shorter timer (§4.6 / §4.7). */
export const SUDDEN_DEATH_MS = 15_000;

export const LOBBY_SIZE = 5; // 1 human + 4 bots (§5.1)

export type DifficultyLevel = "easy" | "normal" | "hard";

/**
 * Bot skill is sampled per bot around a difficulty-dependent mean (§5.2).
 * Biased so the human wins a meaningful fraction but not always.
 */
export const BOT_SKILL: Record<DifficultyLevel, { mean: number; spread: number }> = {
  easy: { mean: 0.38, spread: 0.16 },
  normal: { mean: 0.52, spread: 0.18 },
  hard: { mean: 0.68, spread: 0.16 },
};

/** Default skill assigned to a simulated human (real play uses real input). */
export const DEFAULT_HUMAN_SKILL = 0.6;

/** Multiple-choice behavior (R1/R2). */
export const MC = {
  /** P(correct) = base + slope*skill, clamped to [floor, ceil].
   *  Tuned so even the weakest bot visibly answers correctly a good chunk of the
   *  time — the lobby should read as competent players, not random guessers (§5.2). */
  correctBase: 0.4,
  correctSlope: 0.55,
  correctFloor: 0.4,
  correctCeil: 0.95,
  /** Tap latency mean (ms) interpolates fast↔slow by skill; jitter is a fraction of mean. */
  latencyFastMs: 1_700,
  latencySlowMs: 7_200,
  latencyJitter: 0.28,
  /** A timeout (no tap before the timer) becomes more likely at very low skill. */
  timeoutBase: 0.02,
  timeoutSlope: 0.12, // extra timeout chance at skill 0
} as const;

/** Numeric estimate behavior (R3). */
export const NUMERIC = {
  /** Relative error fraction interpolates wide↔tight by skill (used for large magnitudes). */
  relErrWide: 0.55,
  relErrTight: 0.06,
  /** "Year" questions use an absolute error in years instead of relative. */
  yearErrWide: 28,
  yearErrTight: 2,
  latencyFastMs: 2_000,
  latencySlowMs: 8_500,
  latencyJitter: 0.25,
} as const;

/** Name-as-many behavior (final). */
export const LIST = {
  /** For closed prompts: target ≈ total * (base + slope*skill). */
  closedBase: 0.12,
  closedSlope: 0.5,
  /** For open prompts: target interpolates low↔high by skill. */
  openLow: 2,
  openHigh: 9,
  /** Jitter (stdDev) on the target count. */
  jitter: 1.4,
} as const;
