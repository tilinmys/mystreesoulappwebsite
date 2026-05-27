import type { DashboardGridId } from "../types/personalization";

export const DASHBOARD_GRID_ICONS: Partial<Record<DashboardGridId, string>> = {
  CycleHero: "CircleDashed",
  HealthOverview: "Activity",
  NourishPreview: "Salad",
  WellnessReset: "Wind",
  SleepSupport: "MoonStar",
  FertilityDetail: "CalendarDays",
  LifeStageCard: "UserRound",
  MentalHealthHub: "Waves",
} as const;
