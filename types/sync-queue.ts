export interface JournalSavePayload {
  content: string;
  mood?: string;
  tags?: string[];
  localCreatedAt: number;
}

export interface CycleLogPayload {
  cycleDay?: number;
  flow?: "spotting" | "light" | "medium" | "heavy";
  mood?: string;
  symptoms?: string[];
  note?: string;
  localCreatedAt: number;
}

export interface OnboardingProgressPayload {
  step: "goals" | "privacy" | "health_setup" | "emotional_wellness" | "personalization" | "ready";
  values: Record<string, string | number | boolean | string[] | null>;
  localUpdatedAt: number;
}

export type SyncQueuePayloadByType = {
  journal: JournalSavePayload;
  cycle_log: CycleLogPayload;
  onboarding: OnboardingProgressPayload;
  companion: Record<string, string | number | boolean | null>;
  premium: Record<string, string | number | boolean | null>;
};

export type QueuedActionType = keyof SyncQueuePayloadByType;

export type QueuedAction<T extends QueuedActionType = QueuedActionType> = {
  [K in T]: {
    id: string;
    type: K;
    payload: SyncQueuePayloadByType[K];
    createdAt: number;
  };
}[T];
