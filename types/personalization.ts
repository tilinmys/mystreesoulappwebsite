export type DashboardGridId =
  | "Header"
  | "DailyLog"
  | "CycleHero"
  | "HealthOverview"
  | "HealthInsights"
  | "NourishPreview"
  | "WellnessReset"
  | "SleepSupport"
  | "FertilityDetail"
  | "LifeStageCard"
  | "MentalHealthHub"
  | "HealthWayRow"
  | "ProgramsSection"
  | "ExploredSection"
  | "CompanionsRow"
  | "GentleMovementWidget";

export type DashboardGridState = "visible" | "hidden" | "collapsed" | "secondary";

export type DashboardGridWeight = {
  gridId: DashboardGridId;
  weight: number;
};

export type DashboardGridCopy = {
  title: string;
  body: string;
  cta: string;
};

export type DashboardGridCopyValue = string | DashboardGridCopy;

export type PersonalizationLifeStage =
  | "teen"
  | "cycle_fertility"
  | "pregnancy"
  | "menopause"
  | null;

export type DashboardPersonalizationFlags = {
  needsCrampSupport: boolean;
  needsMoodSupport: boolean;
  needsEnergySupport: boolean;
  needsSleepSupport: boolean;
  hasHighStress: boolean;
  hasLowSleep: boolean;
  hasPoorSleep: boolean;
  isNutritionFocused: boolean;
  isCycleFocused: boolean;
  isFertilityFocused: boolean;
  isSelfLoveFocused: boolean;
  isDenseReduced: boolean;
};

export type DashboardPersonalizationConfig = {
  visibleGrids: DashboardGridId[];
  hiddenGrids: DashboardGridId[];
  secondaryGrids: DashboardGridId[];
  gridOrder: DashboardGridId[];
  gridWeights: DashboardGridWeight[];
  copyMap: Partial<Record<DashboardGridId, DashboardGridCopyValue>>;
  iconMap: Partial<Record<DashboardGridId, string>>;
  flags: DashboardPersonalizationFlags;
};

export type DashboardPersonalizationInput = {
  selectedGoals?: string[] | null;
  lifeStage?: PersonalizationLifeStage;
  cycleBasics?: {
    supportNeeds?: string[] | null;
    fertilityIntent?: string | null;
  } | null;
  emotionalState?: string | null;
  stressLevel?: number | null;
  sleepScore?: string | null;
  name?: string | null;
};

export type NormalizedDashboardPersonalizationInput = {
  selectedGoals: string[];
  lifeStage: PersonalizationLifeStage;
  supportNeeds: string[];
  fertilityIntent: string;
  emotionalState: string;
  stressLevel: number;
  sleepScore: string;
  name: string;
};
