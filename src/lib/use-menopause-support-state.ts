"use client";

import { useSyncExternalStore } from "react";

export type MenopauseSymptom =
  | "hot_flash"
  | "night_sweat"
  | "brain_fog"
  | "anxiety"
  | "insomnia";

export type MenopauseIntensity = "mild" | "moderate" | "intense";

export type MenopauseSupportLog = {
  id: string;
  symptom: MenopauseSymptom;
  intensity: MenopauseIntensity;
  savedAt: string;
  note?: string;
};

export type MenopauseSupportState = {
  hrtOn: boolean;
  logs: MenopauseSupportLog[];
  lastUpdatedAt: string;
};

export const MENOPAUSE_SUPPORT_STORAGE_KEY = "mystree-menopause-support";

export const DEFAULT_MENOPAUSE_SUPPORT_STATE: MenopauseSupportState = {
  hrtOn: false,
  logs: [],
  lastUpdatedAt: new Date().toISOString(),
};

export function useMenopauseSupportState() {
  const menopauseState = useSyncExternalStore(
    subscribeToMenopauseSupportState,
    readMenopauseSupportState,
    () => DEFAULT_MENOPAUSE_SUPPORT_STATE,
  );

  function updateMenopauseState(patch: Partial<MenopauseSupportState>) {
    writeMenopauseSupportState({
      ...readMenopauseSupportState(),
      ...patch,
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  function addMenopauseLog(log: Omit<MenopauseSupportLog, "id" | "savedAt">) {
    const currentState = readMenopauseSupportState();
    const nextLog: MenopauseSupportLog = {
      ...log,
      id: createLogId(),
      savedAt: new Date().toISOString(),
    };

    writeMenopauseSupportState({
      ...currentState,
      logs: [nextLog, ...currentState.logs].slice(0, 120),
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  return {
    menopauseState,
    updateMenopauseState,
    addMenopauseLog,
  };
}

let cachedState: MenopauseSupportState | null = null;
let lastRawValue: string | null = null;

function readMenopauseSupportState(): MenopauseSupportState {
  if (typeof window === "undefined") {
    return DEFAULT_MENOPAUSE_SUPPORT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(MENOPAUSE_SUPPORT_STORAGE_KEY);
    if (!raw) {
      cachedState = DEFAULT_MENOPAUSE_SUPPORT_STATE;
      lastRawValue = null;
      return DEFAULT_MENOPAUSE_SUPPORT_STATE;
    }

    if (raw === lastRawValue && cachedState) {
      return cachedState;
    }

    const parsed = JSON.parse(raw) as Partial<MenopauseSupportState>;
    const nextState: MenopauseSupportState = {
      hrtOn:
        typeof parsed.hrtOn === "boolean"
          ? parsed.hrtOn
          : DEFAULT_MENOPAUSE_SUPPORT_STATE.hrtOn,
      logs: normalizeLogs(parsed.logs),
      lastUpdatedAt:
        typeof parsed.lastUpdatedAt === "string"
          ? parsed.lastUpdatedAt
          : DEFAULT_MENOPAUSE_SUPPORT_STATE.lastUpdatedAt,
    };

    cachedState = nextState;
    lastRawValue = raw;
    return nextState;
  } catch {
    return DEFAULT_MENOPAUSE_SUPPORT_STATE;
  }
}

function writeMenopauseSupportState(state: MenopauseSupportState) {
  if (typeof window === "undefined") {
    return;
  }

  cachedState = null;
  lastRawValue = null;
  window.localStorage.setItem(MENOPAUSE_SUPPORT_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(MENOPAUSE_SUPPORT_STORAGE_KEY));
}

function subscribeToMenopauseSupportState(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === MENOPAUSE_SUPPORT_STORAGE_KEY) {
      callback();
    }
  };

  const handleSameTabWrite = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    MENOPAUSE_SUPPORT_STORAGE_KEY,
    handleSameTabWrite as EventListener,
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      MENOPAUSE_SUPPORT_STORAGE_KEY,
      handleSameTabWrite as EventListener,
    );
  };
}

function normalizeLogs(value: unknown): MenopauseSupportLog[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedLogs = value
    .map((item): MenopauseSupportLog | null => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const parsed = item as Partial<MenopauseSupportLog>;
      if (
        typeof parsed.id !== "string" ||
        typeof parsed.savedAt !== "string" ||
        !isMenopauseSymptom(parsed.symptom) ||
        !isMenopauseIntensity(parsed.intensity)
      ) {
        return null;
      }

      return {
        id: parsed.id,
        savedAt: parsed.savedAt,
        symptom: parsed.symptom,
        intensity: parsed.intensity,
        note: typeof parsed.note === "string" ? parsed.note : undefined,
      };
    })
    .filter((item): item is MenopauseSupportLog => item !== null);

  return normalizedLogs.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

function isMenopauseSymptom(value: unknown): value is MenopauseSymptom {
  return (
    value === "hot_flash" ||
    value === "night_sweat" ||
    value === "brain_fog" ||
    value === "anxiety" ||
    value === "insomnia"
  );
}

function isMenopauseIntensity(value: unknown): value is MenopauseIntensity {
  return value === "mild" || value === "moderate" || value === "intense";
}

function createLogId() {
  return `meno-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
