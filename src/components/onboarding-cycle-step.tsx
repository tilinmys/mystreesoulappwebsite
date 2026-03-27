"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";

const DAY_CELL_WIDTH = 52;

const focusCopy: Record<string, string> = {
  wellness: "Designed to keep your self-care rhythm calm and supportive.",
  tracking: "Built to turn your daily tracking into clear visual patterns.",
  mindset: "Balanced to help you notice mood and mental clarity shifts.",
  vitality: "Shaped around energy, recovery, and how your body moves.",
};

export function OnboardingCycleStep() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const { formState, updateFormState } = useOnboardingFormState();
  const [draftCycleLength, setDraftCycleLength] = useState(formState.cycleLength);
  const [draftFlowDuration, setDraftFlowDuration] = useState(formState.flowDuration);

  const today = new Date();
  const todayValue = toDateInputValue(today);
  const selectedDateValue = formState.lastCycleDate || todayValue;
  const selectedDate = parseDateValue(selectedDateValue);
  const cycleLength = draftCycleLength;
  const flowDuration = draftFlowDuration;
  const daysSinceCycleStart = Math.max(0, differenceInDays(today, selectedDate));
  const cycleDay = (daysSinceCycleStart % cycleLength) + 1;
  const cycleProgress = cycleDay / cycleLength;
  const progressDegrees = Math.max(12, cycleProgress * 360);
  const markerAngle = progressDegrees - 90;
  const nextCycleStart = getNextCycleStart(selectedDate, cycleLength, today);
  const calendarDays = getMonthDays(selectedDate);
  const selectedIndex = selectedDate.getDate() - 1;
  const focusDescription =
    focusCopy[formState.focus] ??
    "This starter map adapts as soon as you begin tracking with Bloop.";
  const phaseLabel = getPhaseLabel(cycleDay, cycleLength, flowDuration);
  const canContinue = selectedDateValue.length > 0;
  const cycleLengthLabel = useMemo(() => `${cycleLength}\u00A0days`, [cycleLength]);
  const flowDurationLabel = useMemo(
    () => `${flowDuration}\u00A0days`,
    [flowDuration],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function handleContinue() {
    if (!canContinue) {
      return;
    }

    startTransition(() => {
      router.push("/onboarding/goals");
    });
  }

  function handleCycleLengthChange(value: number) {
    setDraftCycleLength(value);
    updateFormState({ cycleLength: value });
    if (process.env.NODE_ENV !== "production") {
      console.info("[onboarding-step-2] cycle length updated", { value });
    }
  }

  function handleFlowDurationChange(value: number) {
    setDraftFlowDuration(value);
    updateFormState({ flowDuration: value });
    if (process.env.NODE_ENV !== "production") {
      console.info("[onboarding-step-2] flow duration updated", { value });
    }
  }

  return (
    <PhonePreviewShell>
      <section className="relative grid h-[100dvh] w-full grid-rows-[auto_1fr_auto] overflow-hidden bg-background md:h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#f4ddd6]/60 blur-[90px]" />
          <div className="absolute bottom-0 left-1/2 h-[45%] w-full -translate-x-1/2 bg-gradient-to-t from-surface to-transparent" />
          <div className="absolute right-[-18%] top-[30%] h-72 w-72 rounded-full bg-[#f5ded7]/60 blur-[105px]" />

          <div
            className={`absolute -right-16 top-10 w-48 transition-opacity duration-1000 ${
              isLoaded ? "garden-blast-tr" : "opacity-0"
            }`}
          >
            <Image
              src="/images/onboarding-cycle-leaf.webp"
              alt=""
              width={288}
              height={288}
              priority
              className="float-slow h-auto w-full object-contain opacity-25"
            />
          </div>
          <div
            className={`absolute -left-20 top-52 w-56 transition-opacity duration-1000 ${
              isLoaded ? "garden-blast-bl" : "opacity-0"
            }`}
          >
            <Image
              src="/images/onboarding-cycle-petals.webp"
              alt=""
              width={320}
              height={320}
              className="sway-slow h-auto w-full object-contain opacity-18"
            />
          </div>
          <div
            className={`absolute -bottom-4 right-[-4.5rem] w-36 transition-opacity duration-1000 ${
              isLoaded ? "garden-blast-br" : "opacity-0"
            }`}
          >
            <GardenFlower className="drift-slow text-[#d96c4e]/40 opacity-20" />
          </div>
        </div>

        <header className="relative z-20 flex items-center justify-between px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <Link
            href="/onboarding"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Back to onboarding details"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tracking-[0.05em] text-primary">
              MyStree Soul
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-outline/80">
              Step 2 of 4
            </span>
          </div>
          <div className="w-10" />
        </header>

        <main className="relative z-20 min-h-0 overflow-y-auto px-6 pb-5">
          <section
            className={`mx-auto flex w-full max-w-lg flex-col pb-3 ${
              isLoaded ? "cycle-enter" : "opacity-0"
            }`}
          >
            <div className="mb-7 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-primary-fixed/80 bg-white/75 shadow-[0_18px_40px_rgba(156,62,36,0.12)]">
                <Bloop
                  state="guide"
                  animated
                  width={64}
                  priority
                  accessibilityLabel="Bloop guiding the cycle setup"
                  className="h-auto w-auto object-contain"
                />
              </div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/80">
                Continuing your setup
              </p>
              <h1 className="px-3 text-[2rem] font-extrabold tracking-tight text-on-surface">
                Let&apos;s map your
                <span className="ml-2 italic text-primary">cycle.</span>
              </h1>
              <p className="mx-auto mt-3 max-w-[19rem] text-[13px] leading-relaxed text-on-surface-variant">
                {formState.name ? `${formState.name}, ` : ""}
                {focusDescription}
              </p>
            </div>

            <div
              className="cycle-card-rise mb-4 rounded-[2rem] bg-white/55 p-4 shadow-[0_18px_40px_rgba(156,62,36,0.08)] ring-1 ring-white/70 backdrop-blur-xl"
              style={{ animationDelay: "70ms" }}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-outline/90">
                    Cycle snapshot
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-on-surface">
                    Day {cycleDay} of {cycleLength}
                  </h2>
                </div>
                <div className="rounded-full bg-primary-fixed/45 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  {phaseLabel}
                </div>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_116px] items-center gap-4">
                <div className="min-w-0">
                  <div className="relative overflow-hidden rounded-[1.6rem] bg-[#fcfaf8]/95 px-4 py-4 shadow-inner">
                    <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-outline/85">
                      <span>{formatMonthYear(selectedDate)}</span>
                      <span>Start date moves this rail</span>
                    </div>
                    <div className="relative overflow-hidden rounded-[1.35rem] bg-[#f7f1ec] px-2 py-2">
                      <div className="pointer-events-none absolute inset-y-2 left-1/2 z-10 w-[52px] -translate-x-1/2 rounded-[1rem] border border-primary/20 bg-white/85 shadow-[0_10px_24px_rgba(156,62,36,0.08)]" />
                      <div
                        className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{
                          transform: `translateX(calc(50% - ${(selectedIndex + 0.5) * DAY_CELL_WIDTH}px))`,
                        }}
                      >
                        {calendarDays.map((day) => {
                          const active = isSameDate(day, selectedDate);

                          return (
                            <div
                              key={toDateInputValue(day)}
                              className="flex w-[52px] shrink-0 flex-col items-center justify-center py-2 text-center"
                            >
                              <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-outline/80">
                                {formatWeekday(day)}
                              </span>
                              <span
                                className={`mt-1 text-lg font-bold transition-colors ${
                                  active ? "text-primary" : "text-on-surface/70"
                                }`}
                              >
                                {day.getDate()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative mx-auto flex h-[116px] w-[116px] items-center justify-center">
                  <div
                    className="cycle-ring absolute inset-0 rounded-full opacity-90"
                    style={{
                      background: `conic-gradient(from -90deg, #9c3e24 0deg ${progressDegrees}deg, rgba(244, 221, 214, 0.95) ${progressDegrees}deg 360deg)`,
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ transform: `rotate(${markerAngle}deg)` }}
                  >
                    <div className="cycle-marker absolute left-1/2 top-[2px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-primary shadow-[0_8px_16px_rgba(156,62,36,0.35)]" />
                  </div>
                  <div className="absolute inset-[18px] rounded-full bg-white/85 shadow-[0_14px_32px_rgba(156,62,36,0.12)] backdrop-blur-md" />
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-primary">
                      {cycleLength}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">
                      day cycle
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[1.4rem] bg-[#fcfaf8]/85 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-outline/80">
                    Last start
                  </p>
                  <p className="mt-1 text-sm font-bold text-on-surface">
                    {formatLongDate(selectedDate)}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fcfaf8]/85 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-outline/80">
                    Next estimate
                  </p>
                  <p className="mt-1 text-sm font-bold text-on-surface">
                    {formatLongDate(nextCycleStart)}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="cycle-card-rise mb-4 space-y-4 rounded-[2rem] bg-white/55 p-5 shadow-[0_18px_40px_rgba(156,62,36,0.07)] ring-1 ring-white/70 backdrop-blur-xl"
              style={{ animationDelay: "150ms" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-on-surface">
                    Cycle anchor date
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Adjust it anytime and the calendar rail updates instantly.
                  </p>
                </div>
              </div>
              <div className="rounded-[1.35rem] bg-[#fcfaf8]/95 px-4 py-3 ring-1 ring-outline-variant/15">
                <input
                  type="date"
                  max={todayValue}
                  value={selectedDateValue}
                  onChange={(event) => {
                    updateFormState({ lastCycleDate: event.target.value });
                    if (process.env.NODE_ENV !== "production") {
                      console.info("[onboarding-step-2] cycle anchor updated", {
                        value: event.target.value,
                      });
                    }
                  }}
                  className="w-full bg-transparent text-sm font-semibold text-on-surface outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div
                className="cycle-card-rise rounded-[2rem] bg-white/55 p-5 shadow-[0_18px_40px_rgba(156,62,36,0.07)] ring-1 ring-white/70 backdrop-blur-xl"
                style={{ animationDelay: "230ms" }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary">
                      <SyncIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-wide text-on-surface">
                        Cycle length
                      </h3>
                      <p className="text-[11px] text-on-surface-variant">
                        From the first day of one period to the first day of the next
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-primary">
                    {cycleLengthLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min="21"
                  max="45"
                  value={cycleLength}
                  onChange={(event) =>
                    handleCycleLengthChange(Number(event.target.value))
                  }
                  className="cycle-slider w-full"
                />
              </div>

              <div
                className="cycle-card-rise rounded-[2rem] bg-white/55 p-5 shadow-[0_18px_40px_rgba(156,62,36,0.07)] ring-1 ring-white/70 backdrop-blur-xl"
                style={{ animationDelay: "310ms" }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary">
                      <DropletIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-wide text-on-surface">
                        Flow duration
                      </h3>
                      <p className="text-[11px] text-on-surface-variant">
                        Average number of days you usually bleed
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-extrabold text-primary">
                    {flowDurationLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={flowDuration}
                  onChange={(event) =>
                    handleFlowDurationChange(Number(event.target.value))
                  }
                  className="cycle-slider w-full"
                />
              </div>

              <div
                className="cycle-card-rise flex items-start gap-3 rounded-[1.6rem] bg-primary-fixed/25 p-4"
                style={{ animationDelay: "390ms" }}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm">
                  <BulbIcon className="h-4 w-4" />
                </div>
                <p className="text-[11px] leading-relaxed text-on-surface-variant">
                  Most cycles fall between 25 and 35 days. This is your starter
                  estimate, and Bloop will refine it as you track over time.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer-lift relative z-30 bg-gradient-to-t from-background via-background/95 to-transparent px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/onboarding"
              className="inline-flex h-14 flex-1 items-center justify-center rounded-full bg-surface-container-low/85 px-6 text-[12px] font-bold uppercase tracking-[0.18em] text-on-surface shadow-sm backdrop-blur-md transition hover:brightness-105 active:scale-95"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!canContinue}
              className="tactile-pill inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full px-6 text-[12px] font-bold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex justify-center gap-2 opacity-85">
            <div className="h-1 w-4 rounded-full bg-outline-variant/50" />
            <div className="h-1 w-12 rounded-full bg-primary shadow-[0_0_8px_rgba(156,62,36,0.5)]" />
            <div className="h-1 w-4 rounded-full bg-outline-variant/50" />
            <div className="h-1 w-4 rounded-full bg-outline-variant/50" />
          </div>
        </footer>
      </section>
    </PhonePreviewShell>
  );
}

function parseDateValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function toDateInputValue(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function differenceInDays(later: Date, earlier: Date): number {
  const laterDay = new Date(
    later.getFullYear(),
    later.getMonth(),
    later.getDate(),
    12,
  );
  const earlierDay = new Date(
    earlier.getFullYear(),
    earlier.getMonth(),
    earlier.getDate(),
    12,
  );
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((laterDay.getTime() - earlierDay.getTime()) / millisecondsPerDay);
}

function getNextCycleStart(
  startDate: Date,
  cycleLength: number,
  today: Date,
): Date {
  let next = new Date(startDate);

  while (next <= today) {
    next = addDays(next, cycleLength);
  }

  return next;
}

function getMonthDays(date: Date): Date[] {
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    return new Date(date.getFullYear(), date.getMonth(), index + 1, 12);
  });
}

function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatWeekday(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(date);
}

function isSameDate(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getPhaseLabel(
  cycleDay: number,
  cycleLength: number,
  flowDuration: number,
): string {
  if (cycleDay <= flowDuration) {
    return "Flow phase";
  }

  if (cycleDay <= Math.max(flowDuration + 5, cycleLength / 2)) {
    return "Reset phase";
  }

  if (cycleDay <= Math.max(cycleLength - 7, flowDuration + 6)) {
    return "Rise phase";
  }

  return "Grounding";
}

type IconProps = {
  className?: string;
};

function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
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

function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function SyncIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 15.3-6.4" />
      <path d="M21 4v6h-6" />
      <path d="M21 12a9 9 0 0 1-15.3 6.4" />
      <path d="M3 20v-6h6" />
    </svg>
  );
}

function DropletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.8C9.7 6.6 6 10.5 6 14a6 6 0 0 0 12 0c0-3.5-3.7-7.4-6-11.2Z" />
      <path d="M9.5 14.5c0 1.7 1 3.1 2.5 3.8" />
    </svg>
  );
}

function BulbIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 4a5 5 0 0 0-5 5c0 2 1.2 3.4 2.2 4.3.7.7 1.3 1.4 1.3 2.4h3c0-1 .6-1.7 1.3-2.4C15.8 12.4 17 11 17 9a5 5 0 0 0-5-5Z" />
      <path d="M10 19h4" />
      <path d="M10.6 22h2.8" />
    </svg>
  );
}

function GardenFlower({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M50 0C60 20 100 30 100 50C100 70 60 80 50 100C40 80 0 70 0 50C0 30 40 20 50 0Z" opacity="0.6" />
      <path d="M0 50C20 40 30 0 50 0C70 0 80 40 100 50C80 60 70 100 50 100C30 100 20 60 0 50Z" opacity="0.8" />
      <circle cx="50" cy="50" r="10" fill="white" opacity="0.4" />
    </svg>
  );
}
