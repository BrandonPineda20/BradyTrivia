/**
 * Per-question scoring + winner resolution (spec §4.2, §4.6, §4.7).
 *
 * The scorer is the single source of truth: it recomputes correctness/distance/
 * validCount from each player's raw `value`, so humans and bots are judged the
 * same way regardless of any pre-baked fields.
 */
import type {
  ListQuestion,
  MCQuestion,
  NumericQuestion,
  QuestionResult,
  RawSubmission,
  ScoredSubmission,
} from "./types";
import {
  isMcCorrect,
  numericDistance,
  parseNumericInput,
  validateListEntries,
} from "./validation";

export function scoreMc(q: MCQuestion, raw: RawSubmission): ScoredSubmission {
  const value = typeof raw.value === "string" ? raw.value : String(raw.value);
  const correct = raw.submittedAtMs !== undefined && isMcCorrect(q, value);
  return { ...raw, correct };
}

export function scoreNumeric(q: NumericQuestion, raw: RawSubmission): ScoredSubmission {
  if (raw.submittedAtMs === undefined) return { ...raw, distance: Infinity };
  const guess =
    typeof raw.value === "number" ? raw.value : parseNumericInput(String(raw.value));
  const distance = guess === null ? Infinity : numericDistance(q.answer, guess);
  return { ...raw, distance };
}

export function scoreList(
  q: ListQuestion,
  raw: RawSubmission,
  supplements?: Record<string, string[]>,
): ScoredSubmission {
  const entries = Array.isArray(raw.value) ? raw.value : [String(raw.value)];
  const { valid, validCount } = validateListEntries(q, entries, supplements);
  return { ...raw, validCount, validEntries: valid };
}

/**
 * R1/R2 (§4.2): the winner is the earliest *correct* submission. Wrong answers
 * never eliminate. No correct submission → no winner (null).
 */
export function resolveMcQuestion(q: MCQuestion, raws: RawSubmission[]): QuestionResult {
  const submissions = raws.map((r) => scoreMc(q, r));
  const correct = submissions
    .filter((s) => s.correct && s.submittedAtMs !== undefined)
    .sort((a, b) => a.submittedAtMs! - b.submittedAtMs!);
  return {
    questionId: q.id,
    round: q.round,
    winnerId: correct.length ? correct[0].playerId : null,
    submissions,
  };
}

/**
 * R3 (§4.2, §4.7): the winner has the smallest absolute distance; ties break by
 * earlier submission time. Timeouts (distance = Infinity) can't win. All timed
 * out → no winner (null).
 */
export function resolveNumericQuestion(
  q: NumericQuestion,
  raws: RawSubmission[],
): QuestionResult {
  const submissions = raws.map((r) => scoreNumeric(q, r));
  const eligible = submissions
    .filter((s) => s.submittedAtMs !== undefined && Number.isFinite(s.distance ?? Infinity))
    .sort(
      (a, b) => a.distance! - b.distance! || a.submittedAtMs! - b.submittedAtMs!,
    );
  return {
    questionId: q.id,
    round: 3,
    winnerId: eligible.length ? eligible[0].playerId : null,
    submissions,
  };
}

/** Dispatch an R1–R3 question to the right resolver. */
export function resolveQuestion(
  q: MCQuestion | NumericQuestion,
  raws: RawSubmission[],
): QuestionResult {
  return q.type === "numeric"
    ? resolveNumericQuestion(q, raws)
    : resolveMcQuestion(q, raws);
}

export type FinalPromptResult = {
  questionId: string;
  submissions: ScoredSubmission[];
  /** null = tie → sudden death (§4.6, §4.7). */
  winnerId: string | null;
  suddenDeath: boolean;
};

/**
 * Final list battle for one prompt (§4.6): higher valid count wins; equal counts
 * tie and trigger sudden death.
 */
export function resolveFinalPrompt(
  q: ListQuestion,
  raws: RawSubmission[],
  opts: { supplements?: Record<string, string[]>; suddenDeath?: boolean } = {},
): FinalPromptResult {
  const submissions = raws.map((r) => scoreList(q, r, opts.supplements));
  const [a, b] = submissions;
  let winnerId: string | null = null;
  if (a && b) {
    if ((a.validCount ?? 0) > (b.validCount ?? 0)) winnerId = a.playerId;
    else if ((b.validCount ?? 0) > (a.validCount ?? 0)) winnerId = b.playerId;
  }
  return { questionId: q.id, submissions, winnerId, suddenDeath: !!opts.suddenDeath };
}
