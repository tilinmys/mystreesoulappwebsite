export type OnboardingAnswer = string | number | boolean;

export type QuestionnaireAnswers = Record<string, OnboardingAnswer>;

export type OnboardingState = {
  name: string;
  lastCycleDate: string;
  focus: string;
  supportArea: string;
  questionnaireAnswers: QuestionnaireAnswers;
  cycleLength: number;
  flowDuration: number;
};

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  name: "",
  lastCycleDate: "",
  focus: "",
  supportArea: "",
  questionnaireAnswers: {},
  cycleLength: 28,
  flowDuration: 5,
};

export const ONBOARDING_STORAGE_KEY = "mystree-onboarding-state";

let cachedState: OnboardingState | null = null;
let lastRawValue: string | null = null;

export function readOnboardingState(): OnboardingState {
  if (typeof window === "undefined") {
    return DEFAULT_ONBOARDING_STATE;
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_ONBOARDING_STATE;
    }

    if (raw === lastRawValue && cachedState) {
      return cachedState;
    }

    const parsed = JSON.parse(raw) as Partial<OnboardingState>;

    const newState = {
      name: parsed.name ?? DEFAULT_ONBOARDING_STATE.name,
      lastCycleDate:
        parsed.lastCycleDate ?? DEFAULT_ONBOARDING_STATE.lastCycleDate,
      focus: parsed.focus ?? DEFAULT_ONBOARDING_STATE.focus,
      supportArea: parsed.supportArea ?? DEFAULT_ONBOARDING_STATE.supportArea,
      questionnaireAnswers: normalizeQuestionnaireAnswers(
        parsed.questionnaireAnswers,
      ),
      cycleLength:
        typeof parsed.cycleLength === "number"
          ? parsed.cycleLength
          : DEFAULT_ONBOARDING_STATE.cycleLength,
      flowDuration:
        typeof parsed.flowDuration === "number"
          ? parsed.flowDuration
          : DEFAULT_ONBOARDING_STATE.flowDuration,
    };
    
    lastRawValue = raw;
    cachedState = newState;
    return newState;
  } catch {
    return DEFAULT_ONBOARDING_STATE;
  }
}

export function writeOnboardingState(state: OnboardingState): void {
  if (typeof window === "undefined") {
    return;
  }

  // Bust the cache so the next readOnboardingState call sees the new value.
  cachedState = null;
  lastRawValue = null;

  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(ONBOARDING_STORAGE_KEY));
}

export function hasCompletedOnboarding(state: OnboardingState): boolean {
  return Boolean(state.name.trim() && state.supportArea.trim());
}

function normalizeQuestionnaireAnswers(value: unknown): QuestionnaireAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_ONBOARDING_STATE.questionnaireAnswers;
  }

  const normalized: QuestionnaireAnswers = {};

  for (const [key, item] of Object.entries(value)) {
    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ) {
      normalized[key] = item;
    }
  }

  return normalized;
}
