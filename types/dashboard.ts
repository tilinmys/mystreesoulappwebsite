import type { CycleWheelData } from "./cycle";
import type { DashboardGridId, DashboardGridCopy } from "./personalization";

export type DashboardEngineInput = {
  onboardingProfile: {
    name: string;
    selectedGoals: string[];
    lifeStage: string | null;
    stressLevel: number;
    sleepScore: string;
    emotionalState: string;
    cycleBasics?: {
      supportNeeds?: string[] | null;
      fertilityIntent?: string | null;
    } | null;
  } | null | undefined;
  cycleState: CycleWheelData;
  todayLog: {
    mood?: string;
    flow?: string;
    energyLevel?: number;
    stressLevel?: number;
    symptoms?: string[];
    journalEntry?: string;
  } | null | undefined;
};

export type DashboardHeroData = {
  title: string;
  body: string;
  tag?: string;
};

export type DashboardStatsData = {
  dayOfCycle: number;
  phaseName: string;
  nextEventText: string;
};

export type DashboardEngineOutput = {
  hero: DashboardHeroData;
  stats: DashboardStatsData;
  visibleCards: DashboardGridId[];
  secondaryCards: DashboardGridId[];
  hiddenCards: DashboardGridId[];
  copyMap: Partial<Record<DashboardGridId, string | DashboardGridCopy>>;
  priorityReason: string;
};
