"use client";

import { useState } from "react";
import { Bloop } from "@/components/common/Bloop";
import type {
  PregnancyConsultMode,
  PregnancyEnergy,
  PregnancySupportState,
} from "@/lib/use-pregnancy-support-state";

export type PregnancySheetMode = "kick" | "vitals" | "consult";

type PregnancySupportSheetProps = {
  mode: PregnancySheetMode;
  week: number;
  initialState: PregnancySupportState;
  onClose: () => void;
  onSave: (patch: Partial<PregnancySupportState>) => void;
};

const consultOptions: Array<{ id: PregnancyConsultMode; label: string }> = [
  { id: "virtual", label: "Virtual consult" },
  { id: "clinic", label: "Clinic visit" },
  { id: "midwife", label: "Midwife call" },
];

const energyOptions: Array<{ id: PregnancyEnergy; label: string }> = [
  { id: "steady", label: "Steady" },
  { id: "tired", label: "Tired" },
  { id: "restless", label: "Restless" },
  { id: "glowing", label: "Glowing" },
];

export function PregnancySupportSheet({
  mode,
  week,
  initialState,
  onClose,
  onSave,
}: PregnancySupportSheetProps) {
  const [kickCount, setKickCount] = useState(initialState.kickCount);
  const [weight, setWeight] = useState(
    initialState.currentWeight > 0 ? initialState.currentWeight : 58,
  );
  const [energy, setEnergy] = useState<PregnancyEnergy>(initialState.energy);
  const [consultMode, setConsultMode] = useState<PregnancyConsultMode>(
    initialState.consultMode,
  );

  function handleSave() {
    if (mode === "kick") {
      onSave({ kickCount });
      return;
    }

    if (mode === "vitals") {
      onSave({ currentWeight: weight, energy });
      return;
    }

    onSave({ consultMode, consultBooked: true });
  }

  return (
    <div className="absolute inset-0 z-[86] flex items-end justify-center">
      <button
        type="button"
        onClick={onClose}
        className="log-sheet-backdrop absolute inset-0 bg-[#fcf9f4]/78 backdrop-blur-[4px]"
        aria-label="Close pregnancy support sheet"
      />

      <section className="log-sheet-up relative z-10 flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[2.85rem] border border-white/80 bg-[rgba(255,255,255,0.98)] shadow-[0_-24px_70px_rgba(28,19,16,0.16)] md:max-w-[440px]">
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_22%_20%,rgba(245,222,215,0.6),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(210,230,188,0.5),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(156,62,36,0.05),transparent_26%)]" />
        </div>

        <div className="relative z-10">
          <div className="flex justify-center pt-4">
            <div className="h-1.5 w-12 rounded-full bg-outline-variant/45" />
          </div>

          <header className="flex items-center justify-between px-6 pb-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f3ef] text-primary transition hover:bg-[#f4ebe5] active:scale-95"
              aria-label="Close sheet"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/70">
                Pregnancy Support
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-on-surface">
                {getTitle(mode)}
              </h2>
            </div>
            <div className="w-11" />
          </header>

          <div className="max-h-[76dvh] overflow-y-auto px-6 pb-4 pt-1 hide-scrollbar">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="relative mb-3 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#f5ded7]/70 blur-2xl" />
                <Bloop
                  state="pregnancy"
                  animated
                  size="large"
                  accessibilityLabel="Bloop helping with pregnancy support"
                  className="question-bloop-shell relative z-10 h-[5.25rem] w-[5.25rem] object-contain drop-shadow-[0_14px_26px_rgba(156,62,36,0.18)]"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/70">
                Week {week}
              </p>
              <p className="mt-1 text-sm font-medium text-on-surface-variant/75">
                {getSubtitle(mode)}
              </p>
            </div>

            {mode === "kick" ? (
              <section className="rounded-[1.65rem] border border-primary/15 bg-[#fff7f3] p-5 shadow-[0_12px_24px_rgba(156,62,36,0.08)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                      Kick counter
                    </h4>
                    <p className="mt-1 text-[12px] font-medium text-on-surface-variant/75">
                      Tap whenever you notice movement.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary/8 text-primary">
                    <BabyKickIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mb-5 text-center">
                  <div className="text-5xl font-light tracking-tight text-primary">
                    {kickCount}
                  </div>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-outline/85">
                    Recorded kicks
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setKickCount((current) => Math.max(0, current - 1))}
                    className="rounded-full border border-outline-variant/25 bg-white py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface transition hover:bg-[#fffdfa] active:scale-[0.98]"
                  >
                    Remove one
                  </button>
                  <button
                    type="button"
                    onClick={() => setKickCount((current) => current + 1)}
                    className="rounded-full bg-primary text-white py-4 text-[11px] font-bold uppercase tracking-[0.14em] shadow-[0_12px_24px_rgba(156,62,36,0.22)] transition hover:brightness-105 active:scale-[0.98]"
                  >
                    Add kick
                  </button>
                </div>
              </section>
            ) : null}

            {mode === "vitals" ? (
              <section className="rounded-[1.65rem] border border-primary/15 bg-[#fff7f3] p-5 shadow-[0_12px_24px_rgba(156,62,36,0.08)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                      Daily vitals
                    </h4>
                    <p className="mt-1 text-[12px] font-medium text-on-surface-variant/75">
                      Update your weight and how today feels.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary/8 text-primary">
                    <WaveIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="rounded-[1.5rem] bg-white/80 p-4">
                  <div className="mb-4 text-center">
                    <div className="text-4xl font-light tracking-tight text-primary">
                      {weight.toFixed(1)}
                    </div>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-outline/85">
                      kilograms
                    </p>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="95"
                    step="0.1"
                    value={weight}
                    onChange={(event) => setWeight(Number(event.target.value))}
                    className="cycle-slider w-full"
                  />
                </div>

                <div className="mt-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/65">
                    Energy today
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {energyOptions.map((option) => {
                      const active = energy === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setEnergy(option.id)}
                          className={`rounded-[1.25rem] px-4 py-4 text-sm font-semibold transition-all duration-300 ${
                            active
                              ? "selected-glow border border-terracotta/20 bg-[#fbe4e2] text-primary"
                              : "squishy-pill border border-white bg-[#fff7f3] text-on-surface-variant hover:bg-[#fdebed]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            ) : null}

            {mode === "consult" ? (
              <section className="rounded-[1.65rem] border border-primary/15 bg-[#fff7f3] p-5 shadow-[0_12px_24px_rgba(156,62,36,0.08)]">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                      Wellness consult
                    </h4>
                    <p className="mt-1 text-[12px] font-medium text-on-surface-variant/75">
                      Choose the kind of support you want next.
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary/8 text-primary">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-3">
                  {consultOptions.map((option) => {
                    const active = consultMode === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setConsultMode(option.id)}
                        className={`flex w-full items-center justify-between rounded-full px-5 py-4 text-left transition-all duration-300 active:scale-[0.99] ${
                          active
                            ? "bg-primary/10 ring-2 ring-primary shadow-[0_14px_24px_rgba(156,62,36,0.12)]"
                            : "bg-white ring-1 ring-outline-variant/25 hover:bg-[#fffdfa]"
                        }`}
                      >
                        <span className="text-[15px] font-medium text-on-surface">
                          {option.label}
                        </span>
                        <span
                          className={`h-5 w-5 rounded-full border transition-all duration-300 ${
                            active
                              ? "border-primary bg-primary shadow-[0_0_0_4px_rgba(156,62,36,0.12)]"
                              : "border-outline-variant"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <footer className="border-t border-white/70 bg-gradient-to-t from-white via-white/96 to-white/88 px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
            <button
              type="button"
              onClick={handleSave}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.9rem] bg-[#d96c4e] py-5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_36px_rgba(217,108,78,0.28)] transition hover:brightness-105 active:scale-[0.98]"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              {getSaveLabel(mode)}
              <SparklesIcon className="relative z-10 h-5 w-5" />
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}

function getTitle(mode: PregnancySheetMode) {
  if (mode === "kick") {
    return "Kick Counter";
  }

  if (mode === "vitals") {
    return "Log Daily Vitals";
  }

  return "Book Wellness Consult";
}

function getSubtitle(mode: PregnancySheetMode) {
  if (mode === "kick") {
    return "Movement tracking should feel simple and calm.";
  }

  if (mode === "vitals") {
    return "A small daily update keeps your care view personal.";
  }

  return "Choose the kind of care support that fits your week.";
}

function getSaveLabel(mode: PregnancySheetMode) {
  if (mode === "kick") {
    return "Save kick session";
  }

  if (mode === "vitals") {
    return "Save daily vitals";
  }

  return "Confirm consult";
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
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
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
      <path d="m18 15 .8 1.9L21 18l-2.2.9L18 21l-.8-2.1L15 18l2.2-1.1L18 15Z" />
    </svg>
  );
}

function BabyKickIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3c3.8 0 7 3.13 7 7 0 5-4.1 8.43-7 10-2.9-1.57-7-5-7-10 0-3.87 3.2-7 7-7Z" />
      <path d="M10 12c1.5-1 2.5-1.1 4 0" />
    </svg>
  );
}

function WaveIcon({ className }: { className?: string }) {
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
      <path d="M2 12c.6.5 1.2 1 2.5 1S7 12.5 7.5 12 8.7 11 10 11s1.8.5 2.5 1 1.2 1 2.5 1 1.8-.5 2.5-1 1.2-1 2.5-1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1S7 18.5 7.5 18 8.7 17 10 17s1.8.5 2.5 1 1.2 1 2.5 1 1.8-.5 2.5-1 1.2-1 2.5-1" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </svg>
  );
}
