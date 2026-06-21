/**
 * Real-time episode controller (M3) — bridges the pure engine (§4.2 rules, bot AI,
 * scoring) to the React UI. It steps through an episode in real time: presents a
 * question, runs a live countdown, collects the human's input, "arrives" bot
 * submissions on a stagger, then reveals (correctness + Brady quote) and advances
 * per §4.2. Driven by a single `tick(now)` from the Play screen so all timing is
 * centralized and deterministic given the seed.
 *
 * Reveal discipline (§7): correctness is held in `reveal` and only populated once
 * a question finalizes — never while answers pend.
 */
import { create } from "zustand";

import {
  ROUND_TIMERS_MS,
  SUDDEN_DEATH_MS,
  botSubmission,
  makeRng,
  makeRoster,
  resolveFinalPrompt,
  resolveQuestion,
  type DifficultyLevel,
  type ListQuestion,
  type MCQuestion,
  type NumericQuestion,
  type AvatarConfig,
  type EpisodeSummary,
  type Player,
  type RawSubmission,
  type Rng,
  type RoundId,
  type ScoredSubmission,
} from "../engine";
import { validateListEntries } from "../engine/validation";
import { bradyLine, MOOD_EXPRESSION, type HostMood } from "../theme/brady-lines";
import type { HostExpression } from "../theme";

type AnyQuestion = MCQuestion | NumericQuestion | ListQuestion;

export type EpisodeContent = {
  round1: MCQuestion[];
  round2: MCQuestion[];
  round3: NumericQuestion[];
  final: ListQuestion[];
};

export type Phase =
  | "idle"
  | "lobby"
  | "round-intro"
  | "question"
  | "reveal"
  | "results";

export type RevealRow = {
  playerId: string;
  display: string; // the player's answer, shown at reveal
  correct?: boolean; // R1/R2
  distance?: number; // R3
  validCount?: number; // final
  isWinner: boolean;
};

export type Reveal = {
  winnerId: string | null;
  rows: RevealRow[];
};

const TIMING = {
  lobbyJoinMs: 560,
  lobbyHoldMs: 1500,
  roundIntroMs: 3200,
  revealHumanMs: 3300,
  revealSpectateMs: 1100,
  spectateQMs: 1500,
};

const HUMAN_ID = "human";
const PLACEMENT_BY_ROUND: Record<Exclude<RoundId, "final">, number> = { 1: 5, 2: 4, 3: 3 };

/** The human's running tally this episode, distilled into an EpisodeSummary at the end. */
type HumanTally = {
  correct: number;
  wrong: number;
  roundsAdvanced: number;
  reachedFinal: boolean;
  wonRound2: boolean;
  finalValid: number;
  finalMaxed: boolean;
  bestEstimatePct?: number;
};

const EMPTY_TALLY: HumanTally = {
  correct: 0,
  wrong: 0,
  roundsAdvanced: 0,
  reachedFinal: false,
  wonRound2: false,
  finalValid: 0,
  finalMaxed: false,
};

/** Fold one revealed question into the human's tally (no-op while spectating). */
function updateTally(prev: HumanTally, q: AnyQuestion, rows: RevealRow[], spectating: boolean): HumanTally {
  if (spectating) return prev;
  const hr = rows.find((r) => r.playerId === HUMAN_ID);
  if (!hr) return prev;
  const t = { ...prev };
  if (q.type === "multiple_choice") {
    if (hr.correct) t.correct++;
    else t.wrong++;
  } else if (q.type === "numeric") {
    if (hr.isWinner) t.correct++;
    else t.wrong++;
    if (hr.distance !== undefined && Number.isFinite(hr.distance)) {
      const pct = Math.abs(q.answer) > 0 ? hr.distance / Math.abs(q.answer) : hr.distance;
      t.bestEstimatePct = t.bestEstimatePct === undefined ? pct : Math.min(t.bestEstimatePct, pct);
    }
  } else if (q.type === "list") {
    t.reachedFinal = true;
    const vc = hr.validCount ?? 0;
    t.finalValid = Math.max(t.finalValid, vc);
    if (typeof q.totalPossible === "number" && vc >= q.totalPossible) t.finalMaxed = true;
  }
  return t;
}

