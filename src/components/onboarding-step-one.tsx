"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";

const focusOptions = [
  {
    id: "wellness",
    label: "Wellness",
    description: "Period wellness and symptom relief",
    Icon: FlowerFocusIcon,
  },
  {
    id: "tracking",
    label: "Tracking",
    description: "Period tracking and cycle predictions",
    Icon: ChartFocusIcon,
  },
  {
    id: "mindset",
    label: "Mindset",
    description: "Mood, PMS and emotional wellness",
    Icon: MindFocusIcon,
  },
  {
    id: "vitality",
    label: "Vitality",
    description: "Energy levels and PMS tracking",
    Icon: SparkFocusIcon,
  },
];

type DateDraft = {
  day: string;
  month: string;
  year: string;
};

export function OnboardingStepOne() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [dateDraft, setDateDraft] = useState<DateDraft>(() =>
    getDateDraftFromValue(readInitialDateValue()),
  );
  const [dateError, setDateError] = useState<string | null>(null);
  const { formState, updateFormState } = useOnboardingFormState();

  const today = new Date();
  const todayValue = toDateInputValue(today);
  const canContinue =
    formState.name.trim().length > 1 &&
    formState.focus.length > 0;

  useEffect(() => {
    // If onboarding is already completed (name and supportArea exist), 
    // skip directly to the dashboard to avoid repetitive flows.
    if (formState.name && formState.supportArea) {
      logOnboardingDebug("Onboarding already complete, routing to dashboard");
      router.replace("/dashboard");
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [formState.name, formState.supportArea, router]);

  function handleNext() {
    if (!canContinue) {
      logOnboardingDebug("Blocked next on step 1", {
        hasName: formState.name.trim().length > 1,
        hasFocus: formState.focus.length > 0,
        hasLastCycleDate: Boolean(formState.lastCycleDate),
      });
      return;
    }

    logOnboardingDebug("Proceeding from step 1", {
      focus: formState.focus,
      lastCycleDate: formState.lastCycleDate || "skipped",
    });
    startTransition(() => {
      router.push("/onboarding/cycle");
    });
  }

  function handleDatePartChange(part: keyof DateDraft, value: string) {
    const sanitized = value.replace(/\D/g, "").slice(0, part === "year" ? 4 : 2);
    const nextDraft = {
      ...dateDraft,
      [part]: sanitized,
    };

    setDateDraft(nextDraft);
    setDateError(null);

    if (!nextDraft.day && !nextDraft.month && !nextDraft.year) {
      updateFormState({ lastCycleDate: "" });
      logOnboardingDebug("Last cycle date cleared");
      return;
    }

    if (
      nextDraft.day.length === 2 &&
      nextDraft.month.length === 2 &&
      nextDraft.year.length === 4
    ) {
      const resolved = resolveDateDraft(nextDraft, today);
      if (!resolved) {
        setDateError("Enter a real past or current date.");
        console.error("[onboarding] Invalid last cycle date draft", nextDraft);
        return;
      }

      updateFormState({ lastCycleDate: resolved });
      logOnboardingDebug("Last cycle date updated", { lastCycleDate: resolved });
      return;
    }

    updateFormState({ lastCycleDate: "" });
  }

  function handleUseToday() {
    setDateError(null);
    setDateDraft(getDateDraftFromValue(todayValue));
    updateFormState({ lastCycleDate: todayValue });
    logOnboardingDebug("Last cycle date set to today", { lastCycleDate: todayValue });
  }

  return (
    <PhonePreviewShell>
      <section className="relative grid h-[100dvh] w-full grid-rows-[auto_1fr_auto] overflow-hidden bg-background text-on-surface md:h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-20 -top-24 h-96 w-96 rounded-full bg-[#f4ddd6] opacity-30 blur-3xl" />
          <div className="absolute -right-32 top-1/2 h-[500px] w-[500px] rounded-full bg-[#f5ded7] opacity-40 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 h-1/2 w-full -translate-x-1/2 bg-gradient-to-t from-surface to-transparent" />
        </div>

        <div
          className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`absolute -left-12 top-4 w-40 text-[#dea5a4]/40 ${
              isLoaded ? "garden-blast-tl" : ""
            }`}
          >
            <GardenFlower />
          </div>
          <div
            className={`absolute -right-16 top-24 w-48 text-[#d96c4e]/30 ${
              isLoaded ? "garden-blast-tr" : ""
            }`}
          >
            <GardenFlower />
          </div>
          <div
            className={`absolute -left-16 bottom-32 w-56 text-[#bc563a]/25 ${
              isLoaded ? "garden-blast-bl" : ""
            }`}
          >
            <GardenFlower />
          </div>
          <div
            className={`absolute -right-8 bottom-48 w-44 text-[#e0b0af]/35 ${
              isLoaded ? "garden-blast-br" : ""
            }`}
          >
            <GardenFlower />
          </div>
          <div className="float-slow absolute left-4 top-1/3 w-12 text-[#9caf88]/40">
            <SageLeafSingle />
          </div>
          <div className="sway-slow absolute bottom-1/4 right-10 w-16 text-[#bc563a]/30">
            <TerracottaPetalSingle />
          </div>
        </div>

        <header className="relative z-20 flex items-center justify-between px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <Link
            href="/privacy"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Back to privacy"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold tracking-[0.05em] text-primary">
              MyStree Soul
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-outline/80">
              Step 1 of 4
            </span>
          </div>
          <div className="w-10" />
        </header>

        <main className="relative z-20 flex min-h-0 flex-col overflow-y-auto px-8 pb-6">
          <section className="welcome-visible mx-auto flex w-full max-w-lg flex-1 flex-col items-center text-center">
            <div className="mb-10">
              <div className="relative mx-auto mb-5 h-24 w-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" />
                <Bloop
                  state="guide"
                  animated
                  width={88}
                  priority
                  accessibilityLabel="Bloop guide"
                  className="relative z-10 h-auto w-auto object-contain drop-shadow-xl"
                />
              </div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-primary">
                Guided by Bloop
              </p>
              <h1 className="text-3xl font-light leading-tight tracking-[0.04em] text-on-surface">
                Welcome to your
                <br />
                <span className="font-extrabold italic text-primary">
                  cycle companion
                </span>
              </h1>
              <p className="mt-5 max-w-[18rem] text-sm font-light leading-relaxed text-on-surface-variant">
                Bloop will help you start with the basics first, so your period
                tracking feels useful from day one.
              </p>
            </div>

            <div className="w-full space-y-7 text-left">
              <div className="group relative">
                <label className="absolute -top-3 left-4 z-20 bg-background px-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Full name
                </label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) =>
                    updateFormState({ name: event.target.value })
                  }
                  className="h-16 w-full rounded-full border-none bg-white/55 px-6 text-on-surface outline-none ring-1 ring-outline-variant/30 transition-all duration-300 placeholder:text-on-surface-variant/40 focus:bg-white/80 focus:ring-primary"
                  placeholder="Your name"
                />
              </div>

              <div className="group relative">
                <label className="absolute -top-3 left-4 z-20 bg-background px-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Last cycle start
                </label>
                <div className="relative z-30 rounded-[1.8rem] bg-white/70 px-4 py-4 ring-1 ring-outline-variant/30 backdrop-blur-sm">
                  <div className="grid grid-cols-[1fr_1fr_1.35fr] gap-3">
                    <DatePartField
                      label="Day"
                      value={dateDraft.day}
                      placeholder="DD"
                      onChange={(value) => handleDatePartChange("day", value)}
                    />
                    <DatePartField
                      label="Month"
                      value={dateDraft.month}
                      placeholder="MM"
                      onChange={(value) => handleDatePartChange("month", value)}
                    />
                    <DatePartField
                      label="Year"
                      value={dateDraft.year}
                      placeholder="YYYY"
                      onChange={(value) => handleDatePartChange("year", value)}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleUseToday}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-primary/8 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-primary transition hover:bg-primary/12 active:scale-95"
                    >
                      Use today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDateError(null);
                        setDateDraft(getDateDraftFromValue(""));
                        updateFormState({ lastCycleDate: "" });
                        logOnboardingDebug("User skipped last cycle date");
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-full px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant transition hover:text-primary"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
                <p className="mt-3 px-4 text-[11px] font-medium leading-relaxed text-on-surface-variant">
                  We&apos;ll use this to estimate your next period and build your cycle timeline.
                </p>
                {dateError ? (
                  <p className="mt-2 px-4 text-[11px] font-semibold text-[#b84a37]">
                    {dateError}
                  </p>
                ) : null}
              </div>

              <div className="space-y-4 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  I&apos;m here to focus on...
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {focusOptions.map(({ id, label, description, Icon }) => {
                    const active = formState.focus === id;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => updateFormState({ focus: id })}
                        className={`group rounded-[1.8rem] p-4 text-left backdrop-blur-md transition-all duration-300 active:scale-95 ${
                          active
                            ? "scale-[1.02] bg-primary/10 ring-2 ring-primary shadow-[0_14px_26px_rgba(156,62,36,0.14)]"
                            : "bg-white/50 ring-1 ring-outline-variant/25 hover:ring-primary/40"
                        }`}
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                          {active ? (
                            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                              On
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm font-semibold text-on-surface">
                          {label}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
                          {description}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {formState.focus ? (
                  <p className="px-1 text-[11px] font-semibold text-primary">
                    Selected:{" "}
                    {
                      focusOptions.find((option) => option.id === formState.focus)
                        ?.label
                    }
                  </p>
                ) : (
                  <p className="px-1 text-[11px] font-medium text-on-surface-variant">
                    Pick one focus to personalize your period experience.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-9 w-full rounded-[1.6rem] bg-[#f5ded7]/45 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Private period data
                  </p>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-on-surface-variant">
                    Your cycle data stays private, encrypted, and never sold.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="footer-lift relative z-30 bg-gradient-to-t from-background via-background/95 to-transparent px-8 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/privacy"
              className="inline-flex h-14 flex-1 items-center justify-center rounded-full bg-surface-container-low/85 px-6 text-[12px] font-bold uppercase tracking-[0.2em] text-on-surface shadow-sm backdrop-blur-md transition hover:brightness-105 active:scale-95"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              className="inline-flex h-14 flex-1 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-container px-6 text-[12px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_18px_40px_rgba(156,62,36,0.3)] transition-all duration-300 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex justify-center gap-2 opacity-95">
            <div className="h-1.5 w-14 rounded-full bg-primary shadow-[0_0_8px_rgba(156,62,36,0.5)]" />
            <div className="h-1.5 w-5 rounded-full bg-outline-variant/50" />
            <div className="h-1.5 w-5 rounded-full bg-outline-variant/50" />
            <div className="h-1.5 w-5 rounded-full bg-outline-variant/50" />
          </div>
        </footer>
      </section>
    </PhonePreviewShell>
  );
}

function DatePartField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/70">
        {label}
      </span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={placeholder === "YYYY" ? 4 : 2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-[1.2rem] border-none bg-white/90 px-4 text-center text-[15px] font-semibold text-on-surface outline-none ring-1 ring-outline-variant/30 transition-all duration-300 placeholder:text-on-surface-variant/35 focus:bg-white focus:ring-primary"
      />
    </label>
  );
}

function getDateDraftFromValue(value: string): DateDraft {
  if (!value) {
    return { day: "", month: "", year: "" };
  }

  const [year, month, day] = value.split("-");
  return {
    day: day ?? "",
    month: month ?? "",
    year: year ?? "",
  };
}

function resolveDateDraft(draft: DateDraft, today: Date) {
  const day = Number(draft.day);
  const month = Number(draft.month);
  const year = Number(draft.year);

  if (
    Number.isNaN(day) ||
    Number.isNaN(month) ||
    Number.isNaN(year) ||
    year < 1900 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const candidate = new Date(year, month - 1, day, 12);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day ||
    candidate > today
  ) {
    return null;
  }

  return toDateInputValue(candidate);
}

function toDateInputValue(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function readInitialDateValue() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const raw = window.localStorage.getItem("mystree-onboarding-state");
    if (!raw) {
      return "";
    }

    const parsed = JSON.parse(raw) as { lastCycleDate?: string };
    return parsed.lastCycleDate ?? "";
  } catch {
    return "";
  }
}

function logOnboardingDebug(message: string, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (context) {
    console.info(`[onboarding-step-one] ${message}`, context);
    return;
  }

  console.info(`[onboarding-step-one] ${message}`);
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

function ShieldIcon({ className }: IconProps) {
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
      <path d="M12 3c2.7 2.1 5.6 3.1 8 3.4v5.1c0 5.3-3.4 8.5-8 9.5-4.6-1-8-4.2-8-9.5V6.4C6.4 6.1 9.3 5.1 12 3Z" />
      <path d="m9.4 12.3 1.7 1.7 3.6-3.8" />
    </svg>
  );
}

function FlowerFocusIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3c.9 2 2.7 3.2 4.7 3.2 1.2 0 2.3.6 2.3 1.8 0 1.5-1.4 2.5-3.1 2.5 1.8.2 3.1 1.3 3.1 2.8 0 1.2-1.1 1.7-2.3 1.7-2 0-3.8 1.2-4.7 3.2-.9-2-2.7-3.2-4.7-3.2-1.2 0-2.3-.5-2.3-1.7 0-1.5 1.3-2.6 3.1-2.8-1.7 0-3.1-1-3.1-2.5 0-1.2 1.1-1.8 2.3-1.8C9.3 6.2 11.1 5 12 3Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="1.8" fill="white" />
    </svg>
  );
}

function ChartFocusIcon({ className }: IconProps) {
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
      <path d="M4 19h16" />
      <path d="M7 16V9" />
      <path d="M12 16V5" />
      <path d="M17 16v-4" />
    </svg>
  );
}

function MindFocusIcon({ className }: IconProps) {
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

function SparkFocusIcon({ className }: IconProps) {
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
      <path d="m12 2 2.2 6.1L20 10l-5.8 2L12 18l-2.2-6L4 10l5.8-1.9L12 2Z" />
    </svg>
  );
}

function GardenFlower() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className="bloom-slow"
      aria-hidden="true"
    >
      <path d="M50 0C60 20 100 30 100 50C100 70 60 80 50 100C40 80 0 70 0 50C0 30 40 20 50 0Z" opacity="0.6" />
      <path d="M0 50C20 40 30 0 50 0C70 0 80 40 100 50C80 60 70 100 50 100C30 100 20 60 0 50Z" opacity="0.8" />
      <circle cx="50" cy="50" r="10" fill="white" opacity="0.4" />
    </svg>
  );
}

function SageLeafSingle() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 100C30 100 50 70 50 50C50 30 70 0 100 0C70 20 50 50 50 70C50 90 30 100 0 100Z" opacity="0.8" />
    </svg>
  );
}

function TerracottaPetalSingle() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 10C65 30 90 40 90 60C90 80 65 90 50 100C35 90 10 80 10 60C10 40 35 30 50 10Z" opacity="0.7" />
    </svg>
  );
}
