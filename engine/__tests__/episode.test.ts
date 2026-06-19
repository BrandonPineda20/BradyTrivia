import { describe, expect, it } from "vitest";
import { runEpisode, type EpisodeContent } from "../episode";
import type { ListQuestion, MCQuestion, NumericQuestion } from "../types";

function fakeContent(): EpisodeContent {
  const mk = <T>(n: number, fn: (i: number) => T) =>
    Array.from({ length: n }, (_, i) => fn(i));
  return {
    round1: mk<MCQuestion>(50, (i) => ({
      id: `R1-${i}`,
      round: 1,
      type: "multiple_choice",
      category: "C",
      question: "?",
      options: ["A", "B", "C", "D"],
      answer: "A",
    })),
    round2: mk<MCQuestion>(50, (i) => ({
      id: `R2-${i}`,
      round: 2,
      type: "multiple_choice",
      category: "Zoomed Flag",
      question: "?",
      options: ["A", "B", "C", "D"],
      answer: "B",
      asset: { kind: "none", describes: "" },
    })),
    round3: mk<NumericQuestion>(50, (i) => ({
      id: `R3-${i}`,
      round: 3,
      type: "numeric",
      category: "Count",
      question: "?",
      answer: 100 + i,
      unit: "things",
    })),
    final: mk<ListQuestion>(50, (i) => ({
      id: `F-${i}`,
      round: "final",
      type: "list",
      prompt: "?",
      timeSec: 20,
      acceptable: ["Dog", "Cat", "Bird", "Fish", "Frog", "Bear", "Bat", "Bee"],
      totalPossible: 8,
    })),
  };
}

describe("runEpisode (§4, §4.8)", () => {
  const content = fakeContent();

  it("is fully deterministic given a seed", () => {
    const a = runEpisode({ seed: 99, content });
    const b = runEpisode({ seed: 99, content });
    expect(a.championId).toBe(b.championId);
    expect(a.placements).toEqual(b.placements);
  });

  it("produces exactly one champion and unique placements 1–5", () => {
    const r = runEpisode({ seed: 7, content });
    expect(r.players).toHaveLength(5);
    const places = Object.values(r.placements).sort();
    expect(places).toEqual([1, 2, 3, 4, 5]);
    expect(r.placements[r.championId]).toBe(1);
    const champs = r.players.filter((p) => p.placement === 1);
    expect(champs).toHaveLength(1);
    expect(champs[0].id).toBe(r.championId);
  });

  it("the game is winnable but not guaranteed for the human (§5.2)", () => {
    const seeds = 200;
    let humanWins = 0;
    const placementsSeen = new Set<number>();
    for (let s = 0; s < seeds; s++) {
      const r = runEpisode({ seed: s, content });
      if (r.championId === "human") humanWins++;
      placementsSeen.add(r.placements["human"]);
    }
    expect(humanWins).toBeGreaterThan(0); // can win
    expect(humanWins).toBeLessThan(seeds); // not always
    expect(placementsSeen.size).toBeGreaterThan(1); // finishes at varied placements
  });
});
