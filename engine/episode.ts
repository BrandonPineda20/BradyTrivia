/**
 * Episode orchestration (spec §4, §4.8) — the headless, all-simulated driver
 * that plays a full *Last One Standing* episode deterministically from a seed.
 *
 * Flow: lobby → R1 → R2 → R3 → final → results, producing exactly one champion
 * and placements 1–5. The live UI (M3) reuses runEliminationRound with a submit
 * function that injects real human input; this module is the engine's source of
 * truth and the basis for the unit tests + sim harness.
 */
import { ROUND_TIMERS_MS, SUDDEN_DEATH_MS, type DifficultyLevel } from "./config";
import { botSubmission, makeRoster } from "./bots";
import { runEliminationRound, type SubmitFn } from "./elimination";
import { makeRng } from "./rng";
import { resolveFinalPrompt } from "./scoring";
import type {
  EpisodeResult,
  FinalLog,
  ListQuestion,
  MCQuestion,
  NumericQuestion,
  Player,
  RoundLog,
} from "./types";

export type EpisodeContent = {
  round1: MCQuestion[];
  round2: MCQuestion[];
  round3: NumericQuestion[];
  final: ListQuestion[];
};

export type EpisodeConfig = {
  seed: number;
  content: EpisodeContent;
  difficulty?: DifficultyLevel;
  humanName?: string;
  humanSkill?: number;
  supplements?: Record<string, string[]>;
};

function runFinal(
  finalists: [string, string],
  prompts: ListQuestion[],
  rng: ReturnType<typeof makeRng>,
  byId: Map<string, Player>,
  supplements?: Record<string, string[]>,
): FinalLog {
  const log: FinalLog["prompts"] = [];
  let pi = 0;
  let suddenDeath = false;
  let championId: string | null = null;

  while (championId === null) {
    if (pi >= prompts.length) {
      // Extreme fallback (shouldn't happen with 50 prompts): break the tie by RNG.
      championId = rng.pick(finalists);
      break;
    }
    const q = prompts[pi++];
    const timerMs = suddenDeath ? SUDDEN_DEATH_MS : q.timeSec * 1000;
    const promptForBots = suddenDeath ? { ...q, timeSec: SUDDEN_DEATH_MS / 1000 } : q;
    const raws = finalists.map((id) =>
      botSubmission(byId.get(id)!, promptForBots, rng, timerMs, supplements),
    );
    const res = resolveFinalPrompt(q, raws, { supplements, suddenDeath });
    log.push({
      questionId: q.id,
      submissions: res.submissions,
      winnerId: res.winnerId,
      suddenDeath,
    });
    if (res.winnerId) championId = res.winnerId;
    else suddenDeath = true; // tie → next prompt is sudden death (§4.6/§4.7)
  }

  const runnerUpId = finalists.find((id) => id !== championId)!;
  return { round: "final", finalists, prompts: log, championId, runnerUpId };
}

export function runEpisode(cfg: EpisodeConfig): EpisodeResult {
  const rng = makeRng(cfg.seed);
  const players = makeRoster(rng, {
    difficulty: cfg.difficulty,
    humanName: cfg.humanName,
    humanSkill: cfg.humanSkill,
  });
  const byId = new Map(players.map((p) => [p.id, p]));

  const submitWith =
    (timerMs: number): SubmitFn =>
    (q, pool) =>
      pool.map((id) => botSubmission(byId.get(id)!, q, rng, timerMs, cfg.supplements));

  // Randomized question order per round (§4.3); deterministic via seed.
  const q1 = rng.shuffle(cfg.content.round1);
  const q2 = rng.shuffle(cfg.content.round2);
  const q3 = rng.shuffle(cfg.content.round3);
  const qf = rng.shuffle(cfg.content.final);

  const rounds: RoundLog[] = [];
  const r1 = runEliminationRound({
    round: 1,
    questions: q1,
    pool: players.map((p) => p.id),
    submit: submitWith(ROUND_TIMERS_MS[1]),
  });
  rounds.push(r1);

  const r2 = runEliminationRound({
    round: 2,
    questions: q2,
    pool: r1.advanced,
    submit: submitWith(ROUND_TIMERS_MS[2]),
  });
  rounds.push(r2);

  const r3 = runEliminationRound({
    round: 3,
    questions: q3,
    pool: r2.advanced,
    submit: submitWith(ROUND_TIMERS_MS[3]),
  });
  rounds.push(r3);

  const finalists = r3.advanced as [string, string];
  const final = runFinal(finalists, qf, rng, byId, cfg.supplements);

  // Placements (§4.8): 5th = first out (R1) … 1st = champion.
  const placements: Record<string, number> = {
    [r1.eliminatedId]: 5,
    [r2.eliminatedId]: 4,
    [r3.eliminatedId]: 3,
    [final.runnerUpId]: 2,
    [final.championId]: 1,
  };
  for (const p of players) {
    p.placement = placements[p.id];
    p.status = p.id === final.championId ? "advanced" : "eliminated";
  }

  return {
    seed: cfg.seed,
    players,
    rounds,
    final,
    championId: final.championId,
    placements,
  };
}
