export type CompanionToneId = "gentle" | "playful" | "calm" | "motivational";

export type CompanionEmotionalMode = "neutral" | "stressed" | "low" | "energized";

export type CompanionToneConfig = {
  tone: CompanionToneId;
  greeting: string;
  nudge: string;
};
