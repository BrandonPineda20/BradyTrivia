/**
 * Seedable deterministic PRNG (spec §11.3 "determinism for demos").
 *
 * A given seed always reproduces the same episode, so the demo can be tuned to
 * be reliably fun and the rules are unit-testable. Uses mulberry32 — tiny, fast,
 * good enough statistical quality for game/bot jitter.
 */

export type Rng = {
  /** Next float in [0, 1). */
  next: () => number;
  /** Integer in [min, max] inclusive. */
  int: (min: number, max: number) => number;
  /** Float in [min, max). */
  float: (min: number, max: number) => number;
  /** True with probability p. */
  chance: (p: number) => boolean;
  /** Uniformly pick one element. */
  pick: <T>(arr: readonly T[]) => T;
  /** New array, Fisher–Yates shuffled (does not mutate input). */
  shuffle: <T>(arr: readonly T[]) => T[];
  /** Sample from a normal distribution (Box–Muller). */
  gaussian: (mean: number, stdDev: number) => number;
  /** The raw seed this Rng was created with. */
  readonly seed: number;
};

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const float = (min: number, max: number) => min + next() * (max - min);
  const int = (min: number, max: number) => Math.floor(float(min, max + 1));
  const chance = (p: number) => next() < p;
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)];
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const gaussian = (mean: number, stdDev: number) => {
    // Box–Muller; guard against log(0).
    const u1 = next() || Number.MIN_VALUE;
    const u2 = next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stdDev;
  };

  return { next, int, float, chance, pick, shuffle, gaussian, seed };
}

/** Linear interpolation — handy for mapping skill (0..1) onto a tuning range. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Clamp a number into [min, max]. */
export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
