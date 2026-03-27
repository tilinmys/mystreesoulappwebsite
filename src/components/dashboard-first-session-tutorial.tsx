"use client";

import { useEffect, useMemo, useState } from "react";
import { Bloop, type BloopState } from "@/components/common/Bloop";

type TutorialStep = {
  eyebrow: string;
  title: string;
  description: string;
  primaryState: BloopState;
  accentStates: BloopState[];
  backgroundTone: string;
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    eyebrow: "Meet Bloop",
    title: "Your dashboard is guided with warmth, not pressure.",
    description:
      "Bloop helps you understand what matters now, so the app feels calm from the first glance.",
    primaryState: "guide",
    accentStates: ["idle", "celebrate"],
    backgroundTone:
      "from-[#fff9f6] via-[#fff3ee] to-[#fdf7f2]",
  },
  {
    eyebrow: "Log in seconds",
    title: "Daily check-ins stay quick, gentle, and easy to repeat.",
    description:
      "Mood, symptoms, reminders, and insights are designed to take only a few seconds when life is busy.",
    primaryState: "encourage",
    accentStates: ["inform", "alert"],
    backgroundTone:
      "from-[#fff8f3] via-[#fff6f1] to-[#fcfaf7]",
  },
  {
    eyebrow: "Your path adapts",
    title: "Support shifts with every life stage without changing the feeling.",
    description:
      "Cycle, pregnancy, menopause, and adolescence each get the right support while keeping the same calm rhythm.",
    primaryState: "pregnancy",
    accentStates: ["adolescence", "menopause"],
    backgroundTone:
      "from-[#fffaf7] via-[#fff2ee] to-[#fdf9f4]",
  },
  {
    eyebrow: "You stay in control",
    title: "Empty states, sensitive moments, and wins are all handled softly.",
    description:
      "Bloop stays reassuring when things feel hard and celebratory when progress deserves a little joy.",
    primaryState: "reassure",
    accentStates: ["empty", "celebrate"],
    backgroundTone:
      "from-[#fffaf6] via-[#fff4ef] to-[#fcf9f4]",
  },
];

