"use client";

import { useEffect, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import {
  getAnswerLabel,
  getQuestionnaireConfig,
  normalizeSupportArea,
} from "@/lib/onboarding-questionnaire";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";

export function OnboardingSummary() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCurtain, setShowCurtain] = useState(true);
  const { formState } = useOnboardingFormState();

  useEffect(() => {
    const sweepAwayTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1100);

    const unmountTimer = setTimeout(() => {
      setShowCurtain(false);
    }, 2400);

    return () => {
      clearTimeout(sweepAwayTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  // If the user already completed onboarding (they have a name), treat this
  // page as a "Profile" view: back → dashboard. Otherwise we're still in the
  // first-time onboarding flow: back → questionnaire.
  const onboardingComplete = Boolean(formState.name);

  function handleBack() {
    startTransition(() => {
      if (onboardingComplete) {
        router.push("/dashboard");
      } else {
        router.push("/onboarding/questionnaire");
      }
    });
  }

  function handleFinish() {
    startTransition(() => {
      // Directs to the core app dashboard after onboarding
      router.push("/dashboard");
    });
  }

  const supportArea = normalizeSupportArea(formState.supportArea);
  const config = getQuestionnaireConfig(
    supportArea,
    formState.questionnaireAnswers,
  );
  const answerSummary = config.questions
    .map((question) => ({
      prompt: question.prompt,
      answer: getAnswerLabel(
        question,
        formState.questionnaireAnswers[
          question.id as keyof typeof formState.questionnaireAnswers
        ],
      ),
    }))
    .filter((item): item is { prompt: string; answer: string } => Boolean(item.answer));

  return (
    <PhonePreviewShell>
      <section className="relative grid h-[100dvh] w-full grid-rows-[auto_1fr_auto] overflow-hidden bg-surface text-on-surface md:h-[860px]">
        {/* Animated Floral Corners - 10-year animator touch ✨ */}
        <div
          className={`pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Abstract blobs */}
          <div className="absolute -left-12 top-[15%] h-64 w-64 rounded-full bg-primary/5 blur-[80px]" />
          <div className="absolute -right-12 bottom-[15%] h-80 w-80 rounded-full bg-outline-variant/15 blur-[100px]" />
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_20%_30%,rgba(156,62,36,0.05)_0%,transparent_40%),radial-gradient(circle_at_80%_70%,rgba(221,192,185,0.08)_0%,transparent_50%)]" />

          {/* Massive Floral Bursts - Immersive Animator Touch ✨ */}
          
          {/* Top Left Blast */}
          <div
            className={`absolute -left-[20%] -top-[10%] h-[40rem] w-[40rem] text-primary/10 ${
              isLoaded ? "garden-blast-tl" : "opacity-0"
            }`}
          >
            <div className="h-full w-full float-slow">
              <BotanicalPetal className="h-full w-full object-contain mix-blend-multiply" />
            </div>
          </div>

          {/* Top Right Blast */}
          <div
            className={`absolute -right-[15%] -top-[5%] h-[30rem] w-[30rem] text-[#ddc0b9]/30 ${
              isLoaded ? "garden-blast-tr" : "opacity-0"
            }`}
          >
            <div className="h-full w-full drift-slow" style={{ animationDelay: "200ms" }}>
              <BotanicalLeaf className="h-full w-full object-contain rotate-45 mix-blend-multiply" />
            </div>
          </div>

          {/* Bottom Left Subtle Ascent */}
          <div
            className={`absolute -bottom-[15%] -left-[25%] h-[45rem] w-[45rem] text-[#d5e9bf]/40 ${
              isLoaded ? "garden-blast-bl" : "opacity-0"
            }`}
          >
            <div className="h-full w-full sway-slow" style={{ animationDelay: "150ms" }}>
              <BotanicalLeaf className="h-full w-full object-contain -rotate-12 mix-blend-multiply" />
            </div>
          </div>

          {/* Deep Bottom Right Blast */}
          <div
            className={`absolute -bottom-[25%] -right-[25%] h-[50rem] w-[50rem] text-primary/15 ${
              isLoaded ? "garden-blast-br" : "opacity-0"
            }`}
          >
            <div className="h-full w-full float-slow" style={{ animationDelay: "300ms" }}>
              <BotanicalPetal className="h-full w-full object-contain rotate-[-45deg] scale-x-[-1] mix-blend-multiply" />
            </div>
          </div>
        </div>

        {/* Foreground transition curtain */}
        {showCurtain && (
          <div className="curtain-backdrop pointer-events-none absolute inset-0 z-50 overflow-hidden">
            <div className="curtain-top absolute -top-10 left-1/2 -ml-[15rem] w-[30rem] drop-shadow-2xl text-primary/95">
              <BotanicalPetal className="h-[18rem] w-full rotate-180 object-contain" />
            </div>
            <div className="curtain-bottom absolute -bottom-10 left-1/2 -ml-[15rem] w-[30rem] drop-shadow-2xl text-primary/90">
              <BotanicalPetal className="h-[18rem] w-full object-contain" />
            </div>
            <div className="curtain-left absolute -left-10 top-1/2 -mt-[15rem] h-[30rem] w-[20rem] drop-shadow-2xl text-secondary-container/95">
              <BotanicalLeaf className="h-full w-full object-contain" />
            </div>
            <div className="curtain-right absolute -right-10 top-1/2 -mt-[15rem] h-[30rem] w-[20rem] drop-shadow-2xl text-[#b4c79f]/90">
              <BotanicalLeaf className="h-full w-full -scale-x-100 object-contain mix-blend-multiply" />
            </div>
          </div>
        )}

        {/* Top App Bar */}
        <header className="relative z-20 flex items-center justify-between px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-extrabold tracking-[0.05em] text-primary uppercase">
              MyStree Soul
            </span>
          </div>
          <div className="w-10" />
        </header>

        {/* Main Canvas */}
        <main className="relative z-20 flex min-h-0 flex-col items-center overflow-y-auto px-8 pb-36 pt-4">
          {/* Hero Bloop Section */}
          <div
            className={`mb-8 flex flex-col items-center opacity-0 ${
              isLoaded ? "summary-card-stagger" : ""
            }`}
            style={{ animationDelay: "100ms" }}
          >
            <div className="relative flex h-48 w-48 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" />
              <Bloop
                state="celebrate"
                animated
                priority
                size="hero"
                accessibilityLabel="Setup complete assistant"
                className="relative z-10 h-44 w-44 object-contain drop-shadow-2xl"
              />
            </div>
            <div className="mt-8 text-center text-on-surface">
              <h1 className="mb-2 text-[1.8rem] font-extrabold tracking-tight">
                Hi {formState.name || "there"}, you&apos;re all set.
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/80">
                Your dashboard is ready
              </p>
            </div>
          </div>

          {/* Stacked Glassmorphic Cards */}
          <div className="w-full max-w-sm space-y-4">
            {/* Card 1: Profile Snapshot */}
            <div
              className={`flex items-center justify-between rounded-full bg-white/40 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-xl opacity-0 ${
                isLoaded ? "summary-card-stagger" : ""
              }`}
              style={{ animationDelay: "250ms" }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
                  <PersonIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70">
                    Profile Snapshot
                  </p>
                  <p className="text-lg font-bold text-on-surface">
                    {formState.name || "User"}
                  </p>
                </div>
              </div>
              <VerifiedBadge className="h-6 w-6 text-outline-variant" />
            </div>

            {/* Card 2: Cycle Baseline */}
            <div
              className={`flex items-center justify-between rounded-full bg-white/40 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-xl opacity-0 ${
                isLoaded ? "summary-card-stagger" : ""
              }`}
              style={{ animationDelay: "350ms" }}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
                  <div className="absolute inset-0 rotate-45 rounded-full border-[3px] border-primary border-t-transparent opacity-60 mix-blend-multiply" />
                  <CycleMarkerIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70">
                    Cycle Baseline
                  </p>
                  <p className="text-lg font-bold text-on-surface">
                    Cycle: {formState.cycleLength}
                    {"\u00A0"}days • Period: {formState.flowDuration}
                    {"\u00A0"}days
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Your Focus */}
            <div
              className={`flex flex-col rounded-[2rem] bg-white/40 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-xl opacity-0 ${
                isLoaded ? "summary-card-stagger" : ""
              }`}
              style={{ animationDelay: "450ms" }}
            >
              <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70">
                Primary Focus Areas
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex rounded-full bg-primary-fixed px-4 py-2 text-[11px] font-bold tracking-wide text-on-primary-fixed">
                  {config.pillarLabel}
                </div>
                {formState.focus ? (
                  <div className="inline-flex rounded-full bg-secondary-fixed px-4 py-2 text-[11px] font-bold tracking-wide text-on-secondary-fixed">
                    {toTitleCase(formState.focus)}
                  </div>
                ) : null}
              </div>
            </div>
            {answerSummary.length > 0 ? (
              <div
                className={`flex flex-col rounded-[2rem] bg-white/40 p-5 shadow-sm ring-1 ring-white/50 backdrop-blur-xl opacity-0 ${
                  isLoaded ? "summary-card-stagger" : ""
                }`}
                style={{ animationDelay: "550ms" }}
              >
                <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70">
                  Your preferences
                </p>
                <div className="space-y-3">
                  {answerSummary.map((item) => (
                    <div
                      key={item.prompt}
                      className="rounded-[1.2rem] bg-white/55 px-4 py-3"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/55">
                        {item.prompt}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-on-surface">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </main>

        {/* Footer CTA Shell */}
        <footer
          className={`pointer-events-none absolute bottom-0 left-0 w-full z-30 flex flex-col items-center bg-gradient-to-t from-surface via-surface/95 to-transparent px-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-8 opacity-0 transition-opacity duration-1000 ${
            isLoaded ? "opacity-100" : ""
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="pointer-events-auto w-full max-w-sm">
            <button
              onClick={handleFinish}
              className="group flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#9c3e24] to-[#bc563a] py-[1.125rem] text-[13px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_24px_rgba(156,62,36,0.25)] transition-all active:scale-[0.98]"
            >
              Enter My Dashboard
              <ArrowRightIcon className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </footer>
      </section>
    </PhonePreviewShell>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 18 L9 12 L15 6" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
    </svg>
  );
}

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10.93 17.5L5.8 12.33L7.24 10.91L10.93 14.65L16.73 8.8L18.17 10.21L10.93 17.5Z" />
    </svg>
  );
}

function CycleMarkerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function BotanicalLeaf({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0 100C30 100 50 70 50 50C50 30 70 0 100 0C70 20 50 50 50 70C50 90 30 100 0 100Z"
        opacity="0.85"
      />
    </svg>
  );
}

function BotanicalPetal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M50 10C65 30 90 40 90 60C90 80 65 90 50 100C35 90 10 80 10 60C10 40 35 30 50 10Z"
        opacity="0.78"
      />
    </svg>
  );
}

function toTitleCase(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
