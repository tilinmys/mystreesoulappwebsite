import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Storage from "../utils/storage";

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
      // Expo Go/dev-client can briefly report a null native storage module during reloads.
      // Keep the app moving with memory storage instead of crashing the press handler.
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

// ─── Domain types ────────────────────────────────────────────────────────────

/**
 * Valid life stage identifiers. Null means the user has not selected one yet
 * (i.e. the life stage step has not been completed).
 */
export type LifeStage =
  | "teen"
  | "cycle_fertility"
  | "pregnancy"
  | "menopause"
  | null;

export type CycleBasics = {
  lastPeriodStart: string;
  periodLength: string;
  cycleLength: string;
  usualFlow: string;
  supportNeeds: string[];
  fertilityIntent: string;
};

// ─── State interface ─────────────────────────────────────────────────────────

interface OnboardingState {
  // ── Existing fields (DO NOT RENAME) ───────────────────────────────────────
  consentAcceptedAt: string | null;
  hasCompletedOnboarding: boolean;
  name: string;

  // ── New fields: onboarding goal selection ─────────────────────────────────
  /** IDs of goals the user selected in onboarding.tsx (e.g. "cycle", "peace"). */
  selectedGoals: string[];

  // ── New fields: life stage ────────────────────────────────────────────────
  /**
   * The life stage the user selected during onboarding.
   * Null until the life stage step has been completed.
   */
  lifeStage: LifeStage;

  // ── New fields: emotional wellness (from emotional-wellness.tsx) ───────────
  /** Stress level 0–100 as reported during onboarding. Default 50. */
  stressLevel: number;
  /** Qualitative sleep descriptor. Default "okay". */
  sleepScore: string;
  /** Dominant emotional state from the mood wheel. Default "calm". */
  emotionalState: string;
  cycleBasics: CycleBasics;

  // ── Existing actions (DO NOT REMOVE) ──────────────────────────────────────
  acceptPrivacyConsent: () => void;
  completeOnboarding: () => Promise<boolean>;
  resetOnboarding: () => void;
  setName: (name: string) => void;

  // ── New actions ───────────────────────────────────────────────────────────
  setSelectedGoals: (goals: string[]) => void;
  setLifeStage: (stage: LifeStage) => void;
  setStressLevel: (value: number) => void;
  setSleepScore: (value: string) => void;
  setEmotionalState: (value: string) => void;
  setCycleBasics: (value: CycleBasics) => void;
}

// ─── Default values (single source of truth for resets) ─────────────────────

const DEFAULTS = {
  consentAcceptedAt:        null as string | null,
  hasCompletedOnboarding:   false,
  name:                     "",
  selectedGoals:            [] as string[],
  lifeStage:                null as LifeStage,
  stressLevel:              50,
  sleepScore:               "okay",
  emotionalState:           "calm",
  cycleBasics:              {
    lastPeriodStart: "",
    periodLength: "",
    cycleLength: "",
    usualFlow: "",
    supportNeeds: [] as string[],
    fertilityIntent: "",
  },
} as const satisfies Omit<
  OnboardingState,
  | "acceptPrivacyConsent"
  | "completeOnboarding"
  | "resetOnboarding"
  | "setName"
  | "setSelectedGoals"
  | "setLifeStage"
  | "setStressLevel"
  | "setSleepScore"
  | "setEmotionalState"
  | "setCycleBasics"
>;

// ─── Store ───────────────────────────────────────────────────────────────────

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Spread all defaults so initial state and reset share one definition
      ...DEFAULTS,

      // ── Existing actions ────────────────────────────────────────────────
      acceptPrivacyConsent: () =>
        set({ consentAcceptedAt: new Date().toISOString() }),

      completeOnboarding: async () => {
        console.log("[ONBOARDING_STORE] Attempting secure persistence write...");
        set({ hasCompletedOnboarding: true });
        await Promise.resolve();
        return true;
      },

      resetOnboarding: () => set({ ...DEFAULTS }),

      setName: (name) => set({ name }),

      // ── New actions ─────────────────────────────────────────────────────
      setSelectedGoals:  (goals)  => set({ selectedGoals: goals }),
      setLifeStage:      (stage)  => set({ lifeStage: stage }),
      setStressLevel:    (value)  => set({ stressLevel: value }),
      setSleepScore:     (value)  => set({ sleepScore: value }),
      setEmotionalState: (value)  => set({ emotionalState: value }),
      setCycleBasics:    (value)  => set({ cycleBasics: value }),
    }),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