function timerFor(round: RoundId, suddenDeath: boolean) {
  if (round === "final") return suddenDeath ? SUDDEN_DEATH_MS : ROUND_TIMERS_MS.final;
  return ROUND_TIMERS_MS[round];
}

type GameState = {
  // config / engine
  seed: number;
  content: EpisodeContent | null;
  supplements?: Record<string, string[]>;
  rng: Rng | null;

  // roster
  players: Player[];
  placements: Record<string, number>;
  championId: string | null;

  // flow
  phase: Phase;
  round: RoundId;
  pool: string[]; // active player ids this round
  advanced: string[]; // winners this round
  questionNo: number; // within current round (for display)

  // queues
  queues: Record<string, AnyQuestion[]>; // keyed by round
  qIndex: Record<string, number>;

  // current question
  current: AnyQuestion | null;
  questionStartAt: number;
  deadlineAt: number;
  suddenDeath: boolean;

  // live answer collection
  locked: Record<string, RawSubmission>; // submissions arrived/submitted so far
  botSchedule: Record<string, { sub: RawSubmission; arriveMs: number | null }>;
  humanLocked: boolean;
  listEntries: string[]; // human's running list (final)

  // reveal
  reveal: Reveal | null;
  hostExpression: HostExpression;
  hostLine: string;
  hostTint: "neutral" | "correct" | "wrong";

  // misc timing
  phaseStartedAt: number;
  lobbyJoinedCount: number;
  humanEliminated: boolean;

  // final best-of-3
  finalWins: Record<string, number>;

  // progression accumulators (the human's run this episode → §9 summary)
  htally: HumanTally;
  summary: EpisodeSummary | null;
  episodeApplied: boolean;

  // prediction (human picks who will win after being eliminated)
  championPrediction: string | null;
  // pool size at the moment the human was eliminated (voting window closes if pool shrinks further)
  eliminationPoolSize: number | null;

  // actions
  start: (cfg: { seed: number; content: EpisodeContent; difficulty?: DifficultyLevel; humanName?: string; humanAvatar?: AvatarConfig; supplements?: Record<string, string[]> }) => void;
  tick: (now: number) => void;
  submitHuman: (value: string) => void; // MC option text or numeric text
  addListEntry: (text: string) => boolean; // final; returns true if newly valid
  reset: () => void;
  devSkipRound: () => void;
  setChampionPrediction: (id: string) => void;
  markEpisodeApplied: () => void;
  getEarlyLeaveSummary: () => EpisodeSummary;
};

