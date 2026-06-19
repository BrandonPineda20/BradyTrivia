/**
 * Player profile + local persistence (spec §6.1, §11.5).
 * Stores the human's name + avatar selection in AsyncStorage so a reopened app
 * feels continuous. The DiceBear AvatarConfig is derived from the selection.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { AvatarConfig } from "../engine/types";
import { AVATAR_STYLE, buildAvatarOptions, type AvatarSelection } from "../theme/avatar-options";

const KEY = "brady.profile.v1";

function configFor(selection: AvatarSelection): AvatarConfig {
  return { seed: "you", style: AVATAR_STYLE, options: buildAvatarOptions(selection) };
}

type ProfileState = {
  loaded: boolean;
  name: string;
  selection: AvatarSelection | null;
  avatar: AvatarConfig | null;
  load: () => Promise<void>;
  save: (name: string, selection: AvatarSelection) => Promise<void>;
  reset: () => Promise<void>;
};

export const useProfileStore = create<ProfileState>((set) => ({
  loaded: false,
  name: "",
  selection: null,
  avatar: null,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as { name?: string; selection?: AvatarSelection };
        if (p.selection) {
          set({ name: p.name ?? "", selection: p.selection, avatar: configFor(p.selection), loaded: true });
          return;
        }
      }
    } catch {
      // ignore corrupt/unavailable storage → treat as first run
    }
    set({ loaded: true });
  },

  save: async (name, selection) => {
    set({ name, selection, avatar: configFor(selection) });
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify({ name, selection }));
    } catch {
      // best-effort; in-memory state still updated
    }
  },

  reset: async () => {
    set({ name: "", selection: null, avatar: null });
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
}));
