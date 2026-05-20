import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";

// ─── Secure + memory-fallback storage adapter (same pattern as onboardingStore) ─
const memoryStorage = new Map<string, string>();

const secureStorage = {
  getItem: async (name: string) => {
    try {
      const value = await SecureStore.getItemAsync(name);
      return value ?? memoryStorage.get(name) ?? null;
    } catch {
      return memoryStorage.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string) => {
    memoryStorage.set(name, value);
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Expo Go fallback — keep app moving with memory storage.
    }
  },
  removeItem: async (name: string) => {
    memoryStorage.delete(name);
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // See setItem fallback.
    }
  },
};

// ─── Types ───────────────────────────────────────────────────────────────────
/** "system" follows the OS preference, "light" / "dark" override it globally. */
export type ColorMode = "system" | "light" | "dark";

// ─── State interface ─────────────────────────────────────────────────────────
interface ThemeState {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorMode: "system",
      setColorMode: (mode) => set({ colorMode: mode }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
