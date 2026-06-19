/**
 * Bots — the core illusion (spec §5.2). Roster generation + skill-driven,
 * believably-jittered submissions for each round type. Fully deterministic given
 * the Rng, never instantaneous/identical (§5.2 "important" note).
 */
import {
  BOT_SKILL,
  DEFAULT_HUMAN_SKILL,
  LIST,
  LOBBY_SIZE,
  MC,
  NUMERIC,
  type DifficultyLevel,
} from "./config";
import { BOT_NAMES } from "./names";
import { clamp, lerp, type Rng } from "./rng";
import type {
  AvatarConfig,
  ListQuestion,
  MCQuestion,
  NumericQuestion,
  Player,
  RawSubmission,
} from "./types";

type AnyQ = MCQuestion | NumericQuestion | ListQuestion;
type RawCore = { value: string | number | string[]; submittedAtMs?: number };

function avatarFor(rng: Rng): AvatarConfig {
  return { seed: `av-${rng.int(1, 1_000_000_000)}`, style: "avataaars" };
}

export type RosterOptions = {
  difficulty?: DifficultyLevel;
  humanName?: string;
  /** Simulated-human skill (real play ignores this and uses real input). */
  humanSkill?: number;
  /** The human's customized avatar (from the profile); falls back to a random one. */
  humanAvatar?: AvatarConfig;
  includeHuman?: boolean; // default true
};

/** Build the 5-player lobby: 1 human + 4 bots (§5.1). */
export function makeRoster(rng: Rng, opts: RosterOptions = {}): Player[] {
  const difficulty = opts.difficulty ?? "normal";
  const { mean, spread } = BOT_SKILL[difficulty];
  const players: Player[] = [];

  if (opts.includeHuman !== false) {
    players.push({
      id: "human",
      kind: "human",
      name: opts.humanName ?? "You",
      avatar: opts.humanAvatar ?? avatarFor(rng),
      skill: opts.humanSkill ?? DEFAULT_HUMAN_SKILL,
      status: "active",
    });
  }

  const names = rng.shuffle(BOT_NAMES);
  const botCount = LOBBY_SIZE - players.length;
  for (let i = 0; i < botCount; i++) {
    players.push({
      id: `bot-${i + 1}`,
      kind: "bot",
      name: names[i] ?? `Bot ${i + 1}`,
      avatar: avatarFor(rng),
      skill: clamp(rng.gaussian(mean, spread), 0.28, 0.92),
      status: "active",
    });
  }
  return players;
}

// ── Per-round behavior ──────────────────────────────────────────────────────

function mcCore(skill: number, q: MCQuestion, rng: Rng, timerMs: number): RawCore {
  const pTimeout = clamp(MC.timeoutBase + MC.timeoutSlope * (1 - skill), 0, 0.5);
  const mean = lerp(MC.latencySlowMs, MC.latencyFastMs, skill);
  const latency = clamp(
    Math.round(rng.gaussian(mean, mean * MC.latencyJitter)),
    350,
    timerMs + 2500,
  );
  const timedOut = rng.chance(pTimeout) || latency > timerMs;
  const pCorrect = clamp(
    MC.correctBase + MC.correctSlope * skill,
    MC.correctFloor,
    MC.correctCeil,
  );
  const correct = rng.chance(pCorrect);
  const wrong = q.options.filter((o) => o !== q.answer);
  const value = correct ? q.answer : rng.pick(wrong.length ? wrong : q.options);
  return { value, submittedAtMs: timedOut ? undefined : latency };
}

function numericCore(
  skill: number,
  q: NumericQuestion,
  rng: Rng,
  timerMs: number,
): RawCore {
  const isYear =
    q.category.toLowerCase() === "year" || q.unit.toLowerCase() === "year";
  let guess: number;
  if (isYear) {
    const sd = lerp(NUMERIC.yearErrWide, NUMERIC.yearErrTight, skill);
    guess = Math.round(q.answer + rng.gaussian(0, sd));
  } else {
    const rel = lerp(NUMERIC.relErrWide, NUMERIC.relErrTight, skill);
    guess = q.answer * (1 + rng.gaussian(0, rel));
    guess = Math.abs(q.answer) >= 100 ? Math.round(guess) : Math.round(guess * 100) / 100;
    if (guess < 0 && q.answer >= 0) guess = Math.abs(guess); // keep plausible
  }
  const mean = lerp(NUMERIC.latencySlowMs, NUMERIC.latencyFastMs, skill);
  const latency = clamp(
    Math.round(rng.gaussian(mean, mean * NUMERIC.latencyJitter)),
    500,
    timerMs + 1500,
  );
  return { value: guess, submittedAtMs: latency > timerMs ? undefined : latency };
}

function listCore(
  skill: number,
  q: ListQuestion,
  rng: Rng,
  supplements?: Record<string, string[]>,
): RawCore {
  const pool = [...q.acceptable];
  if (q.totalPossible === "open" && q.openDictionaryKey) {
    pool.push(...(supplements?.[q.openDictionaryKey] ?? []));
  }

  let target: number;
  if (q.totalPossible === "open") {
    target = Math.round(rng.gaussian(lerp(LIST.openLow, LIST.openHigh, skill), LIST.jitter));
  } else {
    const total = q.totalPossible;
    target = Math.round(
      total * (LIST.closedBase + LIST.closedSlope * skill) + rng.gaussian(0, LIST.jitter),
    );
  }
  target = clamp(target, 0, pool.length);

  const entries = rng.shuffle(pool).slice(0, target);
  // Light realism: an occasional duplicate or junk entry (don't count, don't penalize).
  if (entries.length && rng.chance(0.18)) entries.splice(rng.int(0, entries.length), 0, entries[0]);
  if (rng.chance(0.12)) entries.push("zzqx");

  // Finalists use their whole window — never a "timeout" (an empty list is allowed).
  return { value: entries, submittedAtMs: q.timeSec * 1000 };
}

/** Produce one player's submission for any round type. Sets playerId/questionId. */
export function botSubmission(
  player: Player,
  question: AnyQ,
  rng: Rng,
  timerMs: number,
  supplements?: Record<string, string[]>,
): RawSubmission {
  const skill = player.skill ?? 0.5;
  let core: RawCore;
  if (question.type === "numeric") core = numericCore(skill, question, rng, timerMs);
  else if (question.type === "list") core = listCore(skill, question, rng, supplements);
  else core = mcCore(skill, question, rng, timerMs);
  return {
    playerId: player.id,
    questionId: question.id,
    value: core.value,
    submittedAtMs: core.submittedAtMs,
  };
}
