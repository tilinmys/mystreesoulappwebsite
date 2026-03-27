"use client";

import { useEffect, useState } from "react";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { useRouter } from "next/navigation";
import { hasCompletedOnboarding } from "@/lib/onboarding-state";
import { useAuthSessionState } from "@/lib/use-auth-session-state";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import { SplashScreen } from "@/components/splash-screen";
import { WelcomeScreen } from "@/components/welcome-screen";

type Phase = "splash" | "transition" | "welcome";

const SPLASH_DURATION_MS = 2200;
const TRANSITION_DURATION_MS = 1150;

export function WelcomeFlow() {
  const [phase, setPhase] = useState<Phase>("splash");

  const { formState } = useOnboardingFormState();
  const { session } = useAuthSessionState();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      return;
    }

    router.replace(hasCompletedOnboarding(formState) ? "/dashboard" : "/privacy");
  }, [formState, router, session]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const reducedMotionFrame = window.requestAnimationFrame(() => {
        setPhase("welcome");
      });

      return () => {
        window.cancelAnimationFrame(reducedMotionFrame);
      };
    }

    const transitionTimer = window.setTimeout(() => {
      setPhase("transition");
    }, SPLASH_DURATION_MS);

    const welcomeTimer = window.setTimeout(() => {
      setPhase("welcome");
    }, SPLASH_DURATION_MS + TRANSITION_DURATION_MS);

    return () => {
      window.clearTimeout(transitionTimer);
      window.clearTimeout(welcomeTimer);
    };
  }, []);

  const transitionStarted = phase !== "splash";

  return (
    <PhonePreviewShell>
      <div className="relative min-h-screen flex-1 overflow-hidden md:min-h-[860px]">
        <SplashScreen
          className={
            phase === "splash"
              ? "opacity-100"
              : "splash-exit pointer-events-none opacity-0"
          }
        />

        <WelcomeScreen
          className={
            phase === "welcome"
              ? "welcome-visible pointer-events-auto opacity-100"
              : "welcome-hidden pointer-events-none opacity-0"
          }
        />

        {transitionStarted ? (
          <div
            className={`pointer-events-none absolute inset-0 z-30 ${
              phase === "welcome" ? "transition-overlay-fade" : ""
            }`}
            aria-hidden="true"
          >
            <div className="flower-enter-left absolute -left-14 top-24 h-40 w-40 text-[#d96c4e]/25">
              <TransitionBloom />
            </div>
            <div className="flower-enter-right absolute -right-16 top-48 h-56 w-56 text-[#9caf88]/24 [animation-delay:90ms]">
              <TransitionPetal />
            </div>
            <div className="flower-enter-left absolute -left-10 bottom-44 h-32 w-32 text-[#9caf88]/22 [animation-delay:180ms]">
              <TransitionLeaf />
            </div>
            <div className="flower-enter-right absolute -right-12 bottom-24 h-36 w-36 text-[#d96c4e]/18 [animation-delay:260ms]">
              <TransitionBloom />
            </div>
          </div>
        ) : null}
      </div>
    </PhonePreviewShell>
  );
}

function TransitionBloom() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 50C50 30 70 10 90 10C90 30 70 50 50 50Z"
        fill="currentColor"
      />
      <path
        d="M50 50C70 50 90 70 90 90C70 90 50 70 50 50Z"
        fill="currentColor"
      />
      <path
        d="M50 50C50 70 30 90 10 90C10 70 30 50 50 50Z"
        fill="currentColor"
      />
      <path
        d="M50 50C30 50 10 30 10 10C30 10 50 30 50 50Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TransitionPetal() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 0C60 20 100 30 100 50C100 70 60 80 50 100C40 80 0 70 0 50C0 30 40 20 50 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TransitionLeaf() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 100C30 100 50 70 50 50C50 30 70 0 100 0"
        stroke="currentColor"
        strokeWidth="4"
      />
      <ellipse
        cx="30"
        cy="70"
        rx="10"
        ry="15"
        transform="rotate(-45 30 70)"
        fill="currentColor"
        fillOpacity="0.55"
      />
      <ellipse
        cx="70"
        cy="30"
        rx="10"
        ry="15"
        transform="rotate(-45 70 30)"
        fill="currentColor"
        fillOpacity="0.55"
      />
    </svg>
  );
}
