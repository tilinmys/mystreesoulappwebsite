"use client";

import {
  addDays,
  getCurrentCycleDay,
  getCyclePhase,
  getTemperatureForCycleDay,
  getWeekdayLabel,
  type CyclePhaseDetails,
} from "@/lib/cycle-tracker";
import type {
  FertilityFluid,
  FertilityLogRecord,
  FertilityLhResult,
} from "@/lib/use-fertility-log-state";

export type FertilityCompanionModel = {
  hasLoggedData: boolean;
  statusChip: string;
  headline: string;
  subtitle: string;
  score: number;
  scoreLabel: string;
  markerPercent: number;
  phase: CyclePhaseDetails;
  lhValue: number;
  lhDeltaLabel: string;
  lhBars: Array<{
    label: string;
    shortLabel: string;
    value: number;
    active: boolean;
    projected: boolean;
  }>;
  bloopMessage: string;
  guideTitle: string;
  guideBody: string;
  guideAction: string;
  emptyStateTitle: string;
  emptyStateBody: string;
};

export function buildFertilityCompanionModel(params: {
  cycleStart: Date;
  cycleLength: number;
  flowDuration: number;
  anchorDate: Date;
  fertilityLog: FertilityLogRecord | null;
}): FertilityCompanionModel {
  const { cycleStart, cycleLength, flowDuration, anchorDate, fertilityLog } =
    params;
  const cycleDay = getCurrentCycleDay(cycleStart, cycleLength, anchorDate);
  const phase = getCyclePhase(cycleDay, cycleLength, flowDuration);
  const midCycleDay = Math.max(flowDuration + 5, Math.round(cycleLength / 2));
  const daysToOvulation = midCycleDay - cycleDay;
  const score = getFertilityScore(phase.key, cycleDay, midCycleDay);
  const markerPercent = Math.min(90, Math.max(10, 10 + score * 0.8));
  const hasLoggedData = Boolean(fertilityLog);
  const currentTemp =
    fertilityLog?.basalTemp ??
    getTemperatureForCycleDay(cycleDay, cycleLength, flowDuration);
  const lhValue = getLhValue(cycleDay, midCycleDay, fertilityLog?.lhResult);
  const lhBars = buildLhBars({
    anchorDate,
    cycleStart,
    cycleLength,
    flowDuration,
    midCycleDay,
    todayLhResult: fertilityLog?.lhResult,
  });

  return {
    hasLoggedData,
    statusChip: getStatusChip(score, phase.key),
    headline: getHeadline(score, phase.key),
    subtitle: getSubtitle(daysToOvulation, phase.key),
    score,
    scoreLabel: getScoreLabel(score, hasLoggedData),
    markerPercent,
    phase,
    lhValue,
    lhDeltaLabel: getLhDeltaLabel(fertilityLog?.lhResult, hasLoggedData),
    lhBars,
    bloopMessage: getBloopMessage({
      phase,
      fertilityLog,
      currentTemp,
      daysToOvulation,
    }),
    guideTitle: getGuideTitle(score, phase.key),
    guideBody: getGuideBody(phase.key, fertilityLog?.cervicalFluid),
    guideAction: getGuideAction(phase.key),
    emptyStateTitle: "Not enough data yet",
    emptyStateBody:
      "Add your first LH result, temperature, or fluid check-in to unlock a real trend instead of an estimate.",
  };
}

function getFertilityScore(
  phaseKey: CyclePhaseDetails["key"],
  cycleDay: number,
  midCycleDay: number,
) {
  const distance = Math.abs(cycleDay - midCycleDay);

  if (phaseKey === "ovulatory") {
    return Math.max(88, 98 - distance * 4);
  }

  if (phaseKey === "follicular") {
    return Math.max(38, 82 - distance * 8);
  }

  if (phaseKey === "luteal") {
    return Math.max(10, 28 - distance * 2);
  }

  return Math.max(6, 18 - distance);
}

function getStatusChip(score: number, phaseKey: CyclePhaseDetails["key"]) {
  if (phaseKey === "ovulatory" || score >= 86) {
    return "Window Open";
  }

  if (phaseKey === "follicular" && score >= 58) {
    return "Window Building";
  }

  if (phaseKey === "luteal") {
    return "Window Closing";
  }

  return "Low Window";
}

function getHeadline(score: number, phaseKey: CyclePhaseDetails["key"]) {
  if (phaseKey === "ovulatory" || score >= 90) {
    return "Peak Fertility";
  }

  if (phaseKey === "follicular" && score >= 60) {
    return "High Fertility Window";
  }

  if (phaseKey === "follicular") {
    return "Fertility Building";
  }

  if (phaseKey === "luteal") {
    return "Fertility Easing";
  }

  return "Window Resting";
}

function getSubtitle(daysToOvulation: number, phaseKey: CyclePhaseDetails["key"]) {
  if (phaseKey === "ovulatory") {
    if (daysToOvulation >= 1) {
      return `Ovulation likely in ${daysToOvulation} day${daysToOvulation === 1 ? "" : "s"}`;
    }

    if (daysToOvulation === 0) {
      return "Ovulation likely within the next 24 hours";
    }

    return `Ovulation likely passed ${Math.abs(daysToOvulation)} day${Math.abs(daysToOvulation) === 1 ? "" : "s"} ago`;
  }

  if (phaseKey === "follicular") {
    return daysToOvulation > 0
      ? `Ovulation likely in ${daysToOvulation} day${daysToOvulation === 1 ? "" : "s"}`
      : "Your fertile window is nearing its peak";
  }

  if (phaseKey === "luteal") {
    return "Your current cycle is in its lower fertility window";
  }

  return "Your body is still in an early cycle reset";
}

