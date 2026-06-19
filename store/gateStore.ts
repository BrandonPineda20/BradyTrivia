/**
 * Demo passcode unlock state (spec §16). Persists a successful unlock so a
 * returning visitor isn't re-prompted — but ties the stored token to the current
 * passcode, so rotating EXPO_PUBLIC_PASSCODE automatically re-gates everyone.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { DEMO_PASSCODE, GATE_ENABLED, passcodeMatches } from "../config/gate";

const KEY = "brady.gate.v1";

// Stored token is derived from the active code → rotating the code invalidates
// every previously-unlocked session without a version bump.
const tokenFor = (code: string) => `ok:${code.toLowerCase()}`;

type GateState = {
  loaded: boolean;
  unlocked: boolean;
  load: () => Promise<void>;
  tryUnlock: (input: string) => boolean;
  lock: () => Promise<void>;
};

export const useGateStore = create<GateState>((set) => ({
  loaded: false,
  unlocked: false,

  load: async () => {
    if (!GATE_ENABLED) {
      set({ unlocked: true, loaded: true });
      return;
    }
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw && raw === tokenFor(DEMO_PASSCODE)) {
        set({ unlocked: true, loaded: true });
        return;
      }
    } catch {
      // unavailable storage → just require entry this session
    }
    set({ loaded: true });
  },

  tryUnlock: (input) => {
    if (!passcodeMatches(input)) return false;
    set({ unlocked: true });
    AsyncStorage.setItem(KEY, tokenFor(DEMO_PASSCODE)).catch(() => {});
    return true;
  },

  lock: async () => {
    set({ unlocked: false });
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  },
}));
