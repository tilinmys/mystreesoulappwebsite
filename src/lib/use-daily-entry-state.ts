"use client";

import { useSyncExternalStore } from "react";

export type DailyEntryMood =
  | "radiant"
  | "calm"
  | "focus"
  | "soft"
  | "tender";

export type DailyEntryFlow = "none" | "light" | "medium" | "heavy";

export type DailyEntrySymptom =
  | "cramps"
  | "bloating"
  | "migraine"
  | "fatigue"
  | "back_pain";

export type DailyEntryDraft = {
  mood: DailyEntryMood;
  flow: DailyEntryFlow;
  symptoms: DailyEntrySymptom[];
  painLevel: number;
};

export type DailyEntryRecord = DailyEntryDraft & {
  savedAt: string;
};

export const DAILY_ENTRY_STORAGE_KEY = "mystree-daily-entry";
export const DAILY_ENTRY_PROMPT_STORAGE_KEY = "mystree-daily-entry-prompt";

export const DEFAULT_DAILY_ENTRY_DRAFT: DailyEntryDraft = {
  mood: "calm",
  flow: "light",
  symptoms: [],
  painLevel: 0,
};

export function useDailyEntryRecord() {
  const dailyEntry = useSyncExternalStore(
    subscribeToDailyEntryState,
    readDailyEntryRecord,
    () => null,
  );

  function saveDailyEntry(draft: DailyEntryDraft) {
    writeDailyEntryRecord({
      ...draft,
      savedAt: new Date().toISOString(),
    });
  }

  return {
    dailyEntry,
    saveDailyEntry,
  };
}

export function buildDailyEntryDraft(
  dailyEntry: DailyEntryRecord | null,
): DailyEntryDraft {
  if (!dailyEntry) {
    return DEFAULT_DAILY_ENTRY_DRAFT;
  }

  return {
    mood: dailyEntry.mood,
    flow: dailyEntry.flow,
    symptoms: dailyEntry.symptoms,
    painLevel: dailyEntry.painLevel,
  };
}

export function dismissDailyEntryPromptForToday() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    DAILY_ENTRY_PROMPT_STORAGE_KEY,
    new Date().toISOString(),
  );
}

export function shouldAutoOpenDailyEntryPrompt(
  dailyEntry: DailyEntryRecord | null,
): boolean {
  if (dailyEntry && isSameLocalDay(new Date(dailyEntry.savedAt), new Date())) {
    return false;
  }

  if (typeof window === "undefined") {
    return false;
  }

  const dismissedAt = window.localStorage.getItem(DAILY_ENTRY_PROMPT_STORAGE_KEY);
  if (!dismissedAt) {
    return true;
  }

  const dismissedDate = new Date(dismissedAt);
  if (Number.isNaN(dismissedDate.getTime())) {
    return true;
  }

  return !isSameLocalDay(dismissedDate, new Date());
}

let cachedDailyEntry: DailyEntryRecord | null = null;
let lastDailyEntryRaw: string | null = null;

function readDailyEntryRecord(): DailyEntryRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DAILY_ENTRY_STORAGE_KEY);
    if (!raw) {
      cachedDailyEntry = null;
      lastDailyEntryRaw = null;
      return null;
    }

    // Return the cached object if the raw JSON hasn't changed.
    // This keeps the reference stable, preventing useSyncExternalStore's
    // infinite re-render loop.
    if (raw === lastDailyEntryRaw && cachedDailyEntry !== undefined) {
      return cachedDailyEntry;
    }

    const parsed = JSON.parse(raw) as Partial<DailyEntryRecord>;
    if (
      !isMood(parsed.mood) ||
      !isFlow(parsed.flow) ||
      typeof parsed.savedAt !== "string"
    ) {
      lastDailyEntryRaw = raw;
      cachedDailyEntry = null;
      return null;
    }

    const newEntry: DailyEntryRecord = {
      mood: parsed.mood,
      flow: parsed.flow,
      symptoms: normalizeSymptoms(parsed.symptoms),
      painLevel: normalizePainLevel(parsed.painLevel),
      savedAt: parsed.savedAt,
    };

    lastDailyEntryRaw = raw;
    cachedDailyEntry = newEntry;
    return newEntry;
  } catch {
    return null;
  }
}

function writeDailyEntryRecord(entry: DailyEntryRecord) {
  if (typeof window === "undefined") {
    return;
  }

  // Bust the cache so the next readDailyEntryRecord sees the new value.
  cachedDailyEntry = null;
  lastDailyEntryRaw = null;

  window.localStorage.setItem(DAILY_ENTRY_STORAGE_KEY, JSON.stringify(entry));
  window.dispatchEvent(new Event(DAILY_ENTRY_STORAGE_KEY));
}

function subscribeToDailyEntryState(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === DAILY_ENTRY_STORAGE_KEY) {
      callback();
    }
  };

  const handleSameTabWrite = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    DAILY_ENTRY_STORAGE_KEY,
    handleSameTabWrite as EventListener,
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      DAILY_ENTRY_STORAGE_KEY,
      handleSameTabWrite as EventListener,
    );
  };
}

function normalizeSymptoms(value: unknown): DailyEntrySymptom[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isSymptom);
}

function normalizePainLevel(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.min(10, Math.max(0, Math.round(value)));
}

function isMood(value: unknown): value is DailyEntryMood {
  return (
    value === "radiant" ||
    value === "calm" ||
    value === "focus" ||
    value === "soft" ||
    value === "tender"
  );
}

function isFlow(value: unknown): value is DailyEntryFlow {
  return (
    value === "none" ||
    value === "light" ||
    value === "medium" ||
    value === "heavy"
  );
}

function isSymptom(value: unknown): value is DailyEntrySymptom {
  return (
    value === "cramps" ||
    value === "bloating" ||
    value === "migraine" ||
    value === "fatigue" ||
    value === "back_pain"
  );
}

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
