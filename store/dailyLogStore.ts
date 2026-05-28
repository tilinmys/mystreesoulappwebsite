import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Storage from "../utils/storage";
import type { DailyLogPayload } from "../components/cycle/DailyLogSheet";

// ─── Secure + memory-fallback storage adapter ───────────────────────────────
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
      // Fallback to memory storage on native module errors.
    }
  },
  removeItem: async (name: string) => {
    memoryStorage.delete(name);
    try {
      // [WEB-COMPAT] Replaced SecureStore with Storage
      await Storage.removeItem(name);
    } catch {}
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Remove log entries older than 90 days to keep storage lean. */
function pruneOldLogs(logs: Record<string, DailyLogPayload>): Record<string, DailyLogPayload> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return Object.fromEntries(
    Object.entries(logs).filter(([dateKey]) => dateKey >= cutoffStr)
  );
}

// ─── State interface ─────────────────────────────────────────────────────────

interface DailyLogState {
  /** Map of YYYY-MM-DD → DailyLogPayload */
  logs: Record<string, DailyLogPayload>;

  /** Save a log for today (or the date embedded in payload). Prunes logs > 90 days. */
  saveLog: (payload: DailyLogPayload) => void;

  /** Returns true if a log exists for today. */
  hasLoggedToday: () => boolean;

  /** Returns the log for a given YYYY-MM-DD date key, or undefined. */
  getLogForDate: (dateKey: string) => DailyLogPayload | undefined;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useDailyLogStore = create<DailyLogState>()(
  persist(
    (set, get) => ({
      logs: {},

      saveLog: (payload) => {
        const key = payload.date || todayKey();
        set((state) => ({
          logs: pruneOldLogs({ ...state.logs, [key]: payload }),
        }));
      },

      hasLoggedToday: () => {
        return !!get().logs[todayKey()];
      },

      getLogForDate: (dateKey) => {
        return get().logs[dateKey];
      },
    }),
    {
      name: "daily-log-storage",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
