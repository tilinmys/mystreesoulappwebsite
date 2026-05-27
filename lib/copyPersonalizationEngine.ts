import {
  ADAPTIVE_CARD_COPY,
  DASHBOARD_CARD_COPY,
  DASHBOARD_GRID_COPY,
  DASHBOARD_STATE_COPY,
} from "../constants/copy";
import type {
  DashboardGridCopy,
  DashboardGridCopyValue,
  DashboardGridId,
  DashboardPersonalizationFlags,
} from "../types/personalization";

export function resolveDashboardCopyMap(
  flags: DashboardPersonalizationFlags
): Partial<Record<DashboardGridId, DashboardGridCopyValue>> {
  const base = DASHBOARD_CARD_COPY;

  const nourishBody = flags.needsEnergySupport
    ? ADAPTIVE_CARD_COPY.highEnergy.NourishPreview!.body
    : base.NourishPreview!.body;

  const wellnessBody = flags.hasHighStress
    ? ADAPTIVE_CARD_COPY.highStress.WellnessReset!.body
    : base.WellnessReset!.body;

  const sleepBody = flags.hasPoorSleep
    ? ADAPTIVE_CARD_COPY.poorSleep.SleepSupport!.body
    : base.SleepSupport!.body;

  const fertilityBody = flags.isFertilityFocused
    ? ADAPTIVE_CARD_COPY.fertilityFocused.FertilityDetail!.body
    : base.FertilityDetail!.body;

  return {
    ...DASHBOARD_GRID_COPY,
    CycleHero: flags.isFertilityFocused
      ? DASHBOARD_STATE_COPY.fertility
      : DASHBOARD_GRID_COPY.CycleHero,
    NourishPreview: { ...base.NourishPreview!, body: nourishBody },
    WellnessReset: { ...base.WellnessReset!, body: wellnessBody },
    SleepSupport: { ...base.SleepSupport!, body: sleepBody },
    FertilityDetail: { ...base.FertilityDetail!, body: fertilityBody },
    MentalHealthHub: flags.needsMoodSupport || flags.hasHighStress
      ? DASHBOARD_STATE_COPY.mood
      : DASHBOARD_GRID_COPY.MentalHealthHub,
  };
}

function copyValueToText(copy: DashboardGridCopyValue | undefined): string | undefined {
  if (typeof copy === "string" || copy == null) return copy;
  return copy.body;
}

export function getDashboardCopy(
  gridId: DashboardGridId,
  flags: DashboardPersonalizationFlags
): string | undefined {
  return copyValueToText(resolveDashboardCopyMap(flags)[gridId]);
}

export function getDashboardCardCopy(
  gridId: DashboardGridId,
  flags: DashboardPersonalizationFlags
): DashboardGridCopy | undefined {
  const copy = resolveDashboardCopyMap(flags)[gridId];
  return typeof copy === "string" ? undefined : copy;
}
