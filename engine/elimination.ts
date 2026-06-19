/**
 * The unified elimination rule for Rounds 1–3 (spec §4.2).
 *
 * A round runs a sequence of questions over a pool of remaining players:
 * each question's winner ADVANCES and leaves the pool; questions with no winner
 * leave the pool unchanged; when one player remains, that last player is
 * eliminated. Pure: how submissions are produced is injected via `submit`, so
 * the same loop drives the headless sim (M2) and the live UI (M3).
 */
import { resolveQuestion } from "./scoring";
import type {
  MCQuestion,
  NumericQuestion,
  QuestionResult,
  RawSubmission,
  RoundId,
  RoundLog,
} from "./types";

/** Collects every active player's submission for one question. */
export type SubmitFn = (
  question: MCQuestion | NumericQuestion,
  activePool: string[],
) => RawSubmission[];

export function runEliminationRound(params: {
  round: RoundId;
  questions: (MCQuestion | NumericQuestion)[];
  pool: string[]; // active player ids at round start
  submit: SubmitFn;
}): RoundLog {
  const { round, questions, pool: startingPool, submit } = params;
  let pool = [...startingPool];
  const advanced: string[] = [];
  const results: QuestionResult[] = [];

  let qi = 0;
  while (pool.length > 1) {
    if (qi >= questions.length) {
      throw new Error(
        `Round ${round} ran out of questions (pool still ${pool.length}).`,
      );
    }
    const q = questions[qi++];
    const result = resolveQuestion(q, submit(q, pool));
    results.push(result);
    if (result.winnerId) {
      advanced.push(result.winnerId);
      pool = pool.filter((id) => id !== result.winnerId);
    }
    // No winner → pool unchanged, pull the next question (§4.2 step 6).
  }

  // Exactly one player remains → eliminated by being last (§4.2 step 7).
  return { round, startingPool, questions: results, advanced, eliminatedId: pool[0] };
}
