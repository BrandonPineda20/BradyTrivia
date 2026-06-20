/**
 * Core engine data models (spec §12), refined for implementation.
 * Question shapes come from the content layer (§8.3); the engine is content-agnostic
 * and never imports the baked JSON — questions are passed in.
 */
import type { ListQuestion, MCQuestion, NumericQuestion } from "../content/types";

export type RoundId = 1 | 2 | 3 | "final";

export type PlayerKind = "human" | "bot";
export type PlayerStatus = "active" | "advanced" | "eliminated" | "spectating";

/** Parametric avatar config (§6.1): seed + optional flat selection (human's
 *  customized look). Bots pass just a seed; the sprite renderer derives their
 *  look deterministically from it. */
export type AvatarConfig = {
  seed: string;
  style?: string;
  options?: Record<string, unknown>;
  /** Flat key→value selection used by the sprite renderer. */
  selection?: Record<string, string>;
};

export type Player = {
  id: string;
  kind: PlayerKind;
  name: string;
  avatar: AvatarConfig;
  /** Bots only, 0..1 — drives believable behavior (§5.2). */
  skill?: number;
  status: PlayerStatus;
  /** 1..5, assigned at episode end (§4.8). */
  placement?: number;
};

/** What a player hands in for one question, before scoring. */
export type RawSubmission = {
  playerId: string;
  questionId: string;
  /** tap option (string) | numeric guess (number) | list entries (string[]). */
  value: string | number | string[];
  /** ms since the question was shown; undefined = timeout / no submission. */
  submittedAtMs?: number;
};

/** A submission enriched by the scorer (the single source of truth for correctness). */
export type ScoredSubmission = RawSubmission & {
  correct?: boolean; // R1/R2
  distance?: number; // R3 (|guess − answer|); Infinity for timeouts/invalid
  validCount?: number; // final
  validEntries?: string[]; // final — for side-by-side reveal
};

export type QuestionResult = {
  questionId: string;
  round: RoundId;
  /** The player who advances this question, or null if no one won (§4.2 step 6). */
  winnerId: string | null;
  submissions: ScoredSubmission[];
};

/** Log of one elimination round (R1–R3). */
export type RoundLog = {
  round: RoundId;
  /** Player ids in the pool when the round started. */
  startingPool: string[];
  questions: QuestionResult[];
  advanced: string[]; // winners, in advance order
  eliminatedId: string; // the last one left (§4.2 step 7)
};

/** Log of the final list battle (§4.6). */
export type FinalLog = {
  round: "final";
  finalists: [string, string];
  /** One entry per prompt played (sudden death appends more). */
  prompts: {
    questionId: string;
    submissions: ScoredSubmission[];
    winnerId: string | null; // null only on a tie that triggers sudden death
    suddenDeath: boolean;
  }[];
  championId: string;
  runnerUpId: string;
};

export type EpisodePhase =
  | "lobby"
  | "round"
  | "transition"
  | "spectating"
  | "results";

export type EpisodeResult = {
  seed: number;
  players: Player[]; // final state, with placements
  rounds: RoundLog[]; // R1–R3
  final: FinalLog;
  championId: string;
  /** playerId -> placement (1..5). */
  placements: Record<string, number>;
};

/** Round-type question unions the engine consumes. */
export type { MCQuestion, NumericQuestion, ListQuestion };
