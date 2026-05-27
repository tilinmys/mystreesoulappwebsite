import type { CycleWheelData } from "./cycle";

export type CalendarCellState = {
  isLogged: boolean;
  hasLogPayload: boolean;
  isSelected: boolean;
  isToday: boolean;
  isLoggedPeriod: boolean;
  isExpectedPeriod: boolean;
};

export type CalendarDot = {
  colorToken: string;
  size: number;
};
