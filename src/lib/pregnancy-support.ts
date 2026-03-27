import type { QuestionnaireAnswers } from "@/lib/onboarding-state";
import type {
  PregnancyEnergy,
  PregnancySupportState,
} from "@/lib/use-pregnancy-support-state";

type PregnancyMilestone = {
  min: number;
  max: number;
  sizeLabel: string;
  growthSummary: string;
  weightSummary: string;
  detail: string;
};

type PregnancyResource = {
  id: string;
  title: string;
  meta: string;
  description: string;
  tint: string;
};

export type PregnancySupportModel = {
  week: number;
  trimesterLabel: string;
  trimesterIndex: 1 | 2 | 3;
  trimesterProgressPercent: number;
  journeyProgressPercent: number;
  dueDateLabel: string;
  daysRemaining: number;
  sizeLabel: string;
  growthSummary: string;
  weightSummary: string;
  detail: string;
  focusChip: string;
  focusTitle: string;
  heroMessage: string;
  bloopMessage: string;
  weightPoints: Array<{ label: string; value: number }>;
  hasWeightLog: boolean;
  currentWeight: number;
  totalGain: number;
  hydrationGoal: number;
  resources: PregnancyResource[];
};

const milestones: PregnancyMilestone[] = [
  {
    min: 4,
    max: 7,
    sizeLabel: "blueberry",
    growthSummary: "Neural tube and heart development are taking shape.",
    weightSummary: "Tiny changes matter more than big numbers right now.",
    detail: "Rest, hydration, and steadier meals usually matter most in these earliest weeks.",
  },
  {
    min: 8,
    max: 11,
    sizeLabel: "lime",
    growthSummary: "Your baby is growing quickly and beginning to move.",
    weightSummary: "Weight can feel unpredictable while energy is still settling.",
    detail: "Nausea and fatigue can still be strong, so the gentlest support often works best.",
  },
  {
    min: 12,
    max: 15,
    sizeLabel: "pear",
    growthSummary: "Facial features are becoming more defined and movement is increasing.",
    weightSummary: "You are entering a steadier growth rhythm.",
    detail: "Many people begin to feel a little more like themselves in this stretch.",
  },
  {
    min: 16,
    max: 19,
    sizeLabel: "avocado",
    growthSummary: "Those tiny ears are now in place and your baby is practicing hearing.",
    weightSummary: "Your healthy range usually begins to look more consistent here.",
    detail: "Little flutters, stretching, and a softer return of energy can start to appear now.",
  },
  {
    min: 20,
    max: 23,
    sizeLabel: "banana",
    growthSummary: "Your baby is growing longer and movements may become easier to notice.",
    weightSummary: "Growth is steadier and check-ins become more useful.",
    detail: "This can be a good window for posture support, hydration, and magnesium-rich meals.",
  },
  {
    min: 24,
    max: 28,
    sizeLabel: "eggplant",
    growthSummary: "Lungs and sleep cycles are becoming more structured.",
    weightSummary: "Your care team often watches steady gain more closely now.",
    detail: "Back support, water balance, and calmer evenings can make a visible difference.",
  },
  {
    min: 29,
    max: 34,
    sizeLabel: "butternut squash",
    growthSummary: "Your baby is adding more fat stores and practicing breathing rhythms.",
    weightSummary: "Tracking comfort and pressure changes often matters as much as weight.",
    detail: "Swelling, sleep shifts, and movement comfort are useful things to watch.",
  },
  {
    min: 35,
    max: 42,
    sizeLabel: "honeydew",
    growthSummary: "Your baby is maturing and preparing for birth.",
    weightSummary: "The focus usually shifts toward readiness and comfort.",
    detail: "Hydration, rest, and clear care plans help the final stretch feel steadier.",
  },
];

