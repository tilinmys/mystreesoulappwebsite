"use client";

import {
  DEFAULT_ONBOARDING_STATE,
  writeOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding-state";
import { APP_SETTINGS_STORAGE_KEY } from "@/lib/use-app-settings-state";
import { ADOLESCENCE_SUPPORT_STORAGE_KEY } from "@/lib/use-adolescence-support-state";
import { DAILY_ENTRY_STORAGE_KEY } from "@/lib/use-daily-entry-state";
import { FERTILITY_LOG_STORAGE_KEY } from "@/lib/use-fertility-log-state";
import { MENOPAUSE_SUPPORT_STORAGE_KEY } from "@/lib/use-menopause-support-state";
import { PREGNANCY_SUPPORT_STORAGE_KEY } from "@/lib/use-pregnancy-support-state";

export type AuthSession = {
  id: string;
  name: string;
  email: string;
  kind: "new_user" | "returning_user";
  createdAt: string;
  tutorialSeen: boolean;
};

export const AUTH_SESSION_STORAGE_KEY = "mystree-auth-session";

const SESSION_EVENT_NAME = AUTH_SESSION_STORAGE_KEY;

const PROTOTYPE_RESET_KEYS = [
  DAILY_ENTRY_STORAGE_KEY,
  FERTILITY_LOG_STORAGE_KEY,
  PREGNANCY_SUPPORT_STORAGE_KEY,
  ADOLESCENCE_SUPPORT_STORAGE_KEY,
  MENOPAUSE_SUPPORT_STORAGE_KEY,
  APP_SETTINGS_STORAGE_KEY,
] as const;

let cachedSession: AuthSession | null = null;
let lastRawSession: string | null = null;

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    if (raw === lastRawSession && cachedSession) {
      return cachedSession;
    }

    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (
      !parsed.id ||
      !parsed.name ||
      !parsed.kind ||
      !parsed.createdAt ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    const session: AuthSession = {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      kind: parsed.kind === "new_user" ? "new_user" : "returning_user",
      createdAt: parsed.createdAt,
      tutorialSeen:
        typeof parsed.tutorialSeen === "boolean" ? parsed.tutorialSeen : false,
    };

    cachedSession = session;
    lastRawSession = raw;
    return session;
  } catch {
    return null;
  }
}

export function writeAuthSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  cachedSession = session;
  lastRawSession = JSON.stringify(session);
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, lastRawSession);
  window.dispatchEvent(new Event(SESSION_EVENT_NAME));
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  cachedSession = null;
  lastRawSession = null;
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT_NAME));
}

export function markAuthTutorialSeen() {
  const session = readAuthSession();
  if (!session || session.tutorialSeen) {
    return;
  }

  writeAuthSession({
    ...session,
    tutorialSeen: true,
  });
}

export function startPrototypeSignIn({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const session = createAuthSession({
    name: name || deriveNameFromEmail(email),
    email,
    kind: "returning_user",
  });
  writeAuthSession(session);
  return session;
}

export function startPrototypeSignup({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const session = createAuthSession({
    name: name || deriveNameFromEmail(email) || "New Soul",
    email,
    kind: "new_user",
  });
  writeAuthSession(session);
  return session;
}

export function seedPrototypeOnboardingForNewUser(name: string) {
  clearPrototypeSessionData();
  writeOnboardingState({
    ...DEFAULT_ONBOARDING_STATE,
    name,
  });
}

export function seedPrototypeOnboardingForReturningUser(name: string) {
  const today = new Date();
  const recentCycleStart = new Date(today);
  recentCycleStart.setDate(today.getDate() - 21);

  const demoState: OnboardingState = {
    ...DEFAULT_ONBOARDING_STATE,
    name,
    focus: "Feel more in sync with my body",
    supportArea: "cycle_tracker",
    lastCycleDate: formatDateForInput(recentCycleStart),
    cycleLength: 29,
    flowDuration: 5,
    questionnaireAnswers: {
      primaryGoal: "clarity",
      trackingStyle: "gentle",
    },
  };

  writeOnboardingState(demoState);
}

function clearPrototypeSessionData() {
  if (typeof window === "undefined") {
    return;
  }

  for (const key of PROTOTYPE_RESET_KEYS) {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new StorageEvent("storage", { key }));
  }
}

function createAuthSession({
  name,
  email,
  kind,
}: {
  name: string;
  email: string;
  kind: AuthSession["kind"];
}): AuthSession {
  const normalizedName = name.trim() || "MyStree Soul User";
  return {
    id: `prototype-${normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: normalizedName,
    email: email.trim().toLowerCase(),
    kind,
    createdAt: new Date().toISOString(),
    tutorialSeen: false,
  };
}

function deriveNameFromEmail(email: string) {
  const localPart = email.trim().split("@")[0] || "Merin";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function subscribeToAuthSession(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === AUTH_SESSION_STORAGE_KEY) {
      callback();
    }
  };

  const handleSameTabWrite = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SESSION_EVENT_NAME, handleSameTabWrite as EventListener);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      SESSION_EVENT_NAME,
      handleSameTabWrite as EventListener,
    );
  };
}
