import { usePremiumStore } from "../store/premiumStore";

export function canAccessPremiumFeature() {
  const { expiresAt, isPremium } = usePremiumStore.getState();
  if (!isPremium) return false;
  return expiresAt == null || expiresAt > Date.now();
}

export function getPremiumStatusLabel() {
  const { expiresAt, isPremium, plan } = usePremiumStore.getState();
  if (!isPremium) return "Soul Premium locked";
  if (expiresAt != null && expiresAt <= Date.now()) return "Soul Premium expired";
  if (plan === "soul_lifetime") return "Soul Premium lifetime";
  if (plan === "soul_yearly") return "Soul Premium yearly";
  return "Soul Premium active";
}