export function DashboardFirstSessionTutorial({
  userName,
  onFinish,
}: {
  userName?: string;
  onFinish: () => void;
}) {
  const [phase, setPhase] = useState<"intro" | "steps">("intro");
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase("steps");
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const activeStep = TUTORIAL_STEPS[stepIndex];
  const progressWidth = `${((stepIndex + 1) / TUTORIAL_STEPS.length) * 100}%`;
  const allStates = useMemo<BloopState[]>(
    () => [
      "idle",
      "guide",
      "encourage",
      "reassure",
      "celebrate",
      "inform",
      "empty",
      "alert",
      "adolescence",
      "pregnancy",
      "menopause",
    ],
    [],
  );

  function handleContinue() {
    if (stepIndex === TUTORIAL_STEPS.length - 1) {
      onFinish();
      return;
    }

    setStepIndex((current) => current + 1);
  }

  return (
    <div className="absolute inset-0 z-[95] overflow-hidden bg-[rgba(253,250,247,0.86)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[14%] top-[8%] h-[20rem] w-[20rem] rounded-full bg-primary/8 blur-[105px]" />
        <div className="absolute -right-[18%] bottom-[10%] h-[18rem] w-[18rem] rounded-full bg-secondary/12 blur-[100px]" />
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_16%_22%,rgba(156,62,36,0.08),transparent_17%),radial-gradient(circle_at_82%_16%,rgba(82,100,66,0.07),transparent_16%),radial-gradient(circle_at_45%_78%,rgba(245,222,215,0.6),transparent_18%)]" />
      </div>

      {phase === "intro" ? (
        <div className="relative flex h-full items-center justify-center px-5">
          <div className="absolute inset-0">
            {allStates.map((state, index) => (
              <div
                key={state}
                className="absolute"
                style={{
                  left: `${10 + ((index % 4) * 21)}%`,
                  top: `${10 + (Math.floor(index / 4) * 24)}%`,
                  animationDelay: `${index * 120}ms`,
                }}
              >
                <Bloop
                  state={state}
                  animated
                  decorative
                  size={index % 3 === 0 ? "medium" : "small"}
                  className="opacity-80 drop-shadow-[0_12px_22px_rgba(156,62,36,0.12)]"
                  sizes={index % 3 === 0 ? "56px" : "36px"}
                />
              </div>
            ))}
          </div>
          <div className="relative z-10 w-full max-w-[20rem] rounded-[2.2rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(250,244,239,0.94))] px-6 py-7 text-center shadow-[0_24px_54px_rgba(44,28,17,0.1)]">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(244,221,214,0.95),rgba(255,255,255,0.4))] shadow-[0_18px_34px_rgba(156,62,36,0.12)]">
              <Bloop
                state="guide"
                animated
                priority
                size={104}
                accessibilityLabel="Bloop welcoming you to the dashboard"
                className="drop-shadow-[0_18px_36px_rgba(156,62,36,0.18)]"
                sizes="96px"
              />
            </div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-primary/65">
              Welcoming you in
            </p>
            <h2 className="mt-3 text-[1.55rem] font-light tracking-tight text-on-surface">
              {userName
                ? `${userName}, your dashboard is getting ready.`
                : "Your dashboard is getting ready."}
            </h2>
            <p className="mt-3 text-[13px] font-medium leading-relaxed text-on-surface-variant">
              A quick walkthrough will show you how MyStree Soul stays simple, personal, and calm.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative flex h-full items-center justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+0.9rem)]">
          <div className="w-full max-w-[21rem] rounded-[2.2rem] border border-white/85 bg-white/90 p-4 shadow-[0_24px_54px_rgba(44,28,17,0.1)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="w-14" />
            <div className="w-full max-w-[8.75rem] rounded-full bg-white/70 p-1 shadow-sm">
              <div className="h-1.5 rounded-full bg-[#f3e2d7]">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: progressWidth }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onFinish}
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/70 transition hover:text-primary"
            >
              Skip
            </button>
          </div>

          <div
            className={`relative flex min-h-[31rem] flex-col overflow-hidden rounded-[2rem] border border-white/85 bg-gradient-to-b ${activeStep.backgroundTone} p-5 shadow-[0_20px_50px_rgba(44,28,17,0.08)]`}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-12 top-8 h-28 w-28 rounded-full bg-primary/6 blur-3xl" />
              <div className="absolute -right-12 bottom-10 h-28 w-28 rounded-full bg-secondary/10 blur-3xl" />
              <div className="absolute left-1/2 top-[14%] -translate-x-1/2 opacity-25">
                <Bloop
                  state="alert"
                  decorative
                  size="small"
                  className="drop-shadow-md"
                  sizes="36px"
                />
              </div>
            </div>

            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary/65">
                {activeStep.eyebrow}
              </p>
              <h2 className="mt-3 text-[1.55rem] font-light leading-tight tracking-tight text-on-surface">
                {activeStep.title}
              </h2>
              <p className="mt-3 max-w-[17rem] text-[13px] font-medium leading-relaxed text-on-surface-variant">
                {activeStep.description}
              </p>
            </div>

            <div className="relative z-10 mt-4 flex flex-1 items-center justify-center">
              <div className="relative flex h-[13.5rem] w-full max-w-[16.5rem] items-center justify-center">
                <div className="absolute inset-x-5 bottom-2 h-[9rem] rounded-[2.4rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.88),rgba(255,255,255,0.08))] blur-sm" />
                <button
                  type="button"
                  onClick={handleContinue}
                  className="absolute inset-0 rounded-[2rem]"
                  aria-label="Continue tutorial"
                />
                <div className="tutorial-bloop-top absolute left-1/2 top-0 -translate-x-1/2">
                  <Bloop
                    state="alert"
                    animated
                    decorative
                    size="small"
                    className="drop-shadow-[0_12px_22px_rgba(156,62,36,0.12)]"
                    sizes="36px"
                  />
                </div>
                <div className="tutorial-bloop-left absolute bottom-5 left-0">
                  <Bloop
                    state={activeStep.accentStates[0]}
                    animated
                    decorative
                    size="medium"
                    className="drop-shadow-[0_12px_22px_rgba(156,62,36,0.12)]"
                    sizes="56px"
                  />
                </div>
                <div className="tutorial-bloop-right absolute bottom-5 right-0">
                  <Bloop
                    state={activeStep.accentStates[1]}
                    animated
                    decorative
                    size="small"
                    className="drop-shadow-[0_12px_22px_rgba(156,62,36,0.12)]"
                    sizes="36px"
                  />
                </div>
                {stepIndex === 2 ? (
                  <div className="tutorial-bloop-center absolute bottom-1 left-1/2 flex -translate-x-1/2 items-end gap-3">
                    <Bloop
                      state="adolescence"
                      animated
                      decorative
                      size="small"
                      className="drop-shadow-md"
                      sizes="36px"
                    />
                    <Bloop
                      state="pregnancy"
                      animated
                      decorative
                      size={74}
                      className="drop-shadow-[0_16px_28px_rgba(156,62,36,0.16)]"
                      sizes="74px"
                    />
                    <Bloop
                      state="menopause"
                      animated
                      decorative
                      size="small"
                      className="drop-shadow-md"
                      sizes="36px"
                    />
                  </div>
                ) : (
                  <div className="tutorial-bloop-center absolute bottom-0 left-1/2 -translate-x-1/2">
                    <Bloop
                      state={activeStep.primaryState}
                      animated
                      priority={stepIndex === 0}
                      accessibilityLabel={`${activeStep.eyebrow} Bloop`}
                      size={stepIndex === 0 ? 116 : 106}
                      className="drop-shadow-[0_18px_34px_rgba(156,62,36,0.18)]"
                      sizes="116px"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 mt-auto space-y-3">
              <div className="flex items-center justify-center gap-2">
                {TUTORIAL_STEPS.map((_, index) => (
                  <button
                    type="button"
                    key={`dot-${index}`}
                    onClick={() => setStepIndex(index)}
                    aria-label={`Open tutorial step ${index + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      index === stepIndex ? "w-6 bg-primary" : "w-2 bg-primary/20"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-container text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_34px_rgba(156,62,36,0.22)] transition hover:brightness-105 active:scale-[0.985]"
              >
                {stepIndex === TUTORIAL_STEPS.length - 1
                  ? "Open Dashboard"
                  : "Continue"}
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
