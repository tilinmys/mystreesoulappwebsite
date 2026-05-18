import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { QueuedAction, QueuedActionType, SyncQueuePayloadByType } from "../types/sync-queue";
import { resilientJSONStorage } from "./persistStorage";

const MAX_QUEUE_SIZE = 100;
const validActionTypes = new Set<QueuedActionType>(["journal", "cycle_log", "onboarding", "companion", "premium"]);

interface SyncQueueState {
  queue: QueuedAction[];
  lastSyncedAt: number | null;
  isSyncing: boolean;
  clearQueue: () => void;
  enqueueAction: <T extends QueuedActionType>(
    action: {
      type: T;
      payload: SyncQueuePayloadByType[T];
      id?: string;
      createdAt?: number;
    }
  ) => string | null;
  markActionSynced: (id: string) => void;
  setIsSyncing: (isSyncing: boolean) => void;
}

function createQueueId() {
  return `queue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useSyncQueueStore = create<SyncQueueState>()(
  persist(
    (set) => ({
      queue: [],
      lastSyncedAt: null,
      isSyncing: false,
      clearQueue: () => set({ queue: [], lastSyncedAt: Date.now(), isSyncing: false }),
      enqueueAction: (action) => {
        if (!validActionTypes.has(action.type)) return null;
        const id = action.id ?? createQueueId();
        const queuedAction = {
          id,
          type: action.type,
          payload: action.payload,
          createdAt: action.createdAt ?? Date.now(),
        } as QueuedAction;
        set((state) => ({
          queue: [
            ...state.queue.filter((item) => {
              if (item.type !== "onboarding" || queuedAction.type !== "onboarding") return true;
              return item.payload.step !== queuedAction.payload.step;
            }),
            queuedAction,
          ].slice(-MAX_QUEUE_SIZE),
        }));
        return id;
      },
      markActionSynced: (id) =>
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
          lastSyncedAt: Date.now(),
        })),
      setIsSyncing: (isSyncing) => set({ isSyncing }),
    }),
    {
      name: "sync-queue-storage",
      storage: createJSONStorage(() => resilientJSONStorage),
    }
  )
);
