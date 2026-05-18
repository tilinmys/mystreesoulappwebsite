import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { resilientJSONStorage } from "./persistStorage";

interface NetworkState {
  isOnline: boolean;
  lastChangedAt: number | null;
  hasSeenOfflineToast: boolean;
  markOfflineToastSeen: () => void;
  setOnlineStatus: (isOnline: boolean) => void;
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      lastChangedAt: null,
      hasSeenOfflineToast: false,
      markOfflineToastSeen: () => set({ hasSeenOfflineToast: true }),
      setOnlineStatus: (isOnline) => {
        if (get().isOnline === isOnline) return;
        set({
          isOnline,
          lastChangedAt: Date.now(),
          hasSeenOfflineToast: isOnline ? false : get().hasSeenOfflineToast,
        });
      },
    }),
    {
      name: "network-state-storage",
      storage: createJSONStorage(() => resilientJSONStorage),
      partialize: (state) => ({
        hasSeenOfflineToast: state.hasSeenOfflineToast,
        isOnline: state.isOnline,
        lastChangedAt: state.lastChangedAt,
      }),
    }
  )
);
