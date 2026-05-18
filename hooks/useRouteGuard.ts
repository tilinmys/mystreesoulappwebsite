import { usePathname, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { hasValidAuthSession, useAuthStore } from "../store/authStore";
import { isSafeNavigationIntentPath, useNavigationIntentStore } from "../store/navigationIntentStore";
import { useOnboardingStore } from "../store/onboardingStore";

const anonymousSegments = new Set(["", "welcome", "login", "register"]);
const onboardingSegments = new Set([
  "onboarding",
  "privacy-consent",
  "health-setup",
  "emotional-wellness",
  "personalization",
  "ready",
]);
const tabSegments = new Set([
  "dashboard",
  "cycle",
  "insights",
  "wellness",
  "nourish",
  "sleep",
  "community",
  "profile",
]);
const secondarySegments = new Set([
  "bloop",
  "bloop-chat",
  "grounding",
  "premium",
  "settings",
  "notifications",
  "journal",
  "fertility",
  "pregnancy",
  "menopause",
  "adolescence",
]);

export function useRouteGuard() {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const rootNavigationState = useRootNavigationState();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  const logout = useAuthStore((state) => state.logout);
  const setNavigationIntent = useNavigationIntentStore((state) => state.setNavigationIntent);
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);

  useEffect(() => {
    // Guard rule 1: wait for navigation and persisted stores before redirecting.
    // This prevents cold-start redirect loops while Zustand is still hydrating.
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
    const inProtectedApp = inTabs || (routeName ? secondarySegments.has(routeName) : false);
    const sessionValid = hasValidAuthSession({ isAuthenticated, sessionExpiresAt });
    const intendedPath = isSafeNavigationIntentPath(pathname) ? pathname : undefined;

    // Guard rule 2: anonymous users cannot access onboarding or protected app routes.
    // Protected app routes store a navigation intent so login can restore it safely.
    if (!sessionValid) {
      if (inProtectedApp || inOnboarding) {
        if (inProtectedApp && intendedPath) {
          setNavigationIntent(intendedPath, "guard");
        }
        logout();
        if (!onLogin) {
          router.replace({
            pathname: "/login",
            params: { reason: "session" },
          });
        }
      }
      return;
    }

    // Guard rule 3: authenticated users should not remain on login/register.
    if (onLogin || onRegister) {
      router.replace(hasCompletedOnboarding ? "/(tabs)/dashboard" : "/(onboarding)/onboarding");
      return;
    }

    // Guard rule 4: active users skip welcome and return to the main app.
    if (onWelcome && hasCompletedOnboarding) {
      router.replace("/(tabs)/dashboard");
      return;
    }

    // Guard rule 5: authenticated users must complete onboarding before app routes.
    if (!hasCompletedOnboarding && inProtectedApp && routeName !== "onboarding") {
      router.replace("/(onboarding)/onboarding");
      return;
    }

    // Guard rule 6: completed users cannot accidentally re-enter onboarding.
    if (hasCompletedOnboarding && inOnboarding && routeName !== "dashboard") {
      router.replace("/(tabs)/dashboard");
    }
  }, [hasCompletedOnboarding, isAuthenticated, logout, pathname, rootNavigationState?.key, router, segments, sessionExpiresAt, setNavigationIntent]);
}