export const useGameStore = create<GameState>((set, get) => {
  /** Resolve the current question, build the reveal, set host mood. */
  function finalize(now: number) {
    const s = get();
    const q = s.current!;
    const rng = s.rng!;
    const spectating = !s.pool.includes(HUMAN_ID);

    // Assemble one submission per pool player (missing = timeout).
    const raws: RawSubmission[] = s.pool.map((id) => {
      if (s.locked[id]) return s.locked[id];
      if (id === HUMAN_ID && q.type === "list") {
        return { playerId: id, questionId: q.id, value: s.listEntries, submittedAtMs: q.timeSec * 1000 };
      }
      return { playerId: id, questionId: q.id, value: "", submittedAtMs: undefined };
    });

    let winnerId: string | null;
    let rows: RevealRow[];

    if (q.type === "list") {
      const res = resolveFinalPrompt(q, raws, { supplements: s.supplements, suddenDeath: s.suddenDeath });
      winnerId = res.winnerId;
      rows = res.submissions.map((sub) => ({
        playerId: sub.playerId,
        display: `${sub.validCount ?? 0} valid`,
        validCount: sub.validCount,
        isWinner: sub.playerId === winnerId,
      }));
    } else {
      const res = resolveQuestion(q, raws);
      winnerId = res.winnerId;
      rows = res.submissions.map((sub) => ({
        playerId: sub.playerId,
        display: answerDisplay(q, sub),
        correct: sub.correct,
        distance: sub.distance,
        isWinner: sub.playerId === winnerId,
      }));
    }

    // Brady mood: reflect the human's outcome if they're playing, else the question's.
    const mood = hostMood(q, rows, winnerId, spectating);
    set({
      phase: "reveal",
      reveal: { winnerId, rows },
      htally: updateTally(s.htally, q, rows, spectating),
      hostExpression: MOOD_EXPRESSION[mood],
      hostLine: bradyLine(mood, rng.next()),
      hostTint: mood === "correct" ? "correct" : mood === "wrong" ? "wrong" : "neutral",
      phaseStartedAt: now,
    });
  }

  /** Apply §4.2 outcome after the reveal, then move to the next question/round/final. */
  function advanceAfterReveal(now: number) {
    const s = get();
    const q = s.current!;
    const rev = s.reveal!;
    const winnerId = rev.winnerId;

    if (q.type === "list") {
      // Final battle — best of 3 (first to 2 wins).
      const finalWins = { ...s.finalWins };
      if (winnerId) {
        finalWins[winnerId] = (finalWins[winnerId] ?? 0) + 1;
      }
      const champion = s.pool.find((id) => (finalWins[id] ?? 0) >= 2) ?? null;
      if (champion) {
        const finalists = s.pool;
        const runnerUp = finalists.find((id) => id !== champion)!;
        const placements = { ...s.placements, [champion]: 1, [runnerUp]: 2 };
        const players = s.players.map((p) => ({
          ...p,
          placement: placements[p.id] ?? p.placement,
          status: p.id === champion ? ("advanced" as const) : ("eliminated" as const),
        }));
        const summary = buildSummary(s.htally, champion === HUMAN_ID, placements[HUMAN_ID] ?? 5);
        set({ phase: "results", championId: champion, placements, players, current: null, summary, finalWins });
      } else {
        // No winner yet — next prompt (sudden death only if both tied at 0 after max rounds).
        set({ finalWins, suddenDeath: !winnerId });
        presentNextQuestion(now);
      }
      return;
    }

    // R1–R3.
    let pool = s.pool;
    let advanced = s.advanced;
    let htally = s.htally;
    if (winnerId) {
      advanced = [...advanced, winnerId];
      pool = pool.filter((id) => id !== winnerId);
      if (winnerId === HUMAN_ID) {
        htally = {
          ...htally,
          roundsAdvanced: Math.min(3, htally.roundsAdvanced + 1),
          wonRound2: htally.wonRound2 || s.round === 2,
        };
      }
    }

    if (pool.length > 1) {
      set({ pool, advanced, htally });
      presentNextQuestion(now);
      return;
    }

    // One remains → eliminated by being last (§4.2 step 7).
    const eliminatedId = pool[0];
    const placement = PLACEMENT_BY_ROUND[s.round as 1 | 2 | 3];
    const placements = { ...s.placements, [eliminatedId]: placement };
    const players = s.players.map((p) => ({
      ...p,
      placement: placements[p.id] ?? p.placement,
      status: p.id === eliminatedId ? ("eliminated" as const) : p.status,
    }));
    const humanEliminated = s.humanEliminated || eliminatedId === HUMAN_ID;
    const eliminationPoolSize =
      eliminatedId === HUMAN_ID ? advanced.length : s.eliminationPoolSize;

    if (eliminatedId === HUMAN_ID && typeof window !== "undefined") {
      const { getEliminateAudio } = require("../audio/sfx");
      const audio = getEliminateAudio();
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    }

    if (s.round === 3) {
      // Two advance → final.
      set({
        players,
        placements,
        advanced,
        humanEliminated,
        eliminationPoolSize,
        htally,
        pool: advanced,
        round: "final",
        suddenDeath: false,
        finalWins: {},
        phase: "round-intro",
        phaseStartedAt: now,
        questionNo: 0,
      });
    } else {
      const nextRound = (s.round === 1 ? 2 : 3) as RoundId;
      set({
        players,
        placements,
        advanced: [],
        humanEliminated,
        eliminationPoolSize,
        htally,
        pool: advanced,
        round: nextRound,
        phase: "round-intro",
        phaseStartedAt: now,
        questionNo: 0,
      });
    }
  }

  function buildSummary(tally: HumanTally, won: boolean, placement: number): EpisodeSummary {
    return {
      placement,
      won,
      correct: tally.correct,
      wrong: tally.wrong,
      roundsAdvanced: tally.roundsAdvanced,
      reachedFinal: tally.reachedFinal,
      wonRound2: tally.wonRound2,
      finalValid: tally.finalValid,
      finalMaxed: tally.finalMaxed,
      bestEstimatePct: tally.bestEstimatePct,
    };
  }

  function presentNextQuestion(now: number) {
    const s = get();
    const round = s.round;
    const key = String(round);
    const queue = s.queues[key];
    const idx = s.qIndex[key];
    const q = queue[idx];
    if (!q) throw new Error(`Out of questions for round ${round}`);

    const timerMs = timerFor(round, s.suddenDeath);
    // Bots always play with the full timer, even when the human is spectating.
    const windowMs = timerMs;
    const scale = 1;
    const cap = windowMs - (q.type === "list" ? 0 : 50);

    // Pre-compute bot submissions + arrival times for the active pool. Bots are
    // simulated against the REAL timer (so outcomes match a normal round); only
    // the on-screen arrival timing is scaled into the active window.
    const botSchedule: GameState["botSchedule"] = {};
    for (const id of s.pool) {
      if (id === HUMAN_ID) continue;
      const player = s.players.find((p) => p.id === id)!;
      const sub = botSubmission(player, q, s.rng!, timerMs, s.supplements);
      const arriveMs =
        sub.submittedAtMs === undefined ? null : Math.min(sub.submittedAtMs * scale, cap);
      botSchedule[id] = { sub, arriveMs };
    }

    set({
      phase: "question",
      current: q,
      questionNo: s.questionNo + 1,
      qIndex: { ...s.qIndex, [key]: idx + 1 },
      questionStartAt: now,
      deadlineAt: now + windowMs,
      locked: {},
      botSchedule,
      humanLocked: false,
      listEntries: [],
      reveal: null,
      hostExpression: q.type === "numeric" || q.type === "list" ? "asking" : "asking",
      hostLine: bradyLine("asking", s.rng!.next()),
      hostTint: "neutral",
    });
  }

  return {
    seed: 0,
    content: null,
    rng: null,
    players: [],
    placements: {},
    championId: null,
    phase: "idle",
    round: 1,
    pool: [],
    advanced: [],
    questionNo: 0,
    queues: {},
    qIndex: {},
    current: null,
    questionStartAt: 0,
    deadlineAt: 0,
    suddenDeath: false,
    finalWins: {},
    locked: {},
    botSchedule: {},
    humanLocked: false,
    listEntries: [],
    reveal: null,
    hostExpression: "idle",
    hostLine: "",
    hostTint: "neutral",
    phaseStartedAt: 0,
    lobbyJoinedCount: 0,
    humanEliminated: false,
    htally: { ...EMPTY_TALLY },
    summary: null,
    episodeApplied: false,
    championPrediction: null,
    eliminationPoolSize: null,

    start: (cfg) => {
      const rng = makeRng(cfg.seed);
      const players = makeRoster(rng, { difficulty: cfg.difficulty, humanName: cfg.humanName, humanAvatar: cfg.humanAvatar });
      const queues: Record<string, AnyQuestion[]> = {
        "1": rng.shuffle(cfg.content.round1),
        "2": rng.shuffle(cfg.content.round2),
        "3": rng.shuffle(cfg.content.round3),
        final: rng.shuffle(cfg.content.final),
      };
      set({
        seed: cfg.seed,
        content: cfg.content,
        supplements: cfg.supplements,
        rng,
        players,
        placements: {},
        championId: null,
        phase: "lobby",
        round: 1,
        pool: players.map((p) => p.id),
        advanced: [],
        questionNo: 0,
        queues,
        qIndex: { "1": 0, "2": 0, "3": 0, final: 0 },
        current: null,
        suddenDeath: false,
        locked: {},
        botSchedule: {},
        humanLocked: false,
        listEntries: [],
        reveal: null,
        hostExpression: "idle",
        hostLine: bradyLine("intro", rng.next()),
        hostTint: "neutral",
        phaseStartedAt: Date.now(),
        lobbyJoinedCount: 1, // human is already "in"
        humanEliminated: false,
        htally: { ...EMPTY_TALLY },
        summary: null,
        episodeApplied: false,
        championPrediction: null,
        eliminationPoolSize: null,
      });
    },

    tick: (now) => {
      const s = get();
      switch (s.phase) {
        case "lobby": {
          const elapsed = now - s.phaseStartedAt;
          const joined = Math.min(5, 1 + Math.floor(elapsed / TIMING.lobbyJoinMs));
          if (joined !== s.lobbyJoinedCount) set({ lobbyJoinedCount: joined });
          if (joined >= 5 && elapsed > 5 * TIMING.lobbyJoinMs + TIMING.lobbyHoldMs) {
            set({ phase: "round-intro", phaseStartedAt: now });
          }
          break;
        }
        case "round-intro": {
          if (now - s.phaseStartedAt >= TIMING.roundIntroMs) presentNextQuestion(now);
          break;
        }
        case "question": {
          const elapsed = now - s.questionStartAt;
          const spectating = !s.pool.includes(HUMAN_ID);
          // Arrive bots whose time has come.
          let changed = false;
          const locked = { ...s.locked };
          for (const [id, sch] of Object.entries(s.botSchedule)) {
            if (locked[id] || sch.arriveMs === null) continue;
            if (elapsed >= sch.arriveMs) {
              locked[id] = sch.sub;
              changed = true;
            }
          }
          if (changed) set({ locked });

          const everyoneIn = s.pool.every((id) => locked[id] !== undefined);
          const past = now >= s.deadlineAt;
          // When spectating and all bots have submitted, fast-forward after a brief pause
          // so the spectator doesn't sit through the full timer (especially in the final).
          const spectateReady = spectating && everyoneIn && elapsed >= TIMING.spectateQMs;
          if (past || spectateReady || (everyoneIn && s.current!.type !== "list")) finalize(now);
          break;
        }
        case "reveal": {
          const spectating = !s.pool.includes(HUMAN_ID);
          const dur = spectating ? TIMING.revealSpectateMs : TIMING.revealHumanMs;
          if (now - s.phaseStartedAt >= dur) advanceAfterReveal(now);
          break;
        }
      }
    },

    submitHuman: (value) => {
      const s = get();
      if (s.phase !== "question" || s.humanLocked || !s.pool.includes(HUMAN_ID)) return;
      const q = s.current!;
      if (q.type === "list") return; // list uses addListEntry
      const submittedAtMs = Date.now() - s.questionStartAt;
      set({
        humanLocked: true,
        locked: { ...s.locked, [HUMAN_ID]: { playerId: HUMAN_ID, questionId: q.id, value, submittedAtMs } },
      });
    },

    addListEntry: (text) => {
      const s = get();
      if (s.phase !== "question" || s.current?.type !== "list") return false;
      const trimmed = text.trim();
      if (!trimmed) return false;
      const next = [...s.listEntries, trimmed];
      const before = validateListEntries(s.current, s.listEntries, s.supplements).validCount;
      const after = validateListEntries(s.current, next, s.supplements).validCount;
      set({ listEntries: next });
      const gained = after > before;
      return gained;
    },

    reset: () => set({ phase: "idle", current: null, reveal: null, championId: null }),

    devSkipRound: () => {
      const s = get();
      if (s.round === "final") {
        // Declare human as champion immediately.
        const now = Date.now();
        const runnerUp = s.pool.find((id) => id !== HUMAN_ID) ?? s.players.find((p) => p.id !== HUMAN_ID)!.id;
        const placements = { ...s.placements, [HUMAN_ID]: 1, [runnerUp]: 2 };
        const players = s.players.map((p) => ({
          ...p,
          placement: placements[p.id] ?? p.placement,
          status: p.id === HUMAN_ID ? ("advanced" as const) : ("eliminated" as const),
        }));
        const htally = { ...s.htally, roundsAdvanced: 3 };
        const summary = buildSummary(htally, true, 1);
        set({ phase: "results", championId: HUMAN_ID, placements, players, current: null, reveal: null, summary });
        return;
      }
      const now = Date.now();
      const round = s.round as 1 | 2 | 3;

      // Collect everyone currently in the game (pool + already advanced this round).
      const everyone = [...new Set([...s.pool, ...s.advanced])];
      const bots = everyone.filter((id) => id !== HUMAN_ID);

      // Pick one random bot to eliminate; the rest (including human) advance.
      const elimIdx = Math.floor(Math.random() * bots.length);
      const eliminatedId = bots[elimIdx];
      const advancedIds = everyone.filter((id) => id !== eliminatedId);

      const placement = PLACEMENT_BY_ROUND[round];
      const placements = { ...s.placements, [eliminatedId]: placement };
      const players = s.players.map((p) => ({
        ...p,
        placement: placements[p.id] ?? p.placement,
        status: p.id === eliminatedId ? ("eliminated" as const) : p.status,
      }));
      const htally = advancedIds.includes(HUMAN_ID)
        ? { ...s.htally, roundsAdvanced: Math.min(3, s.htally.roundsAdvanced + 1), wonRound2: s.htally.wonRound2 || round === 2 }
        : s.htally;

      if (round === 3) {
        set({ players, placements, advanced: [], humanEliminated: s.humanEliminated, htally, pool: advancedIds, round: "final", suddenDeath: false, finalWins: {}, phase: "round-intro", phaseStartedAt: now, questionNo: 0, current: null, reveal: null });
      } else {
        const nextRound = (round === 1 ? 2 : 3) as RoundId;
        set({ players, placements, advanced: [], humanEliminated: s.humanEliminated, htally, pool: advancedIds, round: nextRound, phase: "round-intro", phaseStartedAt: now, questionNo: 0, current: null, reveal: null });
      }
    },

    setChampionPrediction: (id: string) => set({ championPrediction: id }),

    markEpisodeApplied: () => set({ episodeApplied: true }),

    getEarlyLeaveSummary: () => {
      const s = get();
      const placement = s.placements[HUMAN_ID] ?? 5;
      return buildSummary(s.htally, false, placement);
    },
  };
});

// Debug hook for manual/preview testing (harmless on the private demo).
if (typeof window !== "undefined") {
  (window as unknown as { __game?: typeof useGameStore }).__game = useGameStore;
}

// ── display helpers ──────────────────────────────────────────────────────────

function answerDisplay(q: AnyQuestion, sub: ScoredSubmission): string {
  if (sub.submittedAtMs === undefined) return "No answer";
  if (q.type === "numeric") {
    const isYear = q.unit.toLowerCase() === "year";
    const num = Number(sub.value);
    return isYear || isNaN(num) ? String(sub.value) : num.toLocaleString();
  }
  return String(sub.value);
}

function hostMood(
  q: AnyQuestion,
  rows: RevealRow[],
  winnerId: string | null,
  spectating: boolean,
): HostMood {
  if (spectating) return winnerId ? "neutral" : "tension";
  const human = rows.find((r) => r.playerId === HUMAN_ID);
  if (!human) return "neutral";
  if (q.type === "list") return human.isWinner ? "correct" : "wrong";
  if (q.type === "numeric") return human.isWinner ? "correct" : "wrong";
  return human.correct ? "correct" : "wrong";
}
