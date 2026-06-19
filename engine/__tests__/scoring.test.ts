import { describe, expect, it } from "vitest";
import {
  resolveFinalPrompt,
  resolveMcQuestion,
  resolveNumericQuestion,
} from "../scoring";
import type { ListQuestion, MCQuestion, NumericQuestion, RawSubmission } from "../types";

const mcQ: MCQuestion = {
  id: "R1-01",
  round: 1,
  type: "multiple_choice",
  category: "Geo",
  question: "?",
  options: ["A", "B", "C", "D"],
  answer: "B",
};

const sub = (
  playerId: string,
  value: RawSubmission["value"],
  submittedAtMs?: number,
): RawSubmission => ({ playerId, questionId: mcQ.id, value, submittedAtMs });

describe("resolveMcQuestion (fastest correct, §4.2)", () => {
  it("earliest correct submission wins; a faster wrong answer does not", () => {
    const r = resolveMcQuestion(mcQ, [
      sub("p1", "B", 3000),
      sub("p2", "B", 1500), // earliest correct
      sub("p3", "A", 500), // fast but wrong
    ]);
    expect(r.winnerId).toBe("p2");
  });

  it("no correct answer → no winner", () => {
    const r = resolveMcQuestion(mcQ, [sub("p1", "A", 800), sub("p2", "C", 900)]);
    expect(r.winnerId).toBeNull();
  });

  it("a correct value submitted as a timeout cannot win", () => {
    const r = resolveMcQuestion(mcQ, [sub("p1", "B", undefined)]);
    expect(r.winnerId).toBeNull();
    expect(r.submissions[0].correct).toBe(false);
  });
});

const numQ: NumericQuestion = {
  id: "R3-01",
  round: 3,
  type: "numeric",
  category: "Count",
  question: "?",
  answer: 1000,
  unit: "things",
};

describe("resolveNumericQuestion (closest, §4.2/§4.7)", () => {
  it("smallest absolute distance wins", () => {
    const r = resolveNumericQuestion(numQ, [
      { playerId: "p1", questionId: numQ.id, value: 900, submittedAtMs: 2000 },
      { playerId: "p2", questionId: numQ.id, value: 1300, submittedAtMs: 1000 },
    ]);
    expect(r.winnerId).toBe("p1");
  });

  it("distance ties break by earlier submission time", () => {
    const r = resolveNumericQuestion(numQ, [
      { playerId: "p1", questionId: numQ.id, value: 1100, submittedAtMs: 2000 },
      { playerId: "p2", questionId: numQ.id, value: 900, submittedAtMs: 1000 },
    ]);
    expect(r.winnerId).toBe("p2");
  });

  it("timeouts cannot win; all timed out → no winner", () => {
    const r = resolveNumericQuestion(numQ, [
      { playerId: "p1", questionId: numQ.id, value: 999, submittedAtMs: undefined },
      { playerId: "p2", questionId: numQ.id, value: 1001, submittedAtMs: undefined },
    ]);
    expect(r.winnerId).toBeNull();
  });
});

const listQ: ListQuestion = {
  id: "F-01",
  round: "final",
  type: "list",
  prompt: "?",
  timeSec: 20,
  acceptable: ["Dog", "Cat", "Bird"],
  totalPossible: 3,
};

describe("resolveFinalPrompt (higher valid count, §4.6)", () => {
  it("higher valid count wins", () => {
    const r = resolveFinalPrompt(listQ, [
      { playerId: "a", questionId: listQ.id, value: ["Dog", "Cat"], submittedAtMs: 20000 },
      { playerId: "b", questionId: listQ.id, value: ["Dog"], submittedAtMs: 20000 },
    ]);
    expect(r.winnerId).toBe("a");
  });

  it("equal counts tie → null (triggers sudden death)", () => {
    const r = resolveFinalPrompt(listQ, [
      { playerId: "a", questionId: listQ.id, value: ["Dog"], submittedAtMs: 20000 },
      { playerId: "b", questionId: listQ.id, value: ["Cat"], submittedAtMs: 20000 },
    ]);
    expect(r.winnerId).toBeNull();
  });
});
