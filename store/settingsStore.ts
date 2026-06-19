/**
 * App settings (§10.1 mute toggle). Persisted to AsyncStorage.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const KEY = "brady.settings.v1";

type SettingsState = {
  loaded: boolean;
  muted: boolean;
  load: () => Promise<void>;
  toggleMute: () => void;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  loaded: false,
  muted: false,
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        set({ muted: !!JSON.parse(raw).muted, loaded: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ loaded: true });
  },
  toggleMute: () => {
    const muted = !get().muted;
    set({ muted });
    AsyncStorage.setItem(KEY, JSON.stringify({ muted })).catch(() => {});
  },
}));
