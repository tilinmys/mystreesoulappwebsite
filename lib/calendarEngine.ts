import type { CalendarCellState, CalendarDot } from "../types/calendar";

export function getMarkedLogDates(
  logs: Record<string, any> | null | undefined
): Set<string> {
  return new Set(Object.keys(logs || {}));
}

export function getSelectedDateLog(
  dateKey: string,
  logs: Record<string, any> | null | undefined
): any | undefined {
  if (!logs) return undefined;
  return logs[dateKey];
}

export function getCalendarDots(
  dateKey: string,
  logs: Record<string, any> | null | undefined
): CalendarDot[] {
  if (logs && logs[dateKey]) {
    // Return abstract dot data with a semantic color token name
    return [{ colorToken: "successGreen", size: 5 }];
  }
  return [];
}

export function getCalendarCellState(
  dateKey: string,
  logs: Record<string, any> | null | undefined,
  selectedDateKey: string | null | undefined,
  isToday: boolean,
  isLoggedPeriod: boolean,
  isExpectedPeriod: boolean
): CalendarCellState {
  const hasLogPayload = !!(logs && logs[dateKey]);
  const isSelected = dateKey === selectedDateKey;

  return {
    isLogged: hasLogPayload,
    hasLogPayload,
    isSelected,
    isToday,
    isLoggedPeriod,
    isExpectedPeriod,
  };
}
