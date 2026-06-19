import { describe, expect, it } from "vitest";
import { runEliminationRound, type SubmitFn } from "../elimination";
import type { MCQuestion } from "../types";

const q = (id: string): MCQuestion => ({
  id,
  round: 1,
  type: "multiple_choice",
  category: "C",
  question: "?",
  options: ["A", "B", "C", "D"],
  answer: "A",
});

const questions = Array.from({ length: 20 }, (_, i) => q(`R1-${i}`));

describe("runEliminationRound (§4.2)", () => {
  it("5 players → 4 advance, 1 eliminated; winner is fastest-correct each question", () => {
    // pool[0] answers correct + fastest every question, so it advances first, etc.
    const submit: SubmitFn = (question, pool) =>
      pool.map((id, idx) => ({
        playerId: id,
        questionId: question.id,
        value: idx === 0 ? "A" : "B", // only the head of the pool is correct
        submittedAtMs: 1000 + idx * 100,
      }));

    const log = runEliminationRound({
      round: 1,
      questions,
      pool: ["a", "b", "c", "d", "e"],
      submit,
    });

    expect(log.advanced).toEqual(["a", "b", "c", "d"]);
    expect(log.eliminatedId).toBe("e");
    expect(log.questions).toHaveLength(4); // one decisive question per advance
  });

  it("a question with no correct answer leaves the pool unchanged", () => {
    let call = 0;
    const submit: SubmitFn = (question, pool) => {
      call++;
      // First question: everyone wrong (no winner). After that: head correct.
      return pool.map((id, idx) => ({
        playerId: id,
        questionId: question.id,
        value: call === 1 ? "B" : idx === 0 ? "A" : "B",
        submittedAtMs: 1000 + idx,
      }));
    };

    const log = runEliminationRound({
      round: 1,
      questions,
      pool: ["a", "b"],
      submit,
    });

    expect(log.questions[0].winnerId).toBeNull(); // whiffed question
    expect(log.advanced).toEqual(["a"]);
    expect(log.eliminatedId).toBe("b");
  });
});
