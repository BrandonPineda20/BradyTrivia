/**
 * Progression persistence (spec §9, §11.5). Holds XP / streak / badges / lifetime
 * stats in AsyncStorage and applies one episode's summary into all of them.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { evaluateBadges, levelInfo, xpForEpisode, type EpisodeSummary } from "../engine";

const KEY = "brady.prog.v1";

const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

export type Stats = {
  gamesPlayed: number;
  wins: number;
  bestPlacement: number; // 1..5 (lower is better)
  round2Wins: number;
  totalCorrect: number;
};

const DEFAULT_STATS: Stats = { gamesPlayed: 0, wins: 0, bestPlacement: 5, round2Wins: 0, totalCorrect: 0 };

export type ApplyResult = {
  xpEarned: number;
  totalXp: number;
  newBadges: string[];
  leveledUp: boolean;
  level: number;
  title: string;
  xpToNext: number;
  nextTitle?: string;
  progress: number;
};

export type PendingXpDisplay = {
  xpEarned: number;
  totalXp: number;
  level: number;
  title: string;
  xpToNext: number;
  nextTitle?: string;
  progress: number; // 0..1 within current level
};

type ProgState = {
  loaded: boolean;
  xp: number;
  streak: number;
  lastPlayedDay: string | null;
  badges: string[];
  stats: Stats;
  pendingXpDisplay: PendingXpDisplay | null;
  load: () => Promise<void>;
  applyEpisode: (s: EpisodeSummary) => Promise<ApplyResult>;
  addBonusXp: (amount: number) => Promise<void>;
  reset: () => Promise<void>;
  setPendingXpDisplay: (d: PendingXpDisplay | null) => void;
};

export const useProgressionStore = create<ProgState>((set, get) => ({
  loaded: false,
  xp: 0,
  streak: 0,
  lastPlayedDay: null,
  badges: [],
  stats: DEFAULT_STATS,
  pendingXpDisplay: null,
  setPendingXpDisplay: (d) => set({ pendingXpDisplay: d }),

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        set({
          xp: p.xp ?? 0,
          streak: p.streak ?? 0,
          lastPlayedDay: p.lastPlayedDay ?? null,
          badges: p.badges ?? [],
          stats: { ...DEFAULT_STATS, ...p.stats },
          loaded: true,
        });
        return;
      }
    } catch {
      // ignore
    }
    set({ loaded: true });
  },

  applyEpisode: async (s) => {
    const st = get();
    const td = dayKey();
    const streak =
      st.lastPlayedDay === td ? st.streak : st.lastPlayedDay === yesterdayKey() ? st.streak + 1 : 1;

    const stats: Stats = {
      gamesPlayed: st.stats.gamesPlayed + 1,
      wins: st.stats.wins + (s.won ? 1 : 0),
      bestPlacement: Math.min(st.stats.bestPlacement, s.placement),
      round2Wins: st.stats.round2Wins + (s.wonRound2 ? 1 : 0),
      totalCorrect: st.stats.totalCorrect + s.correct,
    };

    const xpEarned = xpForEpisode(s);
    const totalXp = st.xp + xpEarned;
    const leveledUp = levelInfo(totalXp).level > levelInfo(st.xp).level;
    const newBadges = evaluateBadges(
      s,
      { gamesPlayed: stats.gamesPlayed, round2Wins: stats.round2Wins, streak },
      st.badges,
    );
    const badges = [...st.badges, ...newBadges];
    const after = levelInfo(totalXp);

    set({ xp: totalXp, streak, lastPlayedDay: td, badges, stats });
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify({ xp: totalXp, streak, lastPlayedDay: td, badges, stats }));
    } catch {
      // best-effort
    }
    const xpRemaining = after.xpForNext > 0 ? after.xpForNext - after.xpIntoLevel : 0;
    return { xpEarned, totalXp, newBadges, leveledUp, level: after.level, title: after.title, xpToNext: xpRemaining, nextTitle: after.nextTitle, progress: after.progress };
  },

  addBonusXp: async (amount: number) => {
    const st = get();
    const totalXp = st.xp + amount;
    set({ xp: totalXp });
    try {
      const raw = await AsyncStorage.getItem(KEY);
      const p = raw ? JSON.parse(raw) : {};
      await AsyncStorage.setItem(KEY, JSON.stringify({ ...p, xp: totalXp }));
    } catch {}
  },

  reset: async () => {
    set({ xp: 0, streak: 0, lastPlayedDay: null, badges: [], stats: DEFAULT_STATS });
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
}));
