import type { QuestionnaireAnswers } from "@/lib/onboarding-state";

export type SupportArea =
  | "cycle_tracker"
  | "fertility"
  | "pregnancy"
  | "menopause"
  | "adolescence";

export type QuestionOption = {
  value: string;
  label: string;
  description?: string;
};

export type QuestionnaireQuestion = {
  id: string;
  prompt: string;
  helper: string;
  guide: string;
  type: "choice" | "cards" | "slider" | "toggle";
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  unit?: string;
  minLabel?: string;
  maxLabel?: string;
};

export type QuestionnaireConfig = {
  pillarLabel: string;
  pillarSummary: string;
  completionTitle: string;
  completionDescription: string;
  questions: QuestionnaireQuestion[];
};

const supportAreas: SupportArea[] = [
  "cycle_tracker",
  "fertility",
  "pregnancy",
  "menopause",
  "adolescence",
];

export function normalizeSupportArea(value: string): SupportArea {
  if (supportAreas.includes(value as SupportArea)) {
    return value as SupportArea;
  }

  return "cycle_tracker";
}

export function getQuestionnaireConfig(
  supportAreaValue: string,
  answers: QuestionnaireAnswers,
): QuestionnaireConfig {
  const supportArea = normalizeSupportArea(supportAreaValue);

  switch (supportArea) {
    case "fertility":
      return getFertilityConfig(answers);
    case "pregnancy":
      return getPregnancyConfig();
    case "menopause":
      return getMenopauseConfig();
    case "adolescence":
      return getAdolescenceConfig();
    case "cycle_tracker":
    default:
      return getCycleConfig();
  }
}

export function getAnswerLabel(
  question: QuestionnaireQuestion,
  answer: string | number | boolean | undefined,
): string | null {
  if (answer === undefined) {
    return null;
  }

  if (question.type === "slider" && typeof answer === "number") {
    return `${answer}${question.unit ? ` ${question.unit}` : ""}`;
  }

  if (question.type === "toggle" && typeof answer === "boolean") {
    return answer ? "Yes" : "No";
  }

  if (typeof answer === "string") {
    const match = question.options?.find((option) => option.value === answer);
    return match?.label ?? answer;
  }

  return String(answer);
}

function getCycleConfig(): QuestionnaireConfig {
  return {
    pillarLabel: "Cycle Tracker",
    pillarSummary: "A calm rhythm map built around your cycle patterns.",
    completionTitle: "Your cycle guide is ready.",
    completionDescription:
      "We kept this short and relevant so MyStree Soul can guide your patterns without turning onboarding into a form.",
    questions: [
      {
        id: "cycle_regularity",
        prompt: "Do your cycles tend to be regular?",
        helper: "A simple estimate is enough for us to start gently.",
        guide: "This helps me understand you better.",
        type: "choice",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        id: "cycle_main_goal",
        prompt: "What kind of help feels most useful right now?",
        helper: "Choose the support you want to feel first.",
        guide: "I only want to ask what actually matters to you.",
        type: "cards",
        options: [
          {
            value: "predictions",
            label: "Prediction",
            description: "Know when your next period is likely coming.",
          },
          {
            value: "symptoms",
            label: "Patterns",
            description: "Understand symptoms, mood, and body changes.",
          },
          {
            value: "reminders",
            label: "Reminders",
            description: "Stay gently prepared without overthinking it.",
          },
          {
            value: "clarity",
            label: "Body literacy",
            description: "Learn what each phase might mean for you.",
          },
        ],
      },
      {
        id: "cycle_reminders",
        prompt: "Would gentle reminder nudges feel helpful?",
        helper: "You can fine-tune these later in settings.",
        guide: "I can stay quiet or supportive. You decide the pace.",
        type: "toggle",
      },
      {
        id: "cycle_pcos_support",
        prompt: "Do you want PCOS or PCOD-aware tracking?",
        helper: "Choose the option that best matches your current needs.",
        guide: "This helps us keep cycle guidance more realistic for irregular patterns.",
        type: "choice",
        options: [
          { value: "no", label: "No" },
          { value: "suspected", label: "Exploring symptoms" },
          { value: "diagnosed", label: "Diagnosed PCOS or PCOD" },
        ],
      },
      {
        id: "cycle_checkin_style",
        prompt: "How often should I check in with you?",
        helper: "We keep it light and easy to ignore when you need space.",
        guide: "This shapes the tone of your daily experience.",
        type: "choice",
        options: [
          { value: "phase_based", label: "Around key phases" },
          { value: "weekly", label: "Weekly" },
          { value: "as_needed", label: "Only when I open the app" },
        ],
      },
    ],
  };
}

