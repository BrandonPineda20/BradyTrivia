import { describe, expect, it } from "vitest";
import {
  evaluateBadges,
  levelInfo,
  rankedLeaderboard,
  xpForEpisode,
  type EpisodeSummary,
} from "../progression";

const base: EpisodeSummary = {
  placement: 3,
  won: false,
  correct: 0,
  wrong: 0,
  roundsAdvanced: 0,
  reachedFinal: false,
  wonRound2: false,
  finalValid: 0,
  finalMaxed: false,
};

describe("xpForEpisode (§9.1)", () => {
  it("rewards participation, correctness, advancing, final, and winning", () => {
    expect(xpForEpisode(base)).toBe(20);
    expect(xpForEpisode({ ...base, correct: 3 })).toBe(50);
    const champ = xpForEpisode({ ...base, correct: 5, roundsAdvanced: 3, reachedFinal: true, won: true });
    expect(champ).toBe(20 + 50 + 75 + 50 + 200);
  });
});

describe("levelInfo (§9.1)", () => {
  it("maps XP to the right Brady-themed level + progress", () => {
    expect(levelInfo(0).title).toBe("Pop Quiz Rookie");
    expect(levelInfo(300).title).toBe("Class Clown");
    expect(levelInfo(5200).title).toBe("The Tutor");
    expect(levelInfo(5200).progress).toBe(1); // maxed
    const mid = levelInfo(550); // between 300 and 800
    expect(mid.title).toBe("Class Clown");
    expect(mid.progress).toBeCloseTo((550 - 300) / (800 - 300), 5);
  });
});

describe("evaluateBadges (§9.3)", () => {
  it("awards earned badges and never re-awards", () => {
    const ctx = { gamesPlayed: 1, round2Wins: 3, streak: 3 };
    const won: EpisodeSummary = { ...base, won: true, wrong: 0, bestEstimatePct: 0.05, finalValid: 12 };
    const first = evaluateBadges(won, ctx, []);
    expect(first).toEqual(expect.arrayContaining(["welcome", "firstWin", "geoWhiz", "sharpshooter", "listmaster", "flawless", "regular"]));
    // already earned → none repeat
    expect(evaluateBadges(won, ctx, first)).toEqual([]);
  });

  it("flawless requires a win with zero wrong answers", () => {
    expect(evaluateBadges({ ...base, won: true, wrong: 1 }, { gamesPlayed: 1, round2Wins: 0, streak: 0 }, [])).not.toContain("flawless");
    expect(evaluateBadges({ ...base, won: true, wrong: 0 }, { gamesPlayed: 1, round2Wins: 0, streak: 0 }, [])).toContain("flawless");
  });
});

describe("rankedLeaderboard (§9.4)", () => {
  it("slots the human in and sorts by XP desc", () => {
    const board = rankedLeaderboard("Edgar", 99999);
    expect(board[0].isHuman).toBe(true); // huge XP → top
    expect(board.filter((e) => e.isHuman)).toHaveLength(1);
    for (let i = 1; i < board.length; i++) expect(board[i - 1].xp).toBeGreaterThanOrEqual(board[i].xp);
  });
});
