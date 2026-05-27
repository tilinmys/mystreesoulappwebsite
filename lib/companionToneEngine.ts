import type {
  CompanionEmotionalMode,
  CompanionToneConfig,
  CompanionToneId,
} from "../types/companion";

export function getSafeGreeting(tone: CompanionToneId): string {
  switch (tone) {
    case "calm":
      return "You can go gently";
    case "playful":
      return "Let's keep this simple";
    case "motivational":
      return "Take one step now";
    case "gentle":
    default:
      return "I'm here with you";
  }
}

export function getCompanionMode(
  emotionalState: string | null | undefined,
  stressLevel: number | null | undefined
): CompanionEmotionalMode {
  const stress = (stressLevel !== undefined && stressLevel !== null) ? stressLevel : 50;
  const state = emotionalState || "neutral";

  if (stress >= 70 || state === "anxious" || state === "overwhelmed" || state === "stressed") {
    return "stressed";
  }

  if (state === "sad" || state === "low") {
    return "low";
  }

  if (state === "energized" || state === "happy") {
    return "energized";
  }

  return "neutral";
}

export function resolveCompanionTone(
  profile: any,
  companionState: any
): CompanionToneConfig {
  const tone: CompanionToneId = companionState?.companionTone || "gentle";
  const emotionalState = profile?.emotionalState || "neutral";
  const stressLevel = profile?.stressLevel ?? 50;

  const mode = getCompanionMode(emotionalState, stressLevel);
  let greeting = getSafeGreeting(tone);

  // Dynamic override if stressed or low
  if (mode === "stressed") {
    greeting = "Let's breathe and keep this simple";
  } else if (mode === "low") {
    greeting = "I'm here with you, let's take it easy";
  }

  return {
    tone,
    greeting,
    nudge: "Tell me how your body and mind feel today.",
  };
}