export function buildPregnancySupportModel({
  anchorDate,
  questionnaireAnswers,
  pregnancyState,
}: {
  anchorDate: Date;
  questionnaireAnswers: QuestionnaireAnswers;
  pregnancyState: PregnancySupportState;
}): PregnancySupportModel {
  const week = getPregnancyWeekAnswer(questionnaireAnswers);
  const trimesterIndex = getTrimesterIndex(week);
  const trimesterLabel = getTrimesterLabel(week);
  const trimesterStartWeek = trimesterIndex === 1 ? 1 : trimesterIndex === 2 ? 14 : 28;
  const trimesterLength = trimesterIndex === 1 ? 13 : trimesterIndex === 2 ? 14 : 13;
  const trimesterProgressPercent =
    ((week - trimesterStartWeek + 1) / trimesterLength) * 100;
  const journeyProgressPercent = (week / 40) * 100;
  const daysRemaining = Math.max(0, (40 - week) * 7);
  const dueDate = addDays(anchorDate, daysRemaining);
  const focus = getFocusLabel(questionnaireAnswers.pregnancy_focus);
  const feeling = getFeelingLabel(questionnaireAnswers.pregnancy_feeling);
  const milestone = getMilestone(week);
  const hasWeightLog =
    pregnancyState.currentWeight > 0 && pregnancyState.baselineWeight > 0;
  const totalGain = hasWeightLog
    ? roundToOneDecimal(pregnancyState.currentWeight - pregnancyState.baselineWeight)
    : 0;

  return {
    week,
    trimesterLabel,
    trimesterIndex,
    trimesterProgressPercent,
    journeyProgressPercent,
    dueDateLabel: formatMonthDayYear(dueDate),
    daysRemaining,
    sizeLabel: milestone.sizeLabel,
    growthSummary: milestone.growthSummary,
    weightSummary: milestone.weightSummary,
    detail: milestone.detail,
    focusChip: focus,
    focusTitle: getFocusTitle(questionnaireAnswers.pregnancy_focus),
    heroMessage: getHeroMessage(week, feeling),
    bloopMessage: getBloopMessage(week, pregnancyState.energy, milestone.detail),
    weightPoints: hasWeightLog ? buildWeightPoints(week, totalGain) : [],
    hasWeightLog,
    currentWeight: pregnancyState.currentWeight,
    totalGain,
    hydrationGoal: week >= 20 ? 8 : 7,
    resources: getResources(questionnaireAnswers.pregnancy_focus),
  };
}

export function getPregnancyWeekAnswer(answers: QuestionnaireAnswers) {
  const rawValue = answers.pregnancy_weeks;
  if (typeof rawValue === "number") {
    return clamp(Math.round(rawValue), 4, 42);
  }

  return 18;
}

export function getTrimesterLabel(week: number) {
  if (week < 14) {
    return "1st Trimester";
  }

  if (week < 28) {
    return "2nd Trimester";
  }

  return "3rd Trimester";
}

function getTrimesterIndex(week: number): 1 | 2 | 3 {
  if (week < 14) {
    return 1;
  }

  if (week < 28) {
    return 2;
  }

  return 3;
}

function getMilestone(week: number) {
  return milestones.find((item) => week >= item.min && week <= item.max) ?? milestones[3];
}

function getHeroMessage(week: number, feeling: string) {
  if (week < 14) {
    return `You are in a foundational stage right now. Keep the pace softer and let support wrap around ${feeling}.`;
  }

  if (week < 28) {
    return `This stretch often feels steadier. Build around movement, hydration, and calmer routines that support ${feeling}.`;
  }

  return `You are moving toward the final trimester arc. Comfort, rest, and clearer planning become even more supportive here.`;
}

function getBloopMessage(
  week: number,
  energy: PregnancyEnergy,
  milestoneDetail: string,
) {
  const energyCopy =
    energy === "glowing"
      ? "Your body seems to be handling this week with a little more ease."
      : energy === "steady"
        ? "Your rhythm looks steady enough for gentle routine building."
        : energy === "restless"
          ? "Restlessness often means slower evenings can help more than pushing through."
          : "If energy feels low, lighter expectations can still be a very healthy choice.";

  return `Week ${week} looks on track. ${energyCopy} ${milestoneDetail}`;
}

function buildWeightPoints(week: number, totalGain: number) {
  const labels = [
    Math.max(week - 8, 8),
    Math.max(week - 6, 10),
    Math.max(week - 4, 12),
    Math.max(week - 2, 14),
    week,
  ];

  const startGain = Math.max(0.4, totalGain - 2.7);
  const values = [
    Math.max(0.2, startGain - 1.2),
    Math.max(0.4, startGain - 0.6),
    Math.max(0.8, startGain + 0.3),
    Math.max(1.2, totalGain - 0.8),
    Math.max(1.6, totalGain),
  ];

  return labels.map((label, index) => ({
    label: `Wk ${label}`,
    value: roundToOneDecimal(values[index]),
  }));
}

