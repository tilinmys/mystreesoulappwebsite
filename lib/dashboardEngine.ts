import type {
  DashboardEngineInput,
  DashboardEngineOutput,
  DashboardHeroData,
  DashboardStatsData,
} from "../types/dashboard";
import type { DashboardGridId } from "../types/personalization";
import { resolveDashboardPersonalization } from "./gridVisibilityEngine";

export function resolveDashboardCards(
  input: DashboardEngineInput
): {
  visible: DashboardGridId[];
  secondary: DashboardGridId[];
  hidden: DashboardGridId[];
} {
  const profile = input.onboardingProfile;
  const personalizationInput = {
    selectedGoals: profile?.selectedGoals || [],
    lifeStage: profile?.lifeStage as any,
    cycleBasics: profile?.cycleBasics as any,
    emotionalState: profile?.emotionalState || "calm",
    stressLevel: profile?.stressLevel !== undefined && profile?.stressLevel !== null ? profile.stressLevel : 50,
    sleepScore: profile?.sleepScore || "okay",
    name: profile?.name || "",
  };

  const config = resolveDashboardPersonalization(personalizationInput);
  return {
    visible: config.visibleGrids,
    secondary: config.secondaryGrids,
    hidden: config.hiddenGrids,
  };
}

export function resolveDashboardCopy(
  input: DashboardEngineInput
): Record<string, any> {
  const profile = input.onboardingProfile;
  const personalizationInput = {
    selectedGoals: profile?.selectedGoals || [],
    lifeStage: profile?.lifeStage as any,
    cycleBasics: profile?.cycleBasics as any,
    emotionalState: profile?.emotionalState || "calm",
    stressLevel: profile?.stressLevel !== undefined && profile?.stressLevel !== null ? profile.stressLevel : 50,
    sleepScore: profile?.sleepScore || "okay",
    name: profile?.name || "",
  };

  const config = resolveDashboardPersonalization(personalizationInput);
  return config.copyMap;
}

export function resolveDashboardOrder(
  input: DashboardEngineInput
): DashboardGridId[] {
  const profile = input.onboardingProfile;
  const personalizationInput = {
    selectedGoals: profile?.selectedGoals || [],
    lifeStage: profile?.lifeStage as any,
    cycleBasics: profile?.cycleBasics as any,
    emotionalState: profile?.emotionalState || "calm",
    stressLevel: profile?.stressLevel !== undefined && profile?.stressLevel !== null ? profile.stressLevel : 50,
    sleepScore: profile?.sleepScore || "okay",
    name: profile?.name || "",
  };

  const config = resolveDashboardPersonalization(personalizationInput);
  return config.gridOrder;
}

export function resolveDashboardState(
  input: DashboardEngineInput
): DashboardEngineOutput {
  const profile = input.onboardingProfile;
  const personalizationInput = {
    selectedGoals: profile?.selectedGoals || [],
    lifeStage: profile?.lifeStage as any,
    cycleBasics: profile?.cycleBasics as any,
    emotionalState: profile?.emotionalState || "calm",
    stressLevel: profile?.stressLevel !== undefined && profile?.stressLevel !== null ? profile.stressLevel : 50,
    sleepScore: profile?.sleepScore || "okay",
    name: profile?.name || "",
  };

  const config = resolveDashboardPersonalization(personalizationInput);
  const cycle = input.cycleState;
  const name = profile?.name || "";

  // 1. Resolve Hero banner copy
  let hero: DashboardHeroData = {
    title: `Welcome back, ${name || "friend"}`,
    body: "Track your cycle to receive personalized support cards.",
    tag: "Hormonal Balance",
  };

  if (personalizationInput.stressLevel >= 70 || personalizationInput.emotionalState === "anxious") {
    hero = {
      title: `Take a deep breath, ${name || "friend"}`,
      body: "Your nervous system is carrying extra load today. We've prioritized a quiet movement flow and sleep-prep suggestions.",
      tag: "Calm Reset",
    };
  } else {
    switch (cycle.phase) {
      case "menstrual":
        hero = {
          title: `Your body is resetting, ${name || "friend"}`,
          body: "Bleeding requires heavy energy conservation. Rest is your absolute superpower for the next few days.",
          tag: "Menstruation",
        };
        break;
      case "follicular":
        hero = {
          title: `Your energy is rising, ${name || "friend"}`,
          body: "Estrogen is climbing, boosting focus and motivation. Perfect window for fresh plans and steady movements.",
          tag: "Follicular Phase",
        };
        break;
      case "ovulatory":
        hero = {
          title: `Your peak vitality is here, ${name || "friend"}`,
          body: "Estrogen and testosterone are at their highest, making you communicative and vibrant. Enjoy your peak window today.",
          tag: "Ovulation",
        };
        break;
      case "luteal":
        hero = {
          title: `Embrace the quiet transition, ${name || "friend"}`,
          body: "Progesterone is dominant now, signaling your body to wind down and slow its tempo. Protect your sleep and rest.",
          tag: "Luteal Phase",
        };
        break;
    }
  }

  // 2. Resolve stats panel indicators
  const stats: DashboardStatsData = {
    dayOfCycle: cycle.currentDay,
    phaseName: cycle.phaseLabel,
    nextEventText: `Next period in ${cycle.nextPeriodInDays} days`,
  };

  // 3. Resolve priority reasons
  let priorityReason = "Standard priority applied based on cycle phase timeline.";
  if (personalizationInput.stressLevel >= 70) {
    priorityReason = "Elevated stress detected, prioritizing calm/reset cards.";
  } else if (personalizationInput.sleepScore === "poor" || personalizationInput.sleepScore === "restless") {
    priorityReason = "Poor sleep score detected, elevating sleep support cards.";
  }

  return {
    hero,
    stats,
    visibleCards: config.visibleGrids,
    secondaryCards: config.secondaryGrids,
    hiddenCards: config.hiddenGrids,
    copyMap: config.copyMap,
    priorityReason,
  };
}
