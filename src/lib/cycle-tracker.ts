"use client";

export type CyclePhaseKey =
  | "menstrual"
  | "follicular"
  | "ovulatory"
  | "luteal";

export type CyclePhaseDetails = {
  key: CyclePhaseKey;
  label: string;
  shortLabel: string;
  headline: string;
  guidance: string;
  badge: string;
  tooltip: string;
  fertilityHeadline: string;
  insight: string;
  narrativeTitle: string;
  narrativeBody: string;
  bodySignalTitle: string;
  bodySignalBody: string;
  supportTitle: string;
  supportBody: string;
  ringStroke: string;
  cardTint: string;
};

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function parseDateValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return getTodayAtNoon();
  }

  return new Date(year, month - 1, day, 12);
}

export function formatDateValue(date: Date): string {
  const normalized = atNoon(date);
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, "0");
  const day = String(normalized.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayAtNoon(): Date {
  return atNoon(new Date());
}

export function atNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

export function addDays(date: Date, days: number): Date {
  const next = atNoon(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function differenceInDays(later: Date, earlier: Date): number {
  const laterDay = atNoon(later);
  const earlierDay = atNoon(earlier);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((laterDay.getTime() - earlierDay.getTime()) / millisecondsPerDay);
}

export function isSameDay(left: Date, right: Date): boolean {
  return formatDateValue(left) === formatDateValue(right);
}

export function getCurrentCycleDay(
  cycleStart: Date,
  cycleLength: number,
  targetDate: Date,
): number {
  const safeCycleLength = Math.max(cycleLength, 1);
  const difference = differenceInDays(targetDate, cycleStart);
  return ((difference % safeCycleLength) + safeCycleLength) % safeCycleLength + 1;
}

export function getDaysUntilNextPeriod(
  cycleDay: number,
  cycleLength: number,
): number {
  return Math.max(1, cycleLength - cycleDay + 1);
}

export function getCyclePhase(
  cycleDay: number,
  cycleLength: number,
  flowDuration: number,
): CyclePhaseDetails {
  if (cycleDay <= flowDuration) {
    return {
      key: "menstrual",
      label: "menstrual phase",
      shortLabel: "Menstrual",
      headline: "softening",
      guidance: "Rest and hydrate during this phase.",
      badge: "Restore Phase",
      tooltip: "Light activity",
      fertilityHeadline: "Low fertility",
      insight:
        "Warmth, hydration, and lighter movement can help your body feel more supported right now.",
      narrativeTitle: "Your body is in the menstrual phase.",
      narrativeBody:
        "Your body is shedding the uterine lining, so softer routines and extra rest can feel especially supportive.",
      bodySignalTitle: "Body signal",
      bodySignalBody:
        "Cramping, lower energy, and a stronger need for rest are all common at this point in the cycle.",
      supportTitle: "Support focus",
      supportBody:
        "Think warm meals, iron-rich foods, easy stretching, and protecting your evenings from extra pressure.",
      ringStroke: "#9c3e24",
      cardTint: "#f9ece6",
    };
  }

  if (cycleDay <= Math.max(flowDuration + 6, Math.floor(cycleLength / 2) - 2)) {
    return {
      key: "follicular",
      label: "follicular phase",
      shortLabel: "Follicular",
      headline: "building",
      guidance: "Momentum is naturally returning.",
      badge: "Rise Phase",
      tooltip: "Fresh energy",
      fertilityHeadline: "Increasing fertility",
      insight:
        "Planning, lighter cardio, and creative work often feel easier as estrogen begins to climb.",
      narrativeTitle: "Your energy is beginning to rise again.",
      narrativeBody:
        "This phase often feels clearer and more open. Many people notice steadier motivation and curiosity here.",
      bodySignalTitle: "Body signal",
      bodySignalBody:
        "Cervical fluid may feel creamier or more present as your body moves toward the fertile window.",
      supportTitle: "Support focus",
      supportBody:
        "Use this stretch for fresh starts, nourishing protein, hydration, and reintroducing a little more movement.",
      ringStroke: "#bc563a",
      cardTint: "#fbf0eb",
    };
  }

  if (cycleDay <= Math.floor(cycleLength / 2) + 2) {
    return {
      key: "ovulatory",
      label: "ovulation window",
      shortLabel: "Ovulatory",
      headline: "near ovulation",
      guidance: "You may feel brighter and more outward-facing.",
      badge: "Peak Window",
      tooltip: "Brighter energy",
      fertilityHeadline: "Highest fertility",
      insight:
        "This is a strong time to pay attention to cervical changes, hydration, and your body's energy fluctuations.",
      narrativeTitle: "LH is near its hormonal peak.",
      narrativeBody:
        "Communication, confidence, and social energy can feel easier to access here, and fertility is often at its highest.",
      bodySignalTitle: "Body signal",
      bodySignalBody:
        "Clearer cervical fluid, a subtle temperature shift, or increased libido may show up around this window.",
      supportTitle: "Support focus",
      supportBody:
        "Steady carbs, protein, hydration, and enough recovery help keep this higher-energy window feeling smooth.",
      ringStroke: "#8d6554",
      cardTint: "#f7ede8",
    };
  }

  return {
      key: "luteal",
      label: "luteal phase",
      shortLabel: "Luteal",
      headline: "deepening",
    guidance: "Reduce stress where you can today.",
    badge: "Nesting Phase",
    tooltip: "Inner focus",
    fertilityHeadline: "Lower fertility",
    insight:
      "A steadier routine, softer evenings, and magnesium-rich foods can help support your luteal rhythm.",
    narrativeTitle: "Your rhythm is turning inward again.",
    narrativeBody:
      "After ovulation, progesterone rises and many people notice more reflection, sensitivity, or a gentle energy dip.",
    bodySignalTitle: "Body signal",
    bodySignalBody:
      "Bloating, appetite shifts, breast tenderness, or a lower social battery can become more noticeable now.",
    supportTitle: "Support focus",
      supportBody:
        "Reduce stress where you can. Structure, sleep, and slower evenings tend to feel supportive in this phase.",
    ringStroke: "#7d4d40",
    cardTint: "#f8eeea",
  };
}

export function buildDateRail(anchorDate: Date, days = 9): Date[] {
  const midpoint = Math.floor(days / 2);
  return Array.from({ length: days }, (_, index) =>
    addDays(anchorDate, index - midpoint),
  );
}

export function getTemperatureForCycleDay(
  cycleDay: number,
  cycleLength: number,
  flowDuration: number,
): number {
  const phase = getCyclePhase(cycleDay, cycleLength, flowDuration);

  let baseline = 97.35;

  switch (phase.key) {
    case "menstrual":
      baseline = 97.22 + cycleDay * 0.03;
      break;
    case "follicular":
      baseline = 97.35 + Math.max(0, cycleDay - flowDuration) * 0.035;
      break;
    case "ovulatory":
      baseline = 97.92 + (cycleDay % 3) * 0.06;
      break;
    case "luteal":
      baseline = 98.02 + Math.min(0.32, (cycleDay / cycleLength) * 0.5);
      break;
  }

  const wave =
    Math.sin(cycleDay * 0.82) * 0.06 + Math.cos(cycleDay * 0.47) * 0.04;

  return Number((baseline + wave).toFixed(2));
}

export function buildTemperatureSeries(
  anchorDate: Date,
  cycleStart: Date,
  cycleLength: number,
  flowDuration: number,
  days = 7,
) {
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(anchorDate, -(days - 1 - index));
    const cycleDay = getCurrentCycleDay(cycleStart, cycleLength, date);
    const phase = getCyclePhase(cycleDay, cycleLength, flowDuration);

    return {
      date,
      cycleDay,
      phase,
      temperature: getTemperatureForCycleDay(
        cycleDay,
        cycleLength,
        flowDuration,
      ),
    };
  });
}

export function getWeekdayLabel(date: Date): string {
  return WEEKDAY_SHORT[date.getDay()];
}

export function getMonthLabel(date: Date): string {
  return MONTH_NAMES[date.getMonth()];
}

export function getMonthShortLabel(date: Date): string {
  return getMonthLabel(date).slice(0, 3);
}

export function getMonthYearLabel(date: Date): string {
  return `${getMonthLabel(date)} ${date.getFullYear()}`;
}
