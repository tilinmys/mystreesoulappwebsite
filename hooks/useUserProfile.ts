/**
 * useUserProfile
 *
 * The single hook every screen calls to know how to adapt itself.
 * Reads selectedGoals from the persisted onboarding store and
 * returns a fully-resolved UserProfile object.
 *
 * USAGE:
 *   const profile = useUserProfile();
 *   if (!profile.showCycleData) return null;
 *
 * Re-renders automatically if selectedGoals changes (e.g. user edits
 * their goals in Profile > Settings).
 */

import { getUserProfile, UserProfile } from "../constants/userProfile";
import { useOnboardingStore } from "../store/onboardingStore";

export function useUserProfile(): UserProfile {
  const selectedGoals = useOnboardingStore((s) => s.selectedGoals);
  return getUserProfile(selectedGoals);
}
