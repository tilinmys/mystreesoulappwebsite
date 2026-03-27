"use client";

import { useSyncExternalStore } from "react";

export type AppearanceMode = "soft_light" | "system";

export type AppSettingsState = {
  mindfulReminders: boolean;
  appearanceMode: AppearanceMode;
  healthSyncEnabled: boolean;
  biometricLockEnabled: boolean;
  lastUpdatedAt: string;
};

export const APP_SETTINGS_STORAGE_KEY = "mystree-app-settings";

export const DEFAULT_APP_SETTINGS_STATE: AppSettingsState = {
  mindfulReminders: true,
  appearanceMode: "soft_light",
  healthSyncEnabled: true,
  biometricLockEnabled: true,
  lastUpdatedAt: new Date().toISOString(),
};

export function useAppSettingsState() {
  const settingsState = useSyncExternalStore(
    subscribeToAppSettingsState,
    readAppSettingsState,
    () => DEFAULT_APP_SETTINGS_STATE,
  );

  function updateSettingsState(patch: Partial<AppSettingsState>) {
    writeAppSettingsState({
      ...readAppSettingsState(),
      ...patch,
      lastUpdatedAt: new Date().toISOString(),
    });
  }

  return {
    settingsState,
    updateSettingsState,
  };
}

let cachedState: AppSettingsState | null = null;
let lastRawValue: string | null = null;

function readAppSettingsState(): AppSettingsState {
  if (typeof window === "undefined") {
    return DEFAULT_APP_SETTINGS_STATE;
  }

  try {
    const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!raw) {
      cachedState = DEFAULT_APP_SETTINGS_STATE;
      lastRawValue = null;
      return DEFAULT_APP_SETTINGS_STATE;
    }

    if (raw === lastRawValue && cachedState) {
      return cachedState;
    }

    const parsed = JSON.parse(raw) as Partial<AppSettingsState>;
    const nextState: AppSettingsState = {
      mindfulReminders:
        typeof parsed.mindfulReminders === "boolean"
          ? parsed.mindfulReminders
          : DEFAULT_APP_SETTINGS_STATE.mindfulReminders,
      appearanceMode: isAppearanceMode(parsed.appearanceMode)
        ? parsed.appearanceMode
        : DEFAULT_APP_SETTINGS_STATE.appearanceMode,
      healthSyncEnabled:
        typeof parsed.healthSyncEnabled === "boolean"
          ? parsed.healthSyncEnabled
          : DEFAULT_APP_SETTINGS_STATE.healthSyncEnabled,
      biometricLockEnabled:
        typeof parsed.biometricLockEnabled === "boolean"
          ? parsed.biometricLockEnabled
          : DEFAULT_APP_SETTINGS_STATE.biometricLockEnabled,
      lastUpdatedAt:
        typeof parsed.lastUpdatedAt === "string"
          ? parsed.lastUpdatedAt
          : DEFAULT_APP_SETTINGS_STATE.lastUpdatedAt,
    };

    lastRawValue = raw;
    cachedState = nextState;
    return nextState;
  } catch {
    return DEFAULT_APP_SETTINGS_STATE;
  }
}

function writeAppSettingsState(state: AppSettingsState) {
  if (typeof window === "undefined") {
    return;
  }

  cachedState = null;
  lastRawValue = null;
  window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(APP_SETTINGS_STORAGE_KEY));
}

function subscribeToAppSettingsState(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === APP_SETTINGS_STORAGE_KEY) {
      callback();
    }
  };

  const handleSameTabWrite = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    APP_SETTINGS_STORAGE_KEY,
    handleSameTabWrite as EventListener,
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      APP_SETTINGS_STORAGE_KEY,
      handleSameTabWrite as EventListener,
    );
  };
}

function isAppearanceMode(value: unknown): value is AppearanceMode {
  return value === "soft_light" || value === "system";
}
