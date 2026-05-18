import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { resilientJSONStorage } from "./persistStorage";

export type PremiumPlan = "free" | "soul_monthly" | "soul_yearly" | "soul_lifetime";

interface PremiumState {
  isPremium: boolean;
  plan: PremiumPlan;
  expiresAt: number | null;
  lastCheckedAt: number | null;
  clearEntitlement: () => void;
  setEntitlement: (entitlement: { isPremium: boolean; plan?: PremiumPlan; expiresAt?: number | null }) => void;
}

export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      plan: "free",
      expiresAt: null,
      lastCheckedAt: null,
      clearEntitlement: () =>
        set({ isPremium: false, plan: "free", expiresAt: null, lastCheckedAt: Date.now() }),
      setEntitlement: ({ isPremium, plan, expiresAt }) =>
        set({
          isPremium,
          plan: isPremium ? plan ?? "soul_monthly" : "free",
          expiresAt: expiresAt ?? null,
          lastCheckedAt: Date.now(),
        }),
    }),
    {
      name: "premium-entitlement-storage",
      storage: createJSONStorage(() => resilientJSONStorage),
    }
  )
);
