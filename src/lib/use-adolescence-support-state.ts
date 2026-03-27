"use client";

import { useSyncExternalStore } from "react";

export type AdolescenceMood =
  | "radiant"
  | "calm"
  | "pensive"
  | "flowing"
  | "growing";

export type AdolescenceRitualId =
  | "morning_meditation"
  | "body_checkin"
  | "breathing_reset";

export type AdolescenceSupportState = {
  mood: AdolescenceMood;
  ritualId: AdolescenceRitualId;
  ritualProgress: number;
  ritualPlaying: boolean;
  insightsViewed: number;
  lastChatTopic: string | null;
  lastUpdatedAt: string;
};

export const ADOLESCENCE_SUPPORT_STORAGE_KEY = "mystree-adolescence-support";

export const DEFAULT_ADOLESCENCE_SUPPORT_STATE: AdolescenceSupportState = {
  mood: "calm",
  ritualId: "morning_meditation",
  ritualProgress: 65,
  ritualPlaying: false,
  insightsViewed: 1,
  lastChatTopic: null,
  lastUpdatedAt: new Date().toISOString(),
};

export function useAdolescenceSupportState() {
  const adolescenceState = useSyncExternalStore(
    subscribeToAdolescenceSupportState,
    readAdolescenceSupportState,
    () => DEFAULT_ADOLESCENCE_SUPPORT_STATE,
  );

  function updateAdolescenceState(patch: Partial<AdolescenceSupportState>) {
    writeAdolescenceSupportState({
      ...readAdolescenceSupportState(),
      ...patch,
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  return {
    adolescenceState,
    updateAdolescenceState,
  };
}

let cachedState: AdolescenceSupportState | null = null;
let lastRawValue: string | null = null;

function readAdolescenceSupportState(): AdolescenceSupportState {
  if (typeof window === "undefined") {
    return DEFAULT_ADOLESCENCE_SUPPORT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(ADOLESCENCE_SUPPORT_STORAGE_KEY);
    if (!raw) {
      cachedState = DEFAULT_ADOLESCENCE_SUPPORT_STATE;
      lastRawValue = null;
      return DEFAULT_ADOLESCENCE_SUPPORT_STATE;
    }

    if (raw === lastRawValue && cachedState) {
      return cachedState;
    }

    const parsed = JSON.parse(raw) as Partial<AdolescenceSupportState>;
    const nextState: AdolescenceSupportState = {
      mood: isMood(parsed.mood) ? parsed.mood : DEFAULT_ADOLESCENCE_SUPPORT_STATE.mood,
      ritualId: isRitualId(parsed.ritualId)
        ? parsed.ritualId
        : DEFAULT_ADOLESCENCE_SUPPORT_STATE.ritualId,
      ritualProgress:
        typeof parsed.ritualProgress === "number"
          ? clamp(parsed.ritualProgress, 0, 100)
          : DEFAULT_ADOLESCENCE_SUPPORT_STATE.ritualProgress,
      ritualPlaying:
        typeof parsed.ritualPlaying === "boolean"
          ? parsed.ritualPlaying
          : DEFAULT_ADOLESCENCE_SUPPORT_STATE.ritualPlaying,
      insightsViewed:
        typeof parsed.insightsViewed === "number"
          ? clamp(parsed.insightsViewed, 0, 50)
          : DEFAULT_ADOLESCENCE_SUPPORT_STATE.insightsViewed,
      lastChatTopic:
        typeof parsed.lastChatTopic === "string" || parsed.lastChatTopic === null
          ? parsed.lastChatTopic
          : DEFAULT_ADOLESCENCE_SUPPORT_STATE.lastChatTopic,
      lastUpdatedAt:
        typeof parsed.lastUpdatedAt === "string"
          ? parsed.lastUpdatedAt
          : DEFAULT_ADOLESCENCE_SUPPORT_STATE.lastUpdatedAt,
    };

    lastRawValue = raw;
    cachedState = nextState;
    return nextState;
  } catch {
    return DEFAULT_ADOLESCENCE_SUPPORT_STATE;
  }
}

function writeAdolescenceSupportState(state: AdolescenceSupportState) {
  if (typeof window === "undefined") {
    return;
  }

  cachedState = null;
  lastRawValue = null;
  window.localStorage.setItem(ADOLESCENCE_SUPPORT_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(ADOLESCENCE_SUPPORT_STORAGE_KEY));
}

function subscribeToAdolescenceSupportState(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ADOLESCENCE_SUPPORT_STORAGE_KEY) {
      callback();
    }
  };

  const handleSameTabWrite = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    ADOLESCENCE_SUPPORT_STORAGE_KEY,
    handleSameTabWrite as EventListener,
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      ADOLESCENCE_SUPPORT_STORAGE_KEY,
      handleSameTabWrite as EventListener,
    );
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isMood(value: unknown): value is AdolescenceMood {
  return (
    value === "radiant" ||
    value === "calm" ||
    value === "pensive" ||
    value === "flowing" ||
    value === "growing"
  );
}

function isRitualId(value: unknown): value is AdolescenceRitualId {
  return (
    value === "morning_meditation" ||
    value === "body_checkin" ||
    value === "breathing_reset"
  );
}
