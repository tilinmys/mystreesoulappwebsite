import { useSyncQueueStore } from "../store/syncQueueStore";
import type { CycleLogPayload, JournalSavePayload, OnboardingProgressPayload } from "../types/sync-queue";

export function queueJournalSave(payload: JournalSavePayload) {
  return useSyncQueueStore.getState().enqueueAction({
    type: "journal",
    payload,
  });
}

export function queueCycleLog(payload: CycleLogPayload) {
  return useSyncQueueStore.getState().enqueueAction({
    type: "cycle_log",
    payload,
  });
}

export function queueOnboardingProgress(payload: OnboardingProgressPayload) {
  return useSyncQueueStore.getState().enqueueAction({
    type: "onboarding",
    payload,
  });
}