function getFocusTitle(focus: unknown) {
  switch (focus) {
    case "growth":
      return "Weekly growth and body cues";
    case "body_changes":
      return "Body changes and comfort";
    case "symptom_log":
      return "Daily symptom clarity";
    case "calm_checkins":
      return "Gentle reassurance";
    default:
      return "Calm stage-based support";
  }
}

function getFocusLabel(focus: unknown) {
  switch (focus) {
    case "growth":
      return "Growth focus";
    case "body_changes":
      return "Comfort focus";
    case "symptom_log":
      return "Tracking focus";
    case "calm_checkins":
      return "Calm focus";
    default:
      return "Care focus";
  }
}

function getFeelingLabel(feeling: unknown) {
  switch (feeling) {
    case "low_energy":
      return "low energy days";
    case "nauseous":
      return "nauseous stretches";
    case "steady":
      return "steadier days";
    case "overwhelmed":
      return "overwhelmed moments";
    default:
      return "your current pace";
  }
}

function getResources(focus: unknown): PregnancyResource[] {
  switch (focus) {
    case "growth":
      return [
        {
          id: "growth-notes",
          title: "Growth Milestones",
          meta: "5 min read",
          description: "A calm week-by-week explainer of body changes, movement, and growth cues.",
          tint: "bg-[#f5ded7]",
        },
        {
          id: "voice-bonding",
          title: "Bonding Through Voice",
          meta: "Audio guide",
          description: "Soft prompts for talking, breathing, and connecting in quieter moments.",
          tint: "bg-[#f6f3ee]",
        },
        {
          id: "movement-window",
          title: "Movement Window",
          meta: "6 min stretch",
          description: "Gentle mobility suggestions for this stage of your pregnancy arc.",
          tint: "bg-[#d5e9bf]",
        },
      ];
    case "body_changes":
      return [
        {
          id: "back-relief",
          title: "Back Relief Routine",
          meta: "4 min video",
          description: "A calmer posture reset for mid-back pressure, hips, and evening fatigue.",
          tint: "bg-[#f5ded7]",
        },
        {
          id: "sleep-positioning",
          title: "Sleep Positioning",
          meta: "Care tip",
          description: "Simple pillow placement guidance to help nights feel more supported.",
          tint: "bg-[#f6f3ee]",
        },
        {
          id: "swelling-basics",
          title: "Swelling Basics",
          meta: "3 min read",
          description: "What is common, what can soothe, and which cues deserve more attention.",
          tint: "bg-[#d5e9bf]",
        },
      ];
    case "symptom_log":
      return [
        {
          id: "note-patterns",
          title: "Symptom Patterns",
          meta: "Tracking guide",
          description: "How to notice trends without turning every day into a checklist.",
          tint: "bg-[#f5ded7]",
        },
        {
          id: "hydration-balance",
          title: "Hydration Balance",
          meta: "Care tip",
          description: "A softer way to stay ahead of headaches, fatigue, and blood-volume shifts.",
          tint: "bg-[#f6f3ee]",
        },
        {
          id: "appointment-prep",
          title: "Appointment Prep",
          meta: "Checklist",
          description: "Bring your most useful notes and questions into your next prenatal visit.",
          tint: "bg-[#d5e9bf]",
        },
      ];
    case "calm_checkins":
    default:
      return [
        {
          id: "breath-reset",
          title: "Two-Minute Reset",
          meta: "Breathing audio",
          description: "A short grounding practice for days that feel mentally loud or stretched.",
          tint: "bg-[#f5ded7]",
        },
        {
          id: "nutrition-support",
          title: "Hormone-Friendly Meals",
          meta: "Meal ideas",
          description: "Simple food pairings that support steadier energy and iron intake.",
          tint: "bg-[#f6f3ee]",
        },
        {
          id: "care-plan",
          title: "Third Trimester Preview",
          meta: "Care plan",
          description: "See what to expect next so the coming weeks feel less unknown.",
          tint: "bg-[#d5e9bf]",
        },
      ];
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatMonthDayYear(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}