function getFertilityConfig(
  answers: QuestionnaireAnswers,
): QuestionnaireConfig {
  const tryingIntent = answers.fertility_intent;
  const isExploring =
    tryingIntent === "actively" || tryingIntent === "considering";

  return {
    pillarLabel: "Fertility Companion",
    pillarSummary: "A quieter, more informed fertility path tailored to you.",
    completionTitle: "Your fertility path is taking shape.",
    completionDescription:
      "We focused on the questions that guide timing, privacy, and support without adding pressure.",
    questions: [
      {
        id: "fertility_intent",
        prompt: "Are you currently trying to conceive?",
        helper: "Your answer helps us choose the right type of guidance.",
        guide: "I will adjust the next questions to match your situation.",
        type: "cards",
        options: [
          {
            value: "actively",
            label: "Yes, actively",
            description: "I want practical timing support now.",
          },
          {
            value: "considering",
            label: "Just considering",
            description: "I am exploring and learning for the moment.",
          },
          {
            value: "not_now",
            label: "Not at the moment",
            description: "I mainly want body awareness and clarity.",
          },
        ],
      },
      isExploring
        ? {
            id: "fertility_timeline",
            prompt: "How long have you been on this path?",
            helper: "A broad estimate is enough here.",
            guide: "This keeps the guidance realistic and non-intrusive.",
            type: "choice",
            options: [
              { value: "just_starting", label: "Just starting" },
              { value: "under_6_months", label: "Under 6 months" },
              { value: "over_6_months", label: "6+ months" },
            ],
          }
        : {
            id: "fertility_context",
            prompt: "What feels most relevant for you right now?",
            helper: "Pick the path you want the app to respect.",
            guide: "I will keep the experience aligned with your current intent.",
            type: "cards",
            options: [
              {
                value: "avoid_pregnancy",
                label: "Avoid pregnancy",
                description: "Stay informed without TTC guidance.",
              },
              {
                value: "understand_window",
                label: "Learn fertile window",
                description: "Understand patterns before deciding anything.",
              },
              {
                value: "body_awareness",
                label: "Body awareness",
                description: "Just understand your rhythm better.",
              },
              {
                value: "future_planning",
                label: "Future planning",
                description: "Prepare gently for later.",
              },
            ],
          },
      {
        id: "fertility_guidance",
        prompt: isExploring
          ? "Would fertile window guidance feel helpful?"
          : "Would ovulation education feel useful to you?",
        helper: "You can keep this as private and as light as you want.",
        guide: "I can stay informative without becoming overwhelming.",
        type: "toggle",
      },
      {
        id: "fertility_checkin_style",
        prompt: "What kind of cadence feels supportive?",
        helper: "We will match the amount of guidance to your energy.",
        guide: "Support should feel calm, never demanding.",
        type: "choice",
        options: [
          { value: "daily", label: "Daily nudges" },
          { value: "key_days", label: "Only key fertile days" },
          { value: "quiet", label: "Quiet unless needed" },
        ],
      },
    ],
  };
}

function getPregnancyConfig(): QuestionnaireConfig {
  return {
    pillarLabel: "Pregnancy Support",
    pillarSummary: "Week-aware guidance that stays soft, private, and clear.",
    completionTitle: "Your pregnancy support is tuned in.",
    completionDescription:
      "We now have enough to personalize stage-based updates and calm guidance without overwhelming you.",
    questions: [
      {
        id: "pregnancy_weeks",
        prompt: "How many weeks pregnant are you?",
        helper: "Swipe or tap the slider to your current stage.",
        guide: "Stage-specific support only works if I understand your timeline.",
        type: "slider",
        min: 4,
        max: 42,
        step: 1,
        defaultValue: 10,
        unit: "weeks",
        minLabel: "4 weeks",
        maxLabel: "42 weeks",
      },
      {
        id: "pregnancy_focus",
        prompt: "What kind of support feels most helpful right now?",
        helper: "Choose the kind of guidance you want most often.",
        guide: "I will lead with the support that feels most grounding.",
        type: "cards",
        options: [
          {
            value: "growth",
            label: "Weekly growth",
            description: "Understand what changes week by week.",
          },
          {
            value: "body_changes",
            label: "Body changes",
            description: "Track symptoms and physical shifts gently.",
          },
          {
            value: "symptom_log",
            label: "Symptom log",
            description: "Keep notes on patterns without extra clutter.",
          },
          {
            value: "calm_checkins",
            label: "Calm check-ins",
            description: "Receive reassuring guidance and soft nudges.",
          },
        ],
      },
      {
        id: "pregnancy_feeling",
        prompt: "How are you feeling on most days?",
        helper: "This helps us set the tone of your insights.",
        guide: "Your support should match your capacity, not compete with it.",
        type: "choice",
        options: [
          { value: "low_energy", label: "Low energy" },
          { value: "nauseous", label: "Nauseous" },
          { value: "steady", label: "Mostly steady" },
          { value: "overwhelmed", label: "A bit overwhelmed" },
        ],
      },
      {
        id: "pregnancy_milestones",
        prompt: "Would milestone reminders feel helpful?",
        helper: "These can stay gentle and low-frequency.",
        guide: "I can keep important moments visible without crowding your day.",
        type: "toggle",
      },
    ],
  };
}

