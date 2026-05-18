import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { resilientJSONStorage } from "./persistStorage";

export type CompanionId = "bloop" | "jiggy" | "manchi" | "yogi";
export type CompanionTone = "gentle" | "playful" | "calm" | "motivational";
export type EmotionalMode = "neutral" | "stressed" | "low" | "energized";

interface CompanionState {
  selectedCompanion: CompanionId;
  companionTone: CompanionTone;
  emotionalMode: EmotionalMode;
  lastInteractionAt: number | null;
  setCompanion: (companion: CompanionId) => void;
  setEmotionalMode: (mode: EmotionalMode) => void;
  setTone: (tone: CompanionTone) => void;
  touchInteraction: () => void;
}

export const useCompanionStore = create<CompanionState>()(
  persist(
    (set) => ({
      selectedCompanion: "bloop",
      companionTone: "gentle",
      emotionalMode: "neutral",
      lastInteractionAt: null,
      setCompanion: (selectedCompanion) => set({ selectedCompanion }),
      setEmotionalMode: (emotionalMode) => set({ emotionalMode }),
      setTone: (companionTone) => set({ companionTone }),
      touchInteraction: () => set({ lastInteractionAt: Date.now() }),
    }),
    {
      name: "companion-state-storage",
      storage: createJSONStorage(() => resilientJSONStorage),
    }
  )
);