function getScoreLabel(score: number, hasLoggedData: boolean) {
  if (!hasLoggedData) {
    return "Estimated window";
  }

  if (score >= 90) {
    return "High (98%)";
  }

  if (score >= 65) {
    return `Strong (${score}%)`;
  }

  if (score >= 35) {
    return `Rising (${score}%)`;
  }

  return `Low (${score}%)`;
}

function getLhValue(
  cycleDay: number,
  midCycleDay: number,
  lhResult: FertilityLhResult | undefined,
) {
  if (lhResult === "peak") {
    return 1.24;
  }

  if (lhResult === "positive") {
    return 0.88;
  }

  if (lhResult === "negative") {
    return 0.36;
  }

  const distance = Math.abs(cycleDay - midCycleDay);
  const value = Math.max(0.18, 1.18 - distance * 0.16);
  return Number(value.toFixed(2));
}

function buildLhBars(params: {
  anchorDate: Date;
  cycleStart: Date;
  cycleLength: number;
  flowDuration: number;
  midCycleDay: number;
  todayLhResult: FertilityLhResult | undefined;
}) {
  const {
    anchorDate,
    cycleStart,
    cycleLength,
    flowDuration,
    midCycleDay,
    todayLhResult,
  } = params;

  return Array.from({ length: 7 }, (_, index) => {
    const offset = index - 3;
    const date = addDays(anchorDate, offset);
    const cycleDay = getCurrentCycleDay(cycleStart, cycleLength, date);
    const phase = getCyclePhase(cycleDay, cycleLength, flowDuration);
    const base = getLhValue(
      cycleDay,
      midCycleDay,
      offset === 0 ? todayLhResult : undefined,
    );

    return {
      label: getWeekdayLabel(date),
      shortLabel: getWeekdayLabel(date).slice(0, 1),
      value: Math.max(20, Math.min(100, Math.round(base * 72))),
      active: offset === 0,
      projected: offset > 0 && phase.key !== "ovulatory",
    };
  });
}

function getLhDeltaLabel(
  lhResult: FertilityLhResult | undefined,
  hasLoggedData: boolean,
) {
  if (!hasLoggedData) {
    return "Log a first result";
  }

  if (lhResult === "peak") {
    return "Peak confirmed";
  }

  if (lhResult === "positive") {
    return "+18% vs yesterday";
  }

  if (lhResult === "negative") {
    return "Baseline read";
  }

  return "Surge watch";
}

function getBloopMessage(params: {
  phase: CyclePhaseDetails;
  fertilityLog: FertilityLogRecord | null;
  currentTemp: number;
  daysToOvulation: number;
}) {
  const { phase, fertilityLog, currentTemp, daysToOvulation } = params;

  if (!fertilityLog) {
    if (daysToOvulation <= 1 && phase.key !== "luteal") {
      return `Your body is close to its peak fertile window. Logging an LH test and cervical fluid today would give a stronger signal.`;
    }

    return `Your fertility signals are ${phase.headline}. A quick log today will help Bloop refine your timing and support.`;
  }

  const fluidText = getFluidLabel(fertilityLog.cervicalFluid);
  const intimacyText = fertilityLog.intercourse
    ? "You also logged intercourse today."
    : "You have not logged intercourse today.";

  return `Your temperature is ${currentTemp.toFixed(1)} degrees, LH is ${fertilityLog.lhResult}, and fluid is ${fluidText}. ${intimacyText}`;
}

function getGuideTitle(score: number, phaseKey: CyclePhaseDetails["key"]) {
  if (phaseKey === "ovulatory" || score >= 86) {
    return "Optimizing Conception";
  }

  if (phaseKey === "follicular") {
    return "Preparing the Window";
  }

  return "Hormone-Friendly Support";
}

function getGuideBody(
  phaseKey: CyclePhaseDetails["key"],
  fluid: FertilityFluid | undefined,
) {
  if (phaseKey === "ovulatory") {
  return `Lean into hydration, easier recovery, and lower stress. ${fluid === "egg_white" ? "Egg-white fluid is a strong fertile sign today." : "If fluid becomes watery or egg-white, your fertile timing is likely strongest."}`;
  }

  if (phaseKey === "follicular") {
    return "This is a good time for steadier sleep, protein-rich meals, and logging daily body cues before the window peaks.";
  }

  if (phaseKey === "luteal") {
    return "Your fertile window is easing, so this is a better time to review trends, update notes, and reset for the next cycle.";
  }

  return "Your body is still early in the cycle. Use this phase to capture baseline readings without pressure.";
}

function getGuideAction(phaseKey: CyclePhaseDetails["key"]) {
  if (phaseKey === "ovulatory") {
    return "Read conception guide";
  }

  if (phaseKey === "follicular") {
    return "See timing tips";
  }

  return "Review cycle trends";
}

function getFluidLabel(fluid: FertilityFluid) {
  switch (fluid) {
    case "dry":
      return "dry";
    case "creamy":
      return "creamy";
    case "watery":
      return "watery";
    case "egg_white":
      return "egg-white";
    default:
      return "not logged";
  }
}
