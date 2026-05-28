import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Storage from "../utils/storage";

// ─── Secure + memory-fallback storage adapter (same pattern as onboardingStore) ─
const memoryStorage = new Map<string, string>();

const secureStorage = {
  getItem: async (name: string) => {
    try {
      // [WEB-COMPAT] Replaced SecureStore with Storage
      const value = await Storage.getItem(name);
      return value ?? memoryStorage.get(name) ?? null;
    } catch {
      return memoryStorage.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string) => {
    memoryStorage.set(name, value);
    try {
      // [WEB-COMPAT] Replaced SecureStore with Storage
      await Storage.setItem(name, value);
    } catch {
      // Expo Go fallback — keep app moving with memory storage.
    }
  },
  removeItem: async (name: string) => {
    memoryStorage.delete(name);
    try {
      // [WEB-COMPAT] Replaced SecureStore with Storage
      await Storage.removeItem(name);
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
