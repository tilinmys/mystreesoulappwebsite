"use client";

import { useSyncExternalStore } from "react";

export type FertilityLhResult = "negative" | "positive" | "peak";

export type FertilityFluid = "dry" | "creamy" | "watery" | "egg_white";

export type FertilityLogDraft = {
  lhResult: FertilityLhResult;
  basalTemp: number;
  cervicalFluid: FertilityFluid;
  intercourse: boolean;
};

export type FertilityLogRecord = FertilityLogDraft & {
  savedAt: string;
};

export const FERTILITY_LOG_STORAGE_KEY = "mystree-fertility-log";

export const DEFAULT_FERTILITY_LOG_DRAFT: FertilityLogDraft = {
  lhResult: "negative",
  basalTemp: 97.8,
  cervicalFluid: "creamy",
  intercourse: false,
};

export function useFertilityLogRecord() {
  const fertilityLog = useSyncExternalStore(
    subscribeToFertilityLog,
    readFertilityLogRecord,
    () => null,
  );

  function saveFertilityLog(draft: FertilityLogDraft) {
    writeFertilityLogRecord({
      ...draft,
      basalTemp: normalizeBasalTemp(draft.basalTemp),
      savedAt: new Date().toISOString(),
    });
  }

  return {
    fertilityLog,
    saveFertilityLog,
  };
}

export function buildFertilityLogDraft(
  fertilityLog: FertilityLogRecord | null,
): FertilityLogDraft {
  if (!fertilityLog) {
    return DEFAULT_FERTILITY_LOG_DRAFT;
  }

  return {
    lhResult: fertilityLog.lhResult,
    basalTemp: fertilityLog.basalTemp,
    cervicalFluid: fertilityLog.cervicalFluid,
    intercourse: fertilityLog.intercourse,
  };
}

let cachedFertilityLog: FertilityLogRecord | null = null;
let lastFertilityLogRaw: string | null = null;

function readFertilityLogRecord(): FertilityLogRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(FERTILITY_LOG_STORAGE_KEY);
    if (!raw) {
      cachedFertilityLog = null;
      lastFertilityLogRaw = null;
      return null;
    }

    if (raw === lastFertilityLogRaw) {
      return cachedFertilityLog;
    }

    const parsed = JSON.parse(raw) as Partial<FertilityLogRecord>;

    if (
      !isLhResult(parsed.lhResult) ||
      !isFluid(parsed.cervicalFluid) ||
      typeof parsed.savedAt !== "string" ||
      typeof parsed.intercourse !== "boolean"
    ) {
      lastFertilityLogRaw = raw;
      cachedFertilityLog = null;
      return null;
    }

    const nextRecord: FertilityLogRecord = {
      lhResult: parsed.lhResult,
      basalTemp: normalizeBasalTemp(parsed.basalTemp),
      cervicalFluid: parsed.cervicalFluid,
      intercourse: parsed.intercourse,
      savedAt: parsed.savedAt,
    };

    lastFertilityLogRaw = raw;
    cachedFertilityLog = nextRecord;
    return nextRecord;
  } catch {
    return null;
  }
}

function writeFertilityLogRecord(record: FertilityLogRecord) {
  if (typeof window === "undefined") {
    return;
  }

  cachedFertilityLog = null;
  lastFertilityLogRaw = null;

  window.localStorage.setItem(
    FERTILITY_LOG_STORAGE_KEY,
    JSON.stringify(record),
  );
  window.dispatchEvent(new Event(FERTILITY_LOG_STORAGE_KEY));
}

function subscribeToFertilityLog(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FERTILITY_LOG_STORAGE_KEY) {
      callback();
    }
  };

  const handleSameTabWrite = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    FERTILITY_LOG_STORAGE_KEY,
    handleSameTabWrite as EventListener,
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      FERTILITY_LOG_STORAGE_KEY,
      handleSameTabWrite as EventListener,
    );
  };
}

function normalizeBasalTemp(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_FERTILITY_LOG_DRAFT.basalTemp;
  }

  return Math.min(99.5, Math.max(96.5, Number(value.toFixed(1))));
}

function isLhResult(value: unknown): value is FertilityLhResult {
  return value === "negative" || value === "positive" || value === "peak";
}

function isFluid(value: unknown): value is FertilityFluid {
  return (
    value === "dry" ||
    value === "creamy" ||
    value === "watery" ||
    value === "egg_white"
  );
}
