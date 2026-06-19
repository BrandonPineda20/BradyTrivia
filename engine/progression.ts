/**
 * Progression (spec §9): XP, levels, streaks, badges, and a seeded leaderboard.
 * Pure + deterministic so the rules are unit-testable; persistence + streak dates
 * live in the store (§11.5).
 */
import { BOT_NAMES } from "./names";
import { makeRng } from "./rng";

/** What one finished episode contributes (built from the live game by the store). */
export type EpisodeSummary = {
  placement: number; // 1..5
  won: boolean;
  correct: number; // human correct answers (MC correct + R3 closest wins)
  wrong: number; // wrong / timed-out answers
  roundsAdvanced: number; // 0..3 rounds the human won through
  reachedFinal: boolean;
  wonRound2: boolean;
  finalValid: number; // human's valid count in the Final (0 if not reached)
  finalMaxed: boolean; // hit a closed prompt's total
  bestEstimatePct?: number; // smallest R3 % error (0.08 = 8%)
};

// ── XP & levels (§9.1) ───────────────────────────────────────────────────────

export function xpForEpisode(s: EpisodeSummary): number {
  return (
    20 + // participation
    10 * s.correct +
    25 * s.roundsAdvanced +
    (s.reachedFinal ? 50 : 0) +
    (s.won ? 200 : 0)
  );
}

export const LEVELS = [
  { level: 1, title: "Pop Quiz Rookie", min: 0 },
  { level: 2, title: "Class Clown", min: 300 },
  { level: 3, title: "Honor Roll", min: 800 },
  { level: 4, title: "Dean's List", min: 1600 },
  { level: 5, title: "Valedictorian", min: 3000 },
  { level: 6, title: "The Tutor", min: 5000 },
] as const;

export type LevelInfo = {
  level: number;
  title: string;
  min: number;
  /** 0..1 progress toward the next level (1 when maxed). */
  progress: number;
  xpIntoLevel: number;
  xpForNext: number; // 0 when maxed
  nextTitle?: string;
};

export function levelInfo(xp: number): LevelInfo {
  let cur = LEVELS[0] as (typeof LEVELS)[number];
  for (const l of LEVELS) if (xp >= l.min) cur = l;
  const next = LEVELS.find((l) => l.min > xp);
  const span = next ? next.min - cur.min : 0;
  return {
    level: cur.level,
    title: cur.title,
    min: cur.min,
    progress: next ? (xp - cur.min) / span : 1,
    xpIntoLevel: xp - cur.min,
    xpForNext: span,
    nextTitle: next?.title,
  };
}

// ── Badges (§9.3) ────────────────────────────────────────────────────────────

export type Badge = { id: string; name: string; emoji: string; desc: string };

export const BADGES: Badge[] = [
  { id: "welcome", name: "Welcome to the Class", emoji: "🎒", desc: "Play your first game" },
  { id: "firstWin", name: "First Win", emoji: "🏆", desc: "Win an episode" },
  { id: "geoWhiz", name: "Geography Whiz", emoji: "🌍", desc: "Survive Round 2 three times" },
  { id: "sharpshooter", name: "Sharpshooter", emoji: "🎯", desc: "Nail a Round 3 estimate within 10%" },
  { id: "listmaster", name: "Listmaster", emoji: "📝", desc: "Get 10+ valid answers in the Final" },
  { id: "flawless", name: "Flawless", emoji: "💎", desc: "Win without a single wrong answer" },
  { id: "regular", name: "Honor Student", emoji: "🔥", desc: "Reach a 3-day play streak" },
];

export type BadgeContext = { gamesPlayed: number; round2Wins: number; streak: number };

/** Return the ids newly earned this episode (not already in `earned`). */
export function evaluateBadges(
  s: EpisodeSummary,
  ctx: BadgeContext,
  earned: string[],
): string[] {
  const have = new Set(earned);
  const out: string[] = [];
  const add = (id: string, cond: boolean) => {
    if (cond && !have.has(id)) {
      out.push(id);
      have.add(id);
    }
  };
  add("welcome", ctx.gamesPlayed >= 1);
  add("firstWin", s.won);
  add("geoWhiz", ctx.round2Wins >= 3);
  add("sharpshooter", s.bestEstimatePct !== undefined && s.bestEstimatePct <= 0.1);
  add("listmaster", s.finalValid >= 10 || s.finalMaxed);
  add("flawless", s.won && s.wrong === 0);
  add("regular", ctx.streak >= 3);
  return out;
}

// ── Leaderboard (§9.4) ───────────────────────────────────────────────────────

export type LeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  avatarSeed: string;
  isHuman?: boolean;
};

/** Deterministic seeded community so the board looks populated and alive. */
export function seedLeaderboard(count = 18): LeaderboardEntry[] {
  const rng = makeRng(20260618);
  return rng
    .shuffle(BOT_NAMES)
    .slice(0, count)
    .map((name, i) => ({
      id: `lb-${i}`,
      name,
      xp: Math.round(rng.float(150, 6200)),
      avatarSeed: `lb-${i}`,
    }));
}

/** Merge the human into the seeded board and sort by XP (desc). */
export function rankedLeaderboard(humanName: string, humanXp: number): LeaderboardEntry[] {
  const board = seedLeaderboard();
  board.push({ id: "human", name: humanName || "You", xp: humanXp, avatarSeed: "you", isHuman: true });
  return board.sort((a, b) => b.xp - a.xp);
}
