import { describe, expect, it } from "vitest";
import { clamp, lerp, makeRng } from "../rng";

describe("rng", () => {
  it("is deterministic for a given seed", () => {
    const a = makeRng(123);
    const b = makeRng(123);
    const seqA = Array.from({ length: 10 }, () => a.next());
    const seqB = Array.from({ length: 10 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("produces different streams for different seeds", () => {
    const a = makeRng(1);
    const b = makeRng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it("next() stays in [0,1)", () => {
    const r = makeRng(42);
    for (let i = 0; i < 1000; i++) {
      const n = r.next();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("int() is inclusive on both ends", () => {
    const r = makeRng(7);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(r.int(1, 3));
    expect([...seen].sort()).toEqual([1, 2, 3]);
  });

  it("shuffle() is a permutation and does not mutate input", () => {
    const r = makeRng(9);
    const input = [1, 2, 3, 4, 5];
    const out = r.shuffle(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("lerp + clamp helpers", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-3, 0, 10)).toBe(0);
  });
});
