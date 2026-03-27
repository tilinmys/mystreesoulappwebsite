"use client";

import { useState } from "react";
import { Bloop } from "@/components/common/Bloop";
import type {
  FertilityFluid,
  FertilityLhResult,
  FertilityLogDraft,
} from "@/lib/use-fertility-log-state";

type FertilitySheetFocus = "lh" | "bbt" | "fluid" | "intimacy";

type FertilityLogSheetProps = {
  initialDraft: FertilityLogDraft;
  initialFocus?: FertilitySheetFocus;
  onClose: () => void;
  onSave: (draft: FertilityLogDraft) => void;
};

const lhOptions: Array<{ id: FertilityLhResult; label: string }> = [
  { id: "negative", label: "Negative" },
  { id: "positive", label: "Positive" },
  { id: "peak", label: "Peak" },
];

const fluidOptions: Array<{ id: FertilityFluid; label: string }> = [
  { id: "dry", label: "Dry" },
  { id: "creamy", label: "Creamy" },
  { id: "watery", label: "Watery" },
  { id: "egg_white", label: "Egg white" },
];

export function FertilityLogSheet({
  initialDraft,
  initialFocus,
  onClose,
  onSave,
}: FertilityLogSheetProps) {
  const [draft, setDraft] = useState(initialDraft);

  return (
    <div className="absolute inset-0 z-[86] flex items-end justify-center">
      <button
        type="button"
        onClick={onClose}
        className="log-sheet-backdrop absolute inset-0 bg-[#fcf9f4]/78 backdrop-blur-[4px]"
        aria-label="Close fertility log"
      />

      <section className="log-sheet-up relative z-10 flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[2.85rem] border border-white/80 bg-[rgba(255,255,255,0.98)] shadow-[0_-24px_70px_rgba(28,19,16,0.16)] md:max-w-[440px]">
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_22%_20%,rgba(210,230,188,0.48),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(250,218,221,0.5),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(156,62,36,0.05),transparent_26%)]" />
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
                Fertility Companion
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-on-surface">
                Log fertility data
              </h2>
            </div>
            <div className="w-11" />
          </header>

          <div className="max-h-[76dvh] overflow-y-auto px-6 pb-4 pt-1 hide-scrollbar">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="relative mb-3 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#d5e9bf]/55 blur-2xl" />
                <Bloop
                  state="encourage"
                  animated
                  size="large"
                  accessibilityLabel="Bloop ready to help log fertility data"
                  className="question-bloop-shell relative z-10 h-[5.25rem] w-[5.25rem] object-contain drop-shadow-[0_14px_26px_rgba(156,62,36,0.18)]"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/70">
                Daily fertility log
              </p>
              <p className="mt-1 text-sm font-medium text-on-surface-variant/75">
                A few signals can sharpen your fertile timing.
              </p>
            </div>

            <section className={getSectionClass(initialFocus === "lh")}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                    LH result
                  </h4>
                  <p className="mt-1 text-[12px] font-medium text-on-surface-variant/75">
                    Record your ovulation strip result.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary/8 text-primary">
                  <PulseIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white bg-[#fff2f3] p-1.5 shadow-inner">
                <div className="grid grid-cols-3 gap-1">
                  {lhOptions.map((option) => {
                    const active = draft.lhResult === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            lhResult: option.id,
                          }))
                        }
                        className={`rounded-[1.2rem] px-2 py-3 text-[11px] font-bold transition-all duration-300 ${
                          active
                            ? "squishy-pill bg-[#d96c4e] text-white shadow-[0_12px_24px_rgba(217,108,78,0.24)]"
                            : "text-on-surface-variant hover:bg-white/70"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className={getSectionClass(initialFocus === "bbt")}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                    Basal temp
                  </h4>
                  <p className="mt-1 text-[12px] font-medium text-on-surface-variant/75">
                    Capture your morning temperature.
                  </p>
                </div>
                <p className="text-lg font-semibold text-secondary">
                  {draft.basalTemp.toFixed(1)}&deg;F
                </p>
              </div>
              <input
                type="range"
                min="96.5"
                max="99.5"
                step="0.1"
                value={draft.basalTemp}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    basalTemp: Number(event.target.value),
                  }))
                }
                className="cycle-slider w-full"
              />
              <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/50">
                <span>96.5</span>
                <span>99.5</span>
              </div>
            </section>

            <section className={getSectionClass(initialFocus === "fluid")}>
              <div className="mb-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                  Cervical fluid
                </h4>
                <p className="mt-1 text-[12px] font-medium text-on-surface-variant/75">
                  Pick the closest body cue for today.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {fluidOptions.map((option) => {
                  const active = draft.cervicalFluid === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          cervicalFluid: option.id,
                        }))
                      }
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
            </section>

            <section className={getSectionClass(initialFocus === "intimacy")}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                    Sexual activity
                  </h4>
                  <p className="mt-1 text-[12px] font-medium text-on-surface-variant/75">
                    Did you try today?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      intercourse: !current.intercourse,
                    }))
                  }
                  className={`inline-flex h-10 min-w-[5.8rem] items-center justify-center rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                    draft.intercourse
                      ? "bg-primary text-white shadow-[0_10px_24px_rgba(156,62,36,0.24)]"
                      : "border border-outline-variant/20 bg-white text-on-surface-variant"
                  }`}
                >
                  {draft.intercourse ? "Logged" : "Not yet"}
                </button>
              </div>
            </section>
          </div>

          <footer className="border-t border-white/70 bg-gradient-to-t from-white via-white/96 to-white/88 px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
            <button
              type="button"
              onClick={() => onSave(draft)}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.9rem] bg-[#d96c4e] py-5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_36px_rgba(217,108,78,0.28)] transition hover:brightness-105 active:scale-[0.98]"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              Save fertility log
              <SparklesIcon className="relative z-10 h-5 w-5" />
            </button>
          </footer>
        </div>
      </section>
    </div>
  );
}

function getSectionClass(highlighted: boolean) {
  return `mb-5 rounded-[1.65rem] border p-4 transition ${
    highlighted
      ? "border-primary/20 bg-[#fff7f3] shadow-[0_12px_24px_rgba(156,62,36,0.08)]"
      : "border-white/70 bg-white/72"
  }`;
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

function PulseIcon({ className }: { className?: string }) {
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
      <path d="M3 12h4l2.5-6 4.5 12 2.5-6H21" />
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
