"use client";

import { useSyncExternalStore } from "react";

export type PregnancyEnergy = "steady" | "tired" | "restless" | "glowing";
export type PregnancyConsultMode = "virtual" | "clinic" | "midwife";

export type PregnancySupportState = {
  waterCups: number;
  kickCount: number;
  currentWeight: number;
  baselineWeight: number;
  energy: PregnancyEnergy;
  consultMode: PregnancyConsultMode;
  consultBooked: boolean;
  carePlanViewedAt: string | null;
  lastUpdatedAt: string;
};

export const PREGNANCY_SUPPORT_STORAGE_KEY = "mystree-pregnancy-support";

export const DEFAULT_PREGNANCY_SUPPORT_STATE: PregnancySupportState = {
  waterCups: 0,
  kickCount: 0,
  currentWeight: 0,
  baselineWeight: 0,
  energy: "steady",
  consultMode: "virtual",
  consultBooked: false,
  carePlanViewedAt: null,
  lastUpdatedAt: new Date().toISOString(),
};

export function usePregnancySupportState() {
  const pregnancyState = useSyncExternalStore(
    subscribeToPregnancySupportState,
    readPregnancySupportState,
    () => DEFAULT_PREGNANCY_SUPPORT_STATE,
  );

  function updatePregnancyState(patch: Partial<PregnancySupportState>) {
    writePregnancySupportState({
      ...readPregnancySupportState(),
      ...patch,
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  return {
    pregnancyState,
    updatePregnancyState,
  };
}

let cachedPregnancyState: PregnancySupportState | null = null;
let lastPregnancyRaw: string | null = null;

function readPregnancySupportState(): PregnancySupportState {
  if (typeof window === "undefined") {
    return DEFAULT_PREGNANCY_SUPPORT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(PREGNANCY_SUPPORT_STORAGE_KEY);
    if (!raw) {
      cachedPregnancyState = DEFAULT_PREGNANCY_SUPPORT_STATE;
      lastPregnancyRaw = null;
      return DEFAULT_PREGNANCY_SUPPORT_STATE;
    }

    if (raw === lastPregnancyRaw && cachedPregnancyState) {
      return cachedPregnancyState;
    }

    const parsed = JSON.parse(raw) as Partial<PregnancySupportState>;
    const newState: PregnancySupportState = {
      waterCups:
        typeof parsed.waterCups === "number"
          ? clamp(parsed.waterCups, 0, 16)
          : DEFAULT_PREGNANCY_SUPPORT_STATE.waterCups,
      kickCount:
        typeof parsed.kickCount === "number"
          ? clamp(parsed.kickCount, 0, 50)
          : DEFAULT_PREGNANCY_SUPPORT_STATE.kickCount,
      currentWeight:
        typeof parsed.currentWeight === "number"
          ? clamp(parsed.currentWeight, 0, 120)
          : DEFAULT_PREGNANCY_SUPPORT_STATE.currentWeight,
      baselineWeight:
        typeof parsed.baselineWeight === "number"
          ? clamp(parsed.baselineWeight, 0, 120)
          : DEFAULT_PREGNANCY_SUPPORT_STATE.baselineWeight,
      energy: isPregnancyEnergy(parsed.energy)
        ? parsed.energy
        : DEFAULT_PREGNANCY_SUPPORT_STATE.energy,
      consultMode: isPregnancyConsultMode(parsed.consultMode)
        ? parsed.consultMode
        : DEFAULT_PREGNANCY_SUPPORT_STATE.consultMode,
      consultBooked:
        typeof parsed.consultBooked === "boolean"
          ? parsed.consultBooked
          : DEFAULT_PREGNANCY_SUPPORT_STATE.consultBooked,
      carePlanViewedAt:
        typeof parsed.carePlanViewedAt === "string" || parsed.carePlanViewedAt === null
          ? parsed.carePlanViewedAt
          : DEFAULT_PREGNANCY_SUPPORT_STATE.carePlanViewedAt,
      lastUpdatedAt:
        typeof parsed.lastUpdatedAt === "string"
          ? parsed.lastUpdatedAt
          : DEFAULT_PREGNANCY_SUPPORT_STATE.lastUpdatedAt,
    };

    lastPregnancyRaw = raw;
    cachedPregnancyState = newState;
    return newState;
  } catch {
    return DEFAULT_PREGNANCY_SUPPORT_STATE;
  }
}

function writePregnancySupportState(state: PregnancySupportState) {
  if (typeof window === "undefined") {
    return;
  }

  cachedPregnancyState = null;
  lastPregnancyRaw = null;

  window.localStorage.setItem(PREGNANCY_SUPPORT_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(PREGNANCY_SUPPORT_STORAGE_KEY));
}

function subscribeToPregnancySupportState(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === PREGNANCY_SUPPORT_STORAGE_KEY) {
      callback();
    }
  };

  const handleSameTabWrite = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    PREGNANCY_SUPPORT_STORAGE_KEY,
    handleSameTabWrite as EventListener,
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      PREGNANCY_SUPPORT_STORAGE_KEY,
      handleSameTabWrite as EventListener,
    );
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isPregnancyEnergy(value: unknown): value is PregnancyEnergy {
  return (
    value === "steady" ||
    value === "tired" ||
    value === "restless" ||
    value === "glowing"
  );
}

function isPregnancyConsultMode(value: unknown): value is PregnancyConsultMode {
  return value === "virtual" || value === "clinic" || value === "midwife";
}