function getMenopauseConfig(): QuestionnaireConfig {
  return {
    pillarLabel: "Menopause Wisdom",
    pillarSummary: "Pattern-aware support for shifts in energy, sleep, and body.",
    completionTitle: "Your menopause support is ready to soften in.",
    completionDescription:
      "We focused on the changes that matter most so the app can support you with less noise and more relevance.",
    questions: [
      {
        id: "menopause_hot_flashes",
        prompt: "Are you experiencing hot flashes?",
        helper: "A simple estimate helps us frame your symptom support.",
        guide: "I will keep this respectful and free from clinical overload.",
        type: "choice",
        options: [
          { value: "yes", label: "Yes" },
          { value: "sometimes", label: "Sometimes" },
          { value: "not_right_now", label: "Not right now" },
        ],
      },
      {
        id: "menopause_shift_focus",
        prompt: "Which shifts feel most present lately?",
        helper: "Pick the area you want us to notice first.",
        guide: "This lets me focus on the changes affecting your daily life.",
        type: "cards",
        options: [
          {
            value: "sleep",
            label: "Sleep changes",
            description: "Rest feels different than it used to.",
          },
          {
            value: "mood",
            label: "Mood waves",
            description: "Emotional shifts feel more noticeable.",
          },
          {
            value: "cycle_changes",
            label: "Cycle changes",
            description: "Bleeding or timing feels less predictable.",
          },
          {
            value: "energy",
            label: "Energy dips",
            description: "Your energy is less steady through the day.",
          },
        ],
      },
      {
        id: "menopause_tracking",
        prompt: "Would symptom pattern tracking feel helpful?",
        helper: "This stays private and easy to skip when needed.",
        guide: "Tracking can be quiet and useful instead of burdensome.",
        type: "toggle",
      },
      {
        id: "menopause_checkin_style",
        prompt: "How often should support show up?",
        helper: "We can keep this as gentle as you need.",
        guide: "Your pace matters more than the app's pace.",
        type: "choice",
        options: [
          { value: "weekly", label: "Gentle weekly" },
          { value: "as_needed", label: "Only as needed" },
          { value: "daily", label: "Daily support" },
        ],
      },
    ],
  };
}

function getAdolescenceConfig(): QuestionnaireConfig {
  return {
    pillarLabel: "Adolescence Emergence",
    pillarSummary: "Beginner-friendly guidance for a first or early cycle journey.",
    completionTitle: "Your beginner-friendly path is ready.",
    completionDescription:
      "We kept the questions short and supportive so the app can teach gently without feeling like school.",
    questions: [
      {
        id: "adolescence_first_time",
        prompt: "Is this your first time tracking your cycle?",
        helper: "There is no right answer here. We just want the tone to fit.",
        guide: "I will keep the experience softer if this is all still new.",
        type: "choice",
        options: [
          { value: "yes", label: "Yes" },
          { value: "kind_of", label: "Kind of" },
          { value: "not_really", label: "Not really" },
        ],
      },
      {
        id: "adolescence_support_style",
        prompt: "What would make this feel easiest?",
        helper: "Pick the kind of help that would make you feel safest.",
        guide: "I want this to feel simple, not overwhelming.",
        type: "cards",
        options: [
          {
            value: "phase_explanations",
            label: "Explain each phase",
            description: "Teach me what is happening in simple words.",
          },
          {
            value: "simple_logging",
            label: "Simple logging",
            description: "Keep tracking easy and low-pressure.",
          },
          {
            value: "reminder_help",
            label: "Reminder help",
            description: "Nudge me gently when something matters.",
          },
          {
            value: "emotional_support",
            label: "Emotional support",
            description: "Help me feel less alone while learning.",
          },
        ],
      },
      {
        id: "adolescence_beginner_tips",
        prompt: "Would beginner-friendly tips feel helpful?",
        helper: "You can turn these off later if you want more space.",
        guide: "I can explain gently without turning this into homework.",
        type: "toggle",
      },
      {
        id: "adolescence_tone",
        prompt: "How would you like guidance to sound?",
        helper: "This shapes the voice of your check-ins and insights.",
        guide: "The way support sounds matters just as much as the content.",
        type: "choice",
        options: [
          { value: "simple", label: "Very simple" },
          { value: "encouraging", label: "Encouraging" },
          { value: "detailed", label: "A bit more detailed" },
        ],
      },
    ],
  };
}
