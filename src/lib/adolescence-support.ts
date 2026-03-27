import type { QuestionnaireAnswers } from "@/lib/onboarding-state";
import type {
  AdolescenceMood,
  AdolescenceRitualId,
  AdolescenceSupportState,
} from "@/lib/use-adolescence-support-state";

export type AdolescenceInsight = {
  id: string;
  title: string;
  meta: string;
  body: string;
  tint: string;
};

export type AdolescenceRitual = {
  id: AdolescenceRitualId;
  label: string;
  meta: string;
  body: string;
  actionLabel: string;
};

export type AdolescenceSupportModel = {
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  guideChip: string;
  guideBody: string;
  moodLabel: string;
  moodIcon: string;
  moodAccent: string;
  ritual: AdolescenceRitual;
  rituals: AdolescenceRitual[];
  insights: AdolescenceInsight[];
  trustedPhrase: string;
};

const rituals: AdolescenceRitual[] = [
  {
    id: "morning_meditation",
    label: "Morning Meditation",
    meta: "Focus ritual",
    body: "A short breathing reset to make the day feel less noisy before everything starts.",
    actionLabel: "Play ritual",
  },
  {
    id: "body_checkin",
    label: "Body Check-In",
    meta: "Body literacy",
    body: "A gentle two-minute scan that helps you notice cramps, energy, and mood without panic.",
    actionLabel: "Start check-in",
  },
  {
    id: "breathing_reset",
    label: "Calm Breath Reset",
    meta: "Stress support",
    body: "A slower exhale rhythm for moments when school, body changes, or feelings feel too loud.",
    actionLabel: "Begin reset",
  },
];

const moodMeta: Record<
  AdolescenceMood,
  { label: string; icon: string; accent: string; note: string }
> = {
  radiant: {
    label: "Radiant",
    icon: "sun",
    accent: "text-[#bc563a]",
    note: "A brighter mood can be a nice time to build confidence and learn something new about your rhythm.",
  },
  calm: {
    label: "Calm",
    icon: "leaf",
    accent: "text-secondary",
    note: "A calm day is a lovely time to check in gently and notice what feels steady in your body.",
  },
  pensive: {
    label: "Pensive",
    icon: "cloud",
    accent: "text-[#8b6f66]",
    note: "Feeling more thoughtful or inward is common. Slower guidance can help things feel safer.",
  },
  flowing: {
    label: "Flowing",
    icon: "drop",
    accent: "text-primary",
    note: "When things feel emotional or changeable, simpler explanations and softer routines usually help most.",
  },
  growing: {
    label: "Growing",
    icon: "sprout",
    accent: "text-[#6b7d59]",
    note: "Growth days are about patience. Your body is learning, not doing anything wrong.",
  },
};

export function buildAdolescenceSupportModel({
  answers,
  state,
}: {
  answers: QuestionnaireAnswers;
  state: AdolescenceSupportState;
}): AdolescenceSupportModel {
  const firstTime = answers.adolescence_first_time;
  const supportStyle = answers.adolescence_support_style;
  const beginnerTips = answers.adolescence_beginner_tips === true;
  const tone = answers.adolescence_tone;
  const mood = moodMeta[state.mood];
  const ritual =
    rituals.find((item) => item.id === state.ritualId) ?? rituals[0];

  return {
    heroEyebrow:
      firstTime === "yes"
        ? "First cycle support"
        : firstTime === "kind_of"
          ? "Early rhythm support"
          : "Personal support",
    heroTitle:
      supportStyle === "phase_explanations"
        ? "Learning your body can feel gentle."
        : supportStyle === "simple_logging"
          ? "Small check-ins are enough."
          : supportStyle === "reminder_help"
            ? "Support can stay soft and easy."
            : "You do not have to figure this out alone.",
    heroBody: getHeroBody({ supportStyle, tone, beginnerTips }),
    guideChip:
      tone === "simple"
        ? "Very simple"
        : tone === "detailed"
          ? "More detail"
          : "Encouraging",
    guideBody: mood.note,
    moodLabel: mood.label,
    moodIcon: mood.icon,
    moodAccent: mood.accent,
    ritual,
    rituals,
    insights: getInsights({ supportStyle, beginnerTips }),
    trustedPhrase:
      firstTime === "yes"
        ? "New things can feel awkward at first. That does not mean you are behind."
        : "Your body can be different from someone else's and still be completely okay.",
  };
}

function getHeroBody({
  supportStyle,
  tone,
  beginnerTips,
}: {
  supportStyle: QuestionnaireAnswers[string];
  tone: QuestionnaireAnswers[string];
  beginnerTips: boolean;
}) {
  const toneText =
    tone === "simple"
      ? "Everything here stays in plain words."
      : tone === "detailed"
        ? "You can get a little more context without things feeling too medical."
        : "The guidance stays kind and reassuring.";

  const styleText =
    supportStyle === "phase_explanations"
      ? "We will explain each phase in a way that feels more like a guide than a textbook."
      : supportStyle === "simple_logging"
        ? "We will keep your tracking lightweight so it never feels like homework."
        : supportStyle === "reminder_help"
          ? "We will surface the reminders that matter and keep the rest quiet."
          : "We will lead with emotional reassurance and simple body literacy.";

  return `${styleText} ${toneText}${beginnerTips ? " You will also see beginner tips when they can help." : ""}`;
}

function getInsights({
  supportStyle,
  beginnerTips,
}: {
  supportStyle: QuestionnaireAnswers[string];
  beginnerTips: boolean;
}) {
  const base: AdolescenceInsight[] = [
    {
      id: "brain-growth",
      title: "Your brain is still growing",
      meta: "Mind + emotions",
      body: "Big feelings do not mean you are dramatic. Your brain is building new emotional and planning pathways during adolescence.",
      tint: "bg-[#fff6ef]",
    },
    {
      id: "cycle-irregular",
      title: "Irregular can still be normal",
      meta: "Cycle clarity",
      body: "For the first few years, cycles can be less predictable while hormones learn a steadier rhythm.",
      tint: "bg-[#f7f4ef]",
    },
  ];

  if (supportStyle === "reminder_help") {
    base.push({
      id: "gentle-nudges",
      title: "Gentle reminders work best",
      meta: "Support style",
      body: "Simple prep reminders for pads, hydration, or rest can make the day feel easier without adding pressure.",
      tint: "bg-[#eef6e7]",
    });
  } else if (supportStyle === "simple_logging") {
    base.push({
      id: "tiny-logs",
      title: "Tiny logs still count",
      meta: "Tracking",
      body: "You do not need perfect notes. Mood, flow, and one symptom are enough to start seeing patterns.",
      tint: "bg-[#eef6e7]",
    });
  } else {
    base.push({
      id: "body-language",
      title: "Your body is learning its language",
      meta: "Body literacy",
      body: "Cramps, discharge, appetite, and mood shifts are all part of learning what your body is saying.",
      tint: "bg-[#eef6e7]",
    });
  }

  if (beginnerTips) {
    base.push({
      id: "first-kit",
      title: "A small comfort kit helps",
      meta: "Beginner tip",
      body: "A pouch with pads, underwear, wipes, and a note to yourself can make new moments feel less stressful.",
      tint: "bg-[#f5ded7]",
    });
  }

  return base;
}
