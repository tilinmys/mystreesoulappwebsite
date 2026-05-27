import type {
  DashboardGridCopy,
  DashboardGridCopyValue,
  DashboardGridId,
} from "../types/personalization";

export const DASHBOARD_GRID_COPY: Partial<
  Record<DashboardGridId, DashboardGridCopyValue>
> = {
  Header: "Your daily check-in",
  DailyLog: "Log today",
  CycleHero: "Energy is rising",
  HealthOverview: "Rhythm looks steady",
  HealthInsights: "Patterns look clear",
  NourishPreview: {
    title: "Nourish Her",
    body: "Support your phase",
    cta: "View meals",
  },
  WellnessReset: {
    title: "Wellness Reset",
    body: "Start a calm reset",
    cta: "Begin reset",
  },
  SleepSupport: {
    title: "Sleep Support",
    body: "Rest may help tonight",
    cta: "Open reset",
  },
  FertilityDetail: {
    title: "Fertile Window",
    body: "Track fertile days",
    cta: "View cycle",
  },
  LifeStageCard: "Take it slow today",
  MentalHealthHub: "Steady support today",
  GentleMovementWidget: "Move gently today",
} as const;

export const DASHBOARD_CARD_COPY: Partial<Record<DashboardGridId, DashboardGridCopy>> = {
  NourishPreview: DASHBOARD_GRID_COPY.NourishPreview as DashboardGridCopy,
  WellnessReset: DASHBOARD_GRID_COPY.WellnessReset as DashboardGridCopy,
  SleepSupport: DASHBOARD_GRID_COPY.SleepSupport as DashboardGridCopy,
  FertilityDetail: DASHBOARD_GRID_COPY.FertilityDetail as DashboardGridCopy,
} as const;

export const ADAPTIVE_CARD_COPY: Record<string, Partial<Record<DashboardGridId, DashboardGridCopy>>> = {
  highStress: {
    WellnessReset: { title: "Wellness Reset", body: "Pause for a reset", cta: "Begin reset" },
  },
  poorSleep: {
    SleepSupport: { title: "Sleep Support", body: "Your body needs rest", cta: "Open reset" },
  },
  highEnergy: {
    NourishPreview: { title: "Nourish Her", body: "Fuel your energy", cta: "View meals" },
  },
  fertilityFocused: {
    FertilityDetail: { title: "Fertile Window", body: "Track your fertile days", cta: "View cycle" },
  },
};

export const DASHBOARD_STATE_COPY = {
  cramps: "Take it slow today",
  mood: "Start a calm reset",
  energy: "Energy is rising",
  sleep: "Sleep support tonight",
  fertility: "Track fertile days",
  nourish: "Hydration supports comfort",
} as const;
