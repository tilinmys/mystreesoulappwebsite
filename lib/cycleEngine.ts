import type { CycleBasics, CyclePhase, CycleWheelData } from "../types/cycle";

export function getCurrentCycleDay(
  cycleBasics: Partial<CycleBasics> | null | undefined,
  targetDate?: string | Date | null
): number {
  if (!cycleBasics || !cycleBasics.lastPeriodStart) return 1;

  const start = new Date(cycleBasics.lastPeriodStart);
  if (isNaN(start.getTime())) return 1;

  const target = targetDate
    ? new Date(targetDate)
    : new Date();
  
  // Set times to midnight to calculate purely calendar days diff
  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const cycleLength = parseInt(cycleBasics.cycleLength || "28", 10) || 28;
  if (diffDays < 0) {
    return 1;
  }

  return (diffDays % cycleLength) + 1;
}

export function getOvulationDay(cycleLength: number = 28): number {
  const len = cycleLength || 28;
  return Math.max(1, len - 14);
}

export function getCyclePhase(
  day: number,
  cycleLength: number = 28,
  periodLength: number = 5
): CyclePhase {
  const len = cycleLength || 28;
  const pLen = periodLength || 5;
  const ovulation = getOvulationDay(len);

  if (day >= 1 && day <= pLen) return "menstrual";
  if (day > pLen && day < ovulation) return "follicular";
  if (day === ovulation) return "ovulatory";
  if (day > ovulation && day <= len) return "luteal";
  return "unknown";
}

export function getPhaseLabel(phase: CyclePhase): string {
  switch (phase) {
    case "menstrual":
      return "Menstruation";
    case "follicular":
      return "Follicular Phase";
    case "ovulatory":
      return "Ovulation Day";
    case "luteal":
      return "Luteal Phase";
    default:
      return "Follicular Phase";
  }
}

export function isFertileWindow(day: number, cycleLength: number = 28): boolean {
  const ovulation = getOvulationDay(cycleLength);
  // Fertile window is usually the 5 days prior to ovulation plus ovulation day itself (6-day window)
  const start = Math.max(1, ovulation - 6);
  return day >= start && day <= ovulation;
}

export function getNextPeriodInDays(
  cycleBasics: Partial<CycleBasics> | null | undefined,
  targetDate?: string | Date | null
): number {
  if (!cycleBasics || !cycleBasics.lastPeriodStart) return 28;

  const start = new Date(cycleBasics.lastPeriodStart);
  if (isNaN(start.getTime())) return 28;

  const target = targetDate
    ? new Date(targetDate)
    : new Date();

  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const cycleLength = parseInt(cycleBasics.cycleLength || "28", 10) || 28;
  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return cycleLength;

  const currentDay = (diffDays % cycleLength) + 1;
  return cycleLength - currentDay + 1;
}

export function getCycleWheelData(
  cycleBasics: Partial<CycleBasics> | null | undefined,
  targetDate?: string | Date | null
): CycleWheelData {
  const currentDay = getCurrentCycleDay(cycleBasics, targetDate);
  const cycleLength = parseInt(cycleBasics?.cycleLength || "28", 10) || 28;
  const periodLength = parseInt(cycleBasics?.periodLength || "5", 10) || 5;

  const phase = getCyclePhase(currentDay, cycleLength, periodLength);
  const phaseLabel = getPhaseLabel(phase);
  const nextPeriodInDays = getNextPeriodInDays(cycleBasics, targetDate);
  const ovulationDay = getOvulationDay(cycleLength);
  
  // Calculate fertile window range bounds
  const fertileWindowStart = Math.max(1, ovulationDay - 6);
  const fertileWindowEnd = ovulationDay;

  return {
    currentDay,
    phase,
    phaseLabel,
    nextPeriodInDays,
    ovulationDay,
    fertileWindowStart,
    fertileWindowEnd,
  };
}
