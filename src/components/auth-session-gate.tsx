"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { hasCompletedOnboarding } from "@/lib/onboarding-state";
import { useAuthSessionState } from "@/lib/use-auth-session-state";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";

export function AuthSessionGate({
  children,
  requireCompletedOnboarding = true,
}: {
  children: React.ReactNode;
  requireCompletedOnboarding?: boolean;
}) {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const { session } = useAuthSessionState();
  const { formState } = useOnboardingFormState();
  const onboardingComplete = hasCompletedOnboarding(formState);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!session) {
      console.warn("[auth-gate] Missing session, redirecting to /sign-in");
      router.replace("/sign-in");
      return;
    }

    if (requireCompletedOnboarding && !onboardingComplete) {
      console.info(
        "[auth-gate] Session found but onboarding incomplete, redirecting to /privacy",
      );
      router.replace("/privacy");
    }
  }, [isHydrated, onboardingComplete, requireCompletedOnboarding, router, session]);

  if (!isHydrated) {
    return <GateFallback message="Loading your page..." />;
  }

  if (!session) {
    return <GateFallback message="Opening sign-in..." />;
  }

  if (requireCompletedOnboarding && !onboardingComplete) {
    return <GateFallback message="Preparing your setup..." />;
  }

  return <>{children}</>;
}

function GateFallback({ message }: { message: string }) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#fdfaf7] px-6 text-center md:min-h-[860px]">
      <div className="max-w-xs rounded-[2rem] border border-white/70 bg-white/80 px-6 py-8 shadow-[0_18px_40px_rgba(156,62,36,0.08)] backdrop-blur-xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/70">
          MyStree Soul
        </p>
        <p className="mt-3 text-base font-medium leading-relaxed text-on-surface">
          {message}
        </p>
      </div>
    </div>
  );
}

function subscribeToHydration() {
  return () => {};
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}
