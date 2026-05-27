export type CycleBasics = {
  lastPeriodStart: string;
  periodLength: string;
  cycleLength: string;
  usualFlow: string;
  supportNeeds: string[];
  fertilityIntent: string;
};

export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal" | "unknown";

export type CycleWheelData = {
  currentDay: number;
  phase: CyclePhase;
  phaseLabel: string;
  nextPeriodInDays: number;
  ovulationDay: number;
  fertileWindowStart: number;
  fertileWindowEnd: number;
};
