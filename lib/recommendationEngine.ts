import type { CycleWheelData } from "../types/cycle";
import type {
  NourishRecommendation,
  ResetRecommendation,
  SleepRecommendation,
} from "../types/recommendation";

export function getNourishRecommendation(
  profile: any,
  cycleState: CycleWheelData
): NourishRecommendation {
  const phase = cycleState?.phase || "unknown";

  switch (phase) {
    case "menstrual":
      return {
        headline: "Warm meals support comfort",
        advice: "Incorporate magnesium rich foods like seeds and leafy greens.",
      };
    case "follicular":
      return {
        headline: "Energy rising eat fresh",
        advice: "Support your climbing energy with light salads and lean protein.",
      };
    case "ovulatory":
      return {
        headline: "Peak state eat clean",
        advice: "Consume cruciferous vegetables to help clear excess estrogen levels.",
      };
    case "luteal":
    default:
      return {
        headline: "Slow down steady foods",
        advice: "Choose slow release complex carbohydrates to help control sugar cravings.",
      };
  }
}

export function getSleepRecommendation(
  profile: any,
  todayLog: any
): SleepRecommendation {
  const sleepScore = todayLog?.sleepScore || profile?.sleepScore || "okay";
  const stressLevel = todayLog?.stressLevel !== undefined ? todayLog.stressLevel : (profile?.stressLevel ?? 50);

  if (sleepScore === "poor" || sleepScore === "restless") {
    return {
      headline: "Rest may help tonight",
      advice: "Limit evening lights and wind down 60 minutes before bedtime.",
    };
  }

  if (stressLevel >= 70) {
    return {
      headline: "Calm the mind tonight",
      advice: "Try a five minute progressive body scan before turning off lights.",
    };
  }

  return {
    headline: "Protect sleep hours tonight",
    advice: "Maintaining a regular routine supports natural circadian rhythm.",
  };
}

export function getResetRecommendation(
  profile: any,
  cycleState: CycleWheelData,
  todayLog: any
): ResetRecommendation {
  const stressLevel = todayLog?.stressLevel !== undefined ? todayLog.stressLevel : (profile?.stressLevel ?? 50);
  const phase = cycleState?.phase || "unknown";

  if (stressLevel >= 70) {
    return {
      headline: "Start a calm reset",
      advice: "Disconnect from notifications and focus on calm nasal breathing.",
    };
  }

  if (phase === "menstrual") {
    return {
      headline: "Take it slow today",
      advice: "Rest is essential for your body's restorative processes right now.",
    };
  }

  return {
    headline: "Move with quiet rhythm",
    advice: "A simple walk outside supports emotional balance and mood.",
  };
}

export function getTodayRecommendations(
  profile: any,
  cycleState: CycleWheelData,
  todayLog: any
): {
  nourish: NourishRecommendation;
  reset: ResetRecommendation;
  sleep: SleepRecommendation;
} {
  return {
    nourish: getNourishRecommendation(profile, cycleState),
    reset: getResetRecommendation(profile, cycleState, todayLog),
    sleep: getSleepRecommendation(profile, todayLog),
  };
}
