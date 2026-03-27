"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_ONBOARDING_STATE,
  ONBOARDING_STORAGE_KEY,
  readOnboardingState,
  writeOnboardingState,
  type OnboardingState,
} from "@/lib/onboarding-state";

export function useOnboardingFormState() {
  const formState = useSyncExternalStore(
    subscribeToOnboardingState,
    readOnboardingState,
    () => DEFAULT_ONBOARDING_STATE,
  );

  function updateFormState(patch: Partial<OnboardingState>) {
    const next = { ...readOnboardingState(), ...patch };
    writeOnboardingState(next);
  }

  return {
    formState,
    updateFormState,
  };
}

function subscribeToOnboardingState(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ONBOARDING_STORAGE_KEY) {
      callback();
    }
  };

  const handleSameTabWrite = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(
    ONBOARDING_STORAGE_KEY,
    handleSameTabWrite as EventListener,
  );

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(
      ONBOARDING_STORAGE_KEY,
      handleSameTabWrite as EventListener,
    );
  };
}
