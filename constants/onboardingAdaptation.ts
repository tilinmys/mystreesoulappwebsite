export type AvailableNeedId = "self_love" | "goal_setting" | "cycle";

export type NeedCombinationId =
  | "self_love"
  | "goal_setting"
  | "cycle"
  | "self_love_goal_setting"
  | "self_love_cycle"
  | "goal_setting_cycle"
  | "whole_rhythm";

type EmotionalDefaults = {
  mood: string;
  energy: number;
  stress: number;
  sleep: string;
};

type PersonalizationDefaults = {
  heading: string;
  subheading: string;
  wellness: string[];
  wellnessOrder: string[];
  rhythm: string;
  movements: string[];
  aiCopy: string;
};

export const AVAILABLE_NEEDS: AvailableNeedId[] = ["self_love", "goal_setting", "cycle"];
export const LOCKED_NEEDS = ["nutrition", "inner_harmony"] as const;

export function normalizeAvailableNeeds(goals: string[]): AvailableNeedId[] {
  const seen = new Set<AvailableNeedId>();
  goals.forEach((goal) => {
    if (AVAILABLE_NEEDS.includes(goal as AvailableNeedId)) {
      seen.add(goal as AvailableNeedId);
    }
  });
  return Array.from(seen);
}

export function getNeedCombination(goals: string[]): NeedCombinationId {
  const needs = normalizeAvailableNeeds(goals);
  const has = (id: AvailableNeedId) => needs.includes(id);

  if (has("self_love") && has("goal_setting") && has("cycle")) return "whole_rhythm";
  if (has("self_love") && has("goal_setting")) return "self_love_goal_setting";
  if (has("self_love") && has("cycle")) return "self_love_cycle";
  if (has("goal_setting") && has("cycle")) return "goal_setting_cycle";
  if (has("cycle")) return "cycle";
  if (has("goal_setting")) return "goal_setting";
  return "self_love";
}

export function getOnboardingPrompt(goals: string[]) {
  switch (getNeedCombination(goals)) {
    case "cycle":
      return {
        heading: "How has your body felt lately?",
        subheading: "We will tune your rhythm around cycle patterns, energy, and rest.",
        focusLabel: "Cycle rhythm",
      };
    case "goal_setting":
      return {
        heading: "What kind of support keeps you steady?",
        subheading: "We will shape your plan around small goals and repeatable habits.",
        focusLabel: "Goal setter",
      };
    case "self_love_goal_setting":
      return {
        heading: "What helps you feel cared for and consistent?",
        subheading: "We will balance emotional support with gentle progress.",
        focusLabel: "Self-love goals",
      };
    case "self_love_cycle":
      return {
        heading: "How are your emotions moving with your body?",
        subheading: "We will connect mood, cycle, rest, and reassurance.",
        focusLabel: "Mood and cycle",
      };
    case "goal_setting_cycle":
      return {
        heading: "What rhythm do you want to build around your cycle?",
        subheading: "We will pair cycle awareness with practical weekly habits.",
        focusLabel: "Cycle goals",
      };
    case "whole_rhythm":
      return {
        heading: "What does support need to feel like for you?",
        subheading: "We will combine emotional care, goals, and cycle rhythm.",
        focusLabel: "Calm & clarity",
      };
    case "self_love":
    default:
      return {
        heading: "How have you been feeling lately?",
        subheading: "We will tune your Soul space around care, softness, and emotional safety.",
        focusLabel: "Self-love",
      };
  }
}

export function getEmotionalDefaults(goals: string[]): EmotionalDefaults {
  switch (getNeedCombination(goals)) {
    case "cycle":
      return { mood: "calm", energy: 48, stress: 54, sleep: "okay" };
    case "goal_setting":
      return { mood: "motivated", energy: 64, stress: 46, sleep: "well_rested" };
    case "self_love_goal_setting":
      return { mood: "motivated", energy: 56, stress: 52, sleep: "okay" };
    case "self_love_cycle":
      return { mood: "anxious", energy: 46, stress: 60, sleep: "restless" };
    case "goal_setting_cycle":
      return { mood: "motivated", energy: 58, stress: 50, sleep: "okay" };
    case "whole_rhythm":
      return { mood: "calm", energy: 54, stress: 56, sleep: "okay" };
    case "self_love":
    default:
      return { mood: "calm", energy: 52, stress: 58, sleep: "okay" };
  }
}

