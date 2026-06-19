import { describe, expect, it } from "vitest";
import { botSubmission, makeRoster } from "../bots";
import { makeRng } from "../rng";
import { validateListEntries } from "../validation";
import type { ListQuestion, MCQuestion, Player } from "../types";

const player = (skill: number): Player => ({
  id: "x",
  kind: "bot",
  name: "x",
  avatar: { seed: "s", style: "y" },
  skill,
  status: "active",
});

const mcQ: MCQuestion = {
  id: "R1-01",
  round: 1,
  type: "multiple_choice",
  category: "C",
  question: "?",
  options: ["A", "B", "C", "D"],
  answer: "A",
};

const listQ: ListQuestion = {
  id: "F-01",
  round: "final",
  type: "list",
  prompt: "?",
  timeSec: 20,
  acceptable: ["Dog", "Cat", "Bird", "Fish", "Frog", "Bear", "Bat", "Bee"],
  totalPossible: 8,
};

function mcCorrectRate(skill: number, seed: number, n = 800): number {
  const rng = makeRng(seed);
  let correct = 0;
  for (let i = 0; i < n; i++) {
    const s = botSubmission(player(skill), mcQ, rng, 15_000);
    if (s.submittedAtMs !== undefined && s.value === mcQ.answer) correct++;
  }
  return correct / n;
}

describe("bots", () => {
  it("makeRoster builds 1 human + 4 bots, deterministically", () => {
    const players = makeRoster(makeRng(1));
    expect(players).toHaveLength(5);
    expect(players[0].kind).toBe("human");
    expect(players.filter((p) => p.kind === "bot")).toHaveLength(4);
    expect(makeRoster(makeRng(1))).toEqual(makeRoster(makeRng(1)));
  });

  it("botSubmission is deterministic given the same seed", () => {
    const a = botSubmission(player(0.5), mcQ, makeRng(5), 15_000);
    const b = botSubmission(player(0.5), mcQ, makeRng(5), 15_000);
    expect(a).toEqual(b);
  });

  it("higher skill answers correctly more often (MC)", () => {
    expect(mcCorrectRate(0.9, 1)).toBeGreaterThan(mcCorrectRate(0.1, 1));
  });

  it("list submission yields a valid-countable array within the prompt's total", () => {
    const s = botSubmission(player(0.8), listQ, makeRng(3), 20_000);
    expect(Array.isArray(s.value)).toBe(true);
    const { validCount } = validateListEntries(listQ, s.value as string[]);
    expect(validCount).toBeGreaterThanOrEqual(0);
    expect(validCount).toBeLessThanOrEqual(listQ.totalPossible as number);
  });
});
