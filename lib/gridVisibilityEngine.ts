import { resolveDashboardCopyMap } from "./copyPersonalizationEngine";
import { resolveDashboardIconMap } from "./iconPersonalizationEngine";
import {
  DASHBOARD_GOAL_IDS,
  normalizeDashboardPersonalizationInput,
  resolveDashboardFlags,
  resolveDashboardGridWeights,
} from "./onboardingPriorityEngine";
import type {
  DashboardGridId,
  DashboardGridState,
  DashboardGridWeight,
  DashboardPersonalizationConfig,
  DashboardPersonalizationInput,
} from "../types/personalization";

const ALL_DASHBOARD_GRIDS: DashboardGridId[] = [
  "Header",
  "DailyLog",
  "CycleHero",
  "HealthOverview",
  "HealthInsights",
  "NourishPreview",
  "WellnessReset",
  "SleepSupport",
  "FertilityDetail",
  "LifeStageCard",
  "MentalHealthHub",
  "HealthWayRow",
  "ProgramsSection",
  "ExploredSection",
  "CompanionsRow",
  "GentleMovementWidget",
];

const HIDDEN_BY_DEFAULT: DashboardGridId[] = [
  "HealthWayRow",
  "ProgramsSection",
  "ExploredSection",
  "CompanionsRow",
  "GentleMovementWidget",
];

function uniqueGrids(grids: DashboardGridId[]): DashboardGridId[] {
  return [...new Set(grids)];
}

function withoutGrids(
  source: DashboardGridId[],
  excluded: DashboardGridId[]
): DashboardGridId[] {
  return source.filter((grid) => !excluded.includes(grid));
}

export function resolveDashboardPersonalization(
  input: DashboardPersonalizationInput = {}
): DashboardPersonalizationConfig {
  const normalized = normalizeDashboardPersonalizationInput(input);
  const flags = resolveDashboardFlags(input);
  const visibleGrids: DashboardGridId[] = [
    "Header",
    "DailyLog",
    "HealthOverview",
  ];
  const secondaryGrids: DashboardGridId[] = [];

  if (flags.isCycleFocused) visibleGrids.push("CycleHero");
  if (flags.isNutritionFocused) visibleGrids.push("NourishPreview");

  if (
    normalized.selectedGoals.includes(DASHBOARD_GOAL_IDS.innerHarmony) ||
    flags.needsCrampSupport ||
    flags.needsMoodSupport ||
    flags.needsEnergySupport ||
    flags.needsSleepSupport ||
    flags.hasHighStress ||
    flags.hasLowSleep
  ) {
    visibleGrids.push("WellnessReset");
  }

  if (flags.hasLowSleep || flags.needsSleepSupport) {
    visibleGrids.push("SleepSupport");
  }

  if (flags.isFertilityFocused) {
    visibleGrids.push("FertilityDetail");
  }

  if (normalized.lifeStage != null) {
    visibleGrids.push("LifeStageCard");
  }

  if (
    ["anxious", "overwhelmed", "burnt_out", "sad"].includes(normalized.emotionalState) ||
    flags.hasHighStress ||
    flags.isSelfLoveFocused
  ) {
    secondaryGrids.push("MentalHealthHub");
  }

  if (normalized.selectedGoals.includes(DASHBOARD_GOAL_IDS.goalSetting)) {
    secondaryGrids.push("WellnessReset");
  }

  if (!visibleGrids.includes("HealthInsights")) {
    secondaryGrids.push("HealthInsights");
  }

  const finalVisibleGrids = uniqueGrids(visibleGrids);
  const finalSecondaryGrids = uniqueGrids(
    withoutGrids(secondaryGrids, finalVisibleGrids)
  );
  const hiddenGrids = ALL_DASHBOARD_GRIDS.filter(
    (grid) =>
      !finalVisibleGrids.includes(grid) &&
      !finalSecondaryGrids.includes(grid) &&
      (HIDDEN_BY_DEFAULT.includes(grid) ||
        grid === "NourishPreview" ||
        grid === "WellnessReset" ||
        grid === "SleepSupport" ||
        grid === "FertilityDetail" ||
        grid === "LifeStageCard" ||
        grid === "MentalHealthHub" ||
        grid === "CycleHero")
  );
  const gridWeights = resolveDashboardGridWeights(input);
  const sortedSecondary = sortAdaptiveGrids(
    [...finalVisibleGrids, ...finalSecondaryGrids],
    gridWeights
  );

  const gridOrder = uniqueGrids([
    "Header",
    "DailyLog",
    "CycleHero",
    "HealthOverview",
    ...sortedSecondary,
    "HealthInsights",
    ...HIDDEN_BY_DEFAULT,
  ]);

  return {
    visibleGrids: finalVisibleGrids,
    hiddenGrids,
    secondaryGrids: finalSecondaryGrids,
    gridOrder,
    gridWeights,
    copyMap: resolveDashboardCopyMap(flags),
    iconMap: resolveDashboardIconMap(),
    flags,
  };
}

export function isGridVisible(
  config: DashboardPersonalizationConfig,
  gridId: DashboardGridId
): boolean {
  return config.visibleGrids.includes(gridId);
}

export function isGridRenderable(
  config: DashboardPersonalizationConfig,
  gridId: DashboardGridId
): boolean {
  return (
    config.visibleGrids.includes(gridId) ||
    config.secondaryGrids.includes(gridId)
  );
}

export function getDashboardGridState(
  config: DashboardPersonalizationConfig,
  gridId: DashboardGridId
): DashboardGridState {
  if (config.visibleGrids.includes(gridId)) return "visible";
  if (config.secondaryGrids.includes(gridId)) return "secondary";
  if (config.hiddenGrids.includes(gridId)) return "hidden";
  return "collapsed";
}

const ADAPTIVE_GRID_IDS: DashboardGridId[] = [
  "NourishPreview",
  "WellnessReset",
  "SleepSupport",
  "FertilityDetail",
  "MentalHealthHub",
];

function getGridWeight(
  weights: DashboardGridWeight[],
  gridId: DashboardGridId
): number {
  return weights.find((weight) => weight.gridId === gridId)?.weight ?? 0;
}

function sortAdaptiveGrids(
  grids: DashboardGridId[],
  weights: DashboardGridWeight[]
): DashboardGridId[] {
  return ADAPTIVE_GRID_IDS
    .filter((id) => grids.includes(id))
    .sort((a, b) => {
      const weightDelta = getGridWeight(weights, b) - getGridWeight(weights, a);
      return weightDelta || ADAPTIVE_GRID_IDS.indexOf(a) - ADAPTIVE_GRID_IDS.indexOf(b);
    });
}

export function resolveDashboardGridOrder(
  config: DashboardPersonalizationConfig
): DashboardGridId[] {
  return sortAdaptiveGrids(config.secondaryGrids, config.gridWeights);
}
