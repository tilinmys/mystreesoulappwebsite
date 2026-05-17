import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { hasValidAuthSession, useAuthStore } from "../store/authStore";
import { useOnboardingStore } from "../store/onboardingStore";

const tabSegments = new Set(["dashboard", "cycle", "insights", "wellness", "nourish", "profile"]);
const onboardingSegments = new Set(["onboarding", "privacy-consent", "health-setup", "emotional-wellness", "personalization", "ready"]);
const secondarySegments = new Set(["bloop", "notifications", "premium", "settings", "fertility", "pregnancy", "menopause", "adolescence"]);
const protectedOnboardingSegments = new Set(["onboarding", "privacy-consent", "health-setup", "emotional-wellness", "personalization", "ready"]);

export function useRouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  const logout = useAuthStore((state) => state.logout);
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    const authHydrated = useAuthStore.persist.hasHydrated();
    const onboardingHydrated = useOnboardingStore.persist.hasHydrated();
    if (!rootNavigationState?.key || !authHydrated || !onboardingHydrated) return;

    const segmentList = segments as readonly string[];
    const firstSegment = segmentList[0];
    const secondSegment = segmentList[1];
    const routeName = firstSegment?.startsWith("(") ? secondSegment : firstSegment;

    const onLogin = routeName === "login";
    const onRegister = routeName === "register";
    const onWelcome = routeName === "welcome";
    const inTabs = firstSegment === "(tabs)" || (routeName ? tabSegments.has(routeName) : false);
    const inOnboarding = firstSegment === "(onboarding)" || (routeName ? onboardingSegments.has(routeName) : false);
    const inProtectedOnboarding = routeName ? protectedOnboardingSegments.has(routeName) : false;
    const inProtectedApp = inTabs || (routeName ? secondarySegments.has(routeName) : false);
    const sessionValid = hasValidAuthSession({ isAuthenticated, sessionExpiresAt });

    // Unauthenticated user trying to access protected areas → login
    if (!sessionValid) {
      if (inProtectedApp || inProtectedOnboarding) {
        logout();
        router.replace({ pathname: "/login", params: { reason: "session" } });
      }
      // welcome, login, register, and the splash onboarding screen are all fine without auth
      return;
    }

    // Authenticated user on login or register → redirect appropriately
    if ((onLogin || onRegister) && sessionValid) {
      router.replace(hasCompletedOnboarding ? "/(tabs)/dashboard" : "/(onboarding)/onboarding");
      return;
    }

    // Authenticated + completed onboarding on welcome → skip to dashboard
    if (onWelcome && sessionValid && hasCompletedOnboarding) {
      router.replace("/(tabs)/dashboard");
      return;
    }
    // Authenticated but not yet onboarded on welcome → stay, let user choose their path

    // Authenticated user without onboarding in a protected app area → start at onboarding screen 1
    if (sessionValid && !hasCompletedOnboarding && inProtectedApp) {
      router.replace("/(onboarding)/onboarding");
      return;
    }

    // Authenticated + completed onboarding in any onboarding screen → dashboard
    if (sessionValid && hasCompletedOnboarding && inOnboarding) {
      router.replace("/(tabs)/dashboard");
      return;
    }
  }, [hasCompletedOnboarding, isAuthenticated, logout, rootNavigationState?.key, router, segments, sessionExpiresAt]);
}
