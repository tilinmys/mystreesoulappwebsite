import type {
  DashboardGridId,
  DashboardGridWeight,
  DashboardPersonalizationFlags,
  DashboardPersonalizationInput,
  NormalizedDashboardPersonalizationInput,
} from "../types/personalization";

const DEFAULT_SELECTED_GOALS = ["cycle"] as const;
const LOW_SLEEP_SCORES = new Set(["poor", "okay"]);
const POOR_SLEEP_SCORES = new Set(["poor", "restless"]);
const HIGH_STRESS_THRESHOLD = 70;
const HIGH_STRESS_STATES = new Set(["anxious", "overwhelmed"]);
export const DASHBOARD_GOAL_IDS = {
  cycle: "cycle",
  nutrition: "nutrition",
  innerHarmony: "inner_harmony",
  selfLove: "self_love",
  goalSetting: "goal_setting",
} as const;

const NOURISH_PREVIEW_GOAL_IDS = [DASHBOARD_GOAL_IDS.nutrition] as const;

function normalizeText(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeFertilityIntent(value: string | null | undefined): string {
  return normalizeText(value).replace(/_/g, " ").trim();
}

function normalizeList(values: string[] | null | undefined): string[] {
  return (values ?? []).map(normalizeText).filter(Boolean);
}

function hasAny(values: string[], terms: string[]): boolean {
  return values.some((value) =>
    terms.some((term) => value === term || value.includes(term))
  );
}

function hasGoal(values: string[], goals: readonly string[]): boolean {
  return values.some((value) => goals.includes(value));
}

export function isNutritionGoalSelected(selectedGoals: string[]): boolean {
  return hasGoal(selectedGoals, NOURISH_PREVIEW_GOAL_IDS);
}

export function normalizeDashboardPersonalizationInput(
  input: DashboardPersonalizationInput = {}
): NormalizedDashboardPersonalizationInput {
  const selectedGoals = normalizeList(input.selectedGoals);

  return {
    selectedGoals: selectedGoals.length > 0 ? selectedGoals : [...DEFAULT_SELECTED_GOALS],
    lifeStage: input.lifeStage ?? null,
    supportNeeds: normalizeList(input.cycleBasics?.supportNeeds),
    fertilityIntent: normalizeFertilityIntent(input.cycleBasics?.fertilityIntent),
    emotionalState: normalizeText(input.emotionalState) || "calm",
    stressLevel: typeof input.stressLevel === "number" ? input.stressLevel : 0,
    sleepScore: normalizeText(input.sleepScore) || "okay",
    name: String(input.name ?? "").trim(),
  };
}

export function resolveDashboardFlags(
  input: DashboardPersonalizationInput = {}
): DashboardPersonalizationFlags {
  const normalized = normalizeDashboardPersonalizationInput(input);
  const supportNeeds = normalized.supportNeeds;
  const selectedGoals = normalized.selectedGoals;
  const hasHighStress =
    normalized.stressLevel >= HIGH_STRESS_THRESHOLD ||
    HIGH_STRESS_STATES.has(normalized.emotionalState);
  const hasLowSleep = LOW_SLEEP_SCORES.has(normalized.sleepScore);
  const hasPoorSleep = POOR_SLEEP_SCORES.has(normalized.sleepScore);
  const isSelfLoveFocused = selectedGoals.includes(DASHBOARD_GOAL_IDS.selfLove);
  const isDenseReduced = hasHighStress;

  return {
    needsCrampSupport: hasAny(supportNeeds, ["cramp", "pain"]),
    needsMoodSupport: hasAny(supportNeeds, ["mood", "emotion", "stress"]),
    needsEnergySupport: hasAny(supportNeeds, ["energy", "fatigue", "tired"]),
    needsSleepSupport: hasAny(supportNeeds, ["sleep", "rest"]),
    hasHighStress,
    hasLowSleep,
    hasPoorSleep,
    isNutritionFocused: isNutritionGoalSelected(selectedGoals),
    isCycleFocused:
      selectedGoals.includes(DASHBOARD_GOAL_IDS.cycle) ||
      normalized.lifeStage === "cycle_fertility",
    isFertilityFocused:
      normalized.fertilityIntent === "yes" ||
      normalized.fertilityIntent === "maybe later",
    isSelfLoveFocused,
    isDenseReduced,
  };
}

export function getDashboardPriorityScore(
  input: DashboardPersonalizationInput = {}
) {
  const flags = resolveDashboardFlags(input);

  return {
    cycle: flags.isCycleFocused ? 3 : 1,
    nourish: flags.isNutritionFocused ? 3 : flags.needsEnergySupport ? 2 : 0,
    wellness:
      flags.hasHighStress ||
      flags.needsCrampSupport ||
      flags.needsMoodSupport ||
      flags.needsEnergySupport ||
      flags.needsSleepSupport
        ? 3
        : 0,
    sleep: flags.hasLowSleep || flags.needsSleepSupport ? 3 : 0,
    fertility: flags.isFertilityFocused ? 3 : 0,
  } as const;
}

const GRID_BASE_WEIGHTS: Record<string, number> = {
  NourishPreview: 40,
  WellnessReset: 45,
  SleepSupport: 42,
  FertilityDetail: 38,
  MentalHealthHub: 36,
};

const ADAPTIVE_WEIGHT_GRIDS: DashboardGridId[] = [
  "NourishPreview",
  "WellnessReset",
  "SleepSupport",
  "FertilityDetail",
  "MentalHealthHub",
];

export function resolveDashboardGridWeights(
  input: DashboardPersonalizationInput = {}
): DashboardGridWeight[] {
  const flags = resolveDashboardFlags(input);
  const w = { ...GRID_BASE_WEIGHTS };

  if (flags.hasHighStress) {
    w.WellnessReset += 25;
    w.SleepSupport += 18;
  }
  if (flags.hasPoorSleep) {
    w.SleepSupport += 30;
    w.WellnessReset += 12;
  }
  if (flags.isNutritionFocused) {
    w.NourishPreview += 28;
  }
  if (flags.isFertilityFocused) {
    w.FertilityDetail += 22;
  }
  if (flags.isSelfLoveFocused) {
    w.MentalHealthHub += 15;
  }

  return ADAPTIVE_WEIGHT_GRIDS.map((gridId) => ({
    gridId,
    weight: w[gridId],
  }));
}
