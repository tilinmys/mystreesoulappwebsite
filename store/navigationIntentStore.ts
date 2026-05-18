import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { resilientJSONStorage } from "./persistStorage";

export type NavigationIntentSource = "guard" | "notification" | "manual";

const INTENT_TTL_MS = 10 * 60 * 1000;
const blockedFirstSegments = new Set(["", "welcome", "login", "register"]);

function isSafeInternalPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return false;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) return false;
  const firstSegment = path.split("?")[0].split("/").filter(Boolean)[0] ?? "";
  return !blockedFirstSegments.has(firstSegment);
}

function isFresh(createdAt: number | null) {
  return typeof createdAt === "number" && Date.now() - createdAt <= INTENT_TTL_MS;
}

interface NavigationIntentState {
  intendedPath: string | null;
  source: NavigationIntentSource | null;
  createdAt: number | null;
  clearNavigationIntent: () => void;
  consumeNavigationIntent: () => string | null;
  setNavigationIntent: (path: string, source: NavigationIntentSource) => void;
}

export const useNavigationIntentStore = create<NavigationIntentState>()(
  persist(
    (set, get) => ({
      intendedPath: null,
      source: null,
      createdAt: null,
      clearNavigationIntent: () => set({ intendedPath: null, source: null, createdAt: null }),
      consumeNavigationIntent: () => {
        const { intendedPath, createdAt } = get();
        set({ intendedPath: null, source: null, createdAt: null });
        return isSafeInternalPath(intendedPath) && isFresh(createdAt) ? intendedPath : null;
      },
      setNavigationIntent: (path, source) => {
        if (!isSafeInternalPath(path)) return;
        set({ intendedPath: path, source, createdAt: Date.now() });
      },
    }),
    {
      name: "navigation-intent-storage",
      storage: createJSONStorage(() => resilientJSONStorage),
    }
  )
);

export function isSafeNavigationIntentPath(path: string | null | undefined) {
  return isSafeInternalPath(path);
}
