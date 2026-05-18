import type { CompanionId, CompanionTone, EmotionalMode } from "../store/companionStore";
import { useCompanionStore } from "../store/companionStore";

const companionNames: Record<CompanionId, string> = {
  bloop: "Bloop",
  jiggy: "Jiggy",
  manchi: "Manchi",
  yogi: "Yogi",
};

export function getCompanionToneForEmotionalMode(mode: EmotionalMode): CompanionTone {
  switch (mode) {
    case "stressed":
      return "calm";
    case "low":
      return "gentle";
    case "energized":
      return "motivational";
    case "neutral":
    default:
      return "gentle";
  }
}

export function getCompanionGreeting() {
  const { emotionalMode, selectedCompanion } = useCompanionStore.getState();
  const name = companionNames[selectedCompanion];

  switch (emotionalMode) {
    case "stressed":
      return `${name} is here. Let's slow this moment down together.`;
    case "low":
      return `${name} is with you. Tiny steps count today.`;
    case "energized":
      return `${name} loves this energy. Let's use it gently.`;
    case "neutral":
    default:
      return `${name} is here for your check-in.`;
  }
}