export function getPersonalizationDefaults(goals: string[]): PersonalizationDefaults {
  switch (getNeedCombination(goals)) {
    case "cycle":
      return {
        heading: "Build your cycle rhythm",
        subheading: "Choose the support that helps you read your body clearly.",
        wellness: ["energy", "better_sleep"],
        wellnessOrder: ["energy", "better_sleep", "hydration", "gentle_move", "mindful", "stress_rec"],
        rhythm: "morning",
        movements: ["walking", "stretch"],
        aiCopy: "Bloop is shaping a cycle-aware rhythm with energy, sleep, and symptom timing in mind.",
      };
    case "goal_setting":
      return {
        heading: "Build your goal rhythm",
        subheading: "Choose habits that feel realistic enough to repeat.",
        wellness: ["energy", "hydration"],
        wellnessOrder: ["energy", "hydration", "gentle_move", "better_sleep", "mindful", "stress_rec"],
        rhythm: "morning",
        movements: ["walking", "yoga"],
        aiCopy: "Bloop is building a simple plan around small wins, timing, and habit consistency.",
      };
    case "self_love_goal_setting":
      return {
        heading: "Balance care with progress",
        subheading: "Choose rituals that help you feel supported while moving forward.",
        wellness: ["mindful", "energy"],
        wellnessOrder: ["mindful", "energy", "stress_rec", "better_sleep", "hydration", "gentle_move"],
        rhythm: "evening",
        movements: ["yoga", "rest"],
        aiCopy: "Bloop is combining emotional reassurance with tiny, repeatable goals.",
      };
    case "self_love_cycle":
      return {
        heading: "Support your mood and cycle",
        subheading: "Choose rituals for emotional steadiness through body changes.",
        wellness: ["stress_rec", "better_sleep"],
        wellnessOrder: ["stress_rec", "better_sleep", "mindful", "hydration", "gentle_move", "energy"],
        rhythm: "evening",
        movements: ["stretch", "rest"],
        aiCopy: "Bloop is connecting mood, rest, and cycle patterns into a softer daily rhythm.",
      };
    case "goal_setting_cycle":
      return {
        heading: "Plan around your body",
        subheading: "Choose habits that flex with your cycle instead of fighting it.",
        wellness: ["energy", "gentle_move"],
        wellnessOrder: ["energy", "gentle_move", "better_sleep", "hydration", "mindful", "stress_rec"],
        rhythm: "morning",
        movements: ["walking", "stretch"],
        aiCopy: "Bloop is building goals that adapt to cycle timing, energy, and recovery.",
      };
    case "whole_rhythm":
      return {
        heading: "Shape your whole rhythm",
        subheading: "Choose the rituals that connect care, goals, and cycle awareness.",
        wellness: ["better_sleep", "mindful", "energy"],
        wellnessOrder: ["better_sleep", "mindful", "energy", "stress_rec", "hydration", "gentle_move"],
        rhythm: "evening",
        movements: ["yoga", "walking", "rest"],
        aiCopy: "Bloop is blending emotional care, cycle signals, and goals into one personal rhythm.",
      };
    case "self_love":
    default:
      return {
        heading: "Choose what feels gentle",
        subheading: "Pick the rituals that help you feel cared for and steady.",
        wellness: ["better_sleep", "stress_rec"],
        wellnessOrder: ["better_sleep", "stress_rec", "mindful", "hydration", "gentle_move", "energy"],
        rhythm: "evening",
        movements: ["yoga", "rest"],
        aiCopy: "Bloop is creating a Soul plan focused on emotional steadiness and softer daily care.",
      };
  }
}
