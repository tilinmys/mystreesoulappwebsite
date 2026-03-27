"use client";

import { useState } from "react";
import { Bloop } from "@/components/common/Bloop";
import type {
  DailyEntryDraft,
  DailyEntryFlow,
  DailyEntryMood,
  DailyEntrySymptom,
} from "@/lib/use-daily-entry-state";

const moodOptions: Array<{
  id: DailyEntryMood;
  label: string;
  emoji: string;
}> = [
  { id: "radiant", label: "Radiant", emoji: "Sun" },
  { id: "calm", label: "Calm", emoji: "Leaf" },
  { id: "focus", label: "Focus", emoji: "Spark" },
  { id: "soft", label: "Soft", emoji: "Cloud" },
  { id: "tender", label: "Tender", emoji: "Bloom" },
];

const flowOptions: Array<{
  id: DailyEntryFlow;
  label: string;
}> = [
  { id: "none", label: "None" },
  { id: "light", label: "Light" },
  { id: "medium", label: "Medium" },
  { id: "heavy", label: "Heavy" },
];

const symptomOptions: Array<{
  id: DailyEntrySymptom;
  label: string;
}> = [
  { id: "cramps", label: "Cramps" },
  { id: "bloating", label: "Bloating" },
  { id: "migraine", label: "Headache / Migraine" },
  { id: "fatigue", label: "Fatigue" },
  { id: "back_pain", label: "Back pain" },
];

type DailyEntrySheetProps = {
  initialDraft: DailyEntryDraft;
  onClose: () => void;
  onSave: (draft: DailyEntryDraft) => void;
  onDismissForToday?: () => void;
  hasExistingEntry?: boolean;
};

export function DailyEntrySheet({
  initialDraft,
  onClose,
  onSave,
  onDismissForToday,
  hasExistingEntry = false,
}: DailyEntrySheetProps) {
  const [selectedMood, setSelectedMood] = useState<DailyEntryMood | null>(
    hasExistingEntry ? initialDraft.mood : null,
  );
  const [selectedFlow, setSelectedFlow] = useState<DailyEntryFlow | null>(
    hasExistingEntry ? initialDraft.flow : null,
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<DailyEntrySymptom[]>(
    initialDraft.symptoms,
  );
  const [painLevel, setPainLevel] = useState(initialDraft.painLevel);
  const [isSaving, setIsSaving] = useState(false);
  const [formNotice, setFormNotice] = useState<string | null>(null);

  function toggleSymptom(symptom: DailyEntrySymptom) {
    setFormNotice(null);
    setSelectedSymptoms((current) => {
      const hasSymptom = current.includes(symptom);
      return hasSymptom
        ? current.filter((item) => item !== symptom)
        : [...current, symptom];
    });
  }

  function resetDraft() {
    setSelectedMood(null);
    setSelectedFlow(null);
    setSelectedSymptoms([]);
    setPainLevel(0);
    setFormNotice("Selections cleared");
  }

  function handleSave() {
    if (isSaving) {
      return;
    }

    const hasIntentionalInput =
      selectedMood !== null ||
      selectedFlow !== null ||
      selectedSymptoms.length > 0 ||
      painLevel > 0;

    if (!hasIntentionalInput) {
      setFormNotice("Add at least one detail before saving.");
      return;
    }

    setIsSaving(true);
    setFormNotice("Entry saved successfully.");
    const nextDraft: DailyEntryDraft = {
      mood: selectedMood ?? initialDraft.mood,
      flow: selectedFlow ?? initialDraft.flow,
      symptoms: selectedSymptoms,
      painLevel,
    };
    window.setTimeout(() => onSave(nextDraft), 180);
  }

  return (
    <div className="absolute inset-0 z-[80] flex items-end justify-center">
      <button
        type="button"
        onClick={onClose}
        className="log-sheet-backdrop absolute inset-0 bg-[#fcf9f4]/76 backdrop-blur-[3px]"
        aria-label="Close quick log"
      />

      <section className="log-sheet-up relative z-10 flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[2.85rem] border border-white/80 bg-[rgba(255,255,255,0.98)] shadow-[0_-24px_70px_rgba(28,19,16,0.16)] md:max-w-[440px]">
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_18%_22%,rgba(250,218,221,0.65),transparent_26%),radial-gradient(circle_at_82%_68%,rgba(250,218,221,0.38),transparent_24%),radial-gradient(circle_at_50%_108%,rgba(156,62,36,0.05),transparent_28%)]" />
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_50%_10%,rgba(156,62,36,0.14)_0%,transparent_11%),radial-gradient(circle_at_22%_55%,rgba(156,62,36,0.08)_0%,transparent_9%),radial-gradient(circle_at_78%_38%,rgba(156,62,36,0.08)_0%,transparent_9%)]" />
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
                MyStree Soul
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-on-surface">
                Daily Entry
              </h2>
            </div>
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f3ef] text-primary transition hover:bg-[#f4ebe5] active:scale-95"
              aria-label="Reset selections"
            >
              <ResetIcon className="h-5 w-5" />
            </button>
          </header>

          <div className="max-h-[76dvh] overflow-y-auto px-6 pb-4 pt-1 hide-scrollbar">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="relative mb-3 flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#fadadd]/60 blur-2xl" />
                <Bloop
                  state="encourage"
                  animated
                  size="large"
                  accessibilityLabel="Companion ready to help log today's entry"
                  className="question-bloop-shell relative z-10 h-[5.25rem] w-[5.25rem] object-contain drop-shadow-[0_14px_26px_rgba(156,62,36,0.18)]"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary/70">
                Quick Log
              </p>
              <h3 className="mt-1 text-[2rem] font-semibold tracking-tight text-on-surface">
                Log today
              </h3>
              <p className="mt-1 text-sm font-medium text-on-surface-variant/75">
                How are your mood, flow, symptoms, and pain today?
              </p>
            </div>

            {formNotice ? (
              <div className="mb-5 rounded-[1.1rem] border border-outline-variant/20 bg-white/75 px-4 py-3 text-[11px] font-semibold text-primary shadow-sm">
                {formNotice}
              </div>
            ) : null}

            <section className="mb-7">
              <div className="mb-4 flex items-center justify-between px-1">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                  Mood
                </h4>
                <span className="text-[10px] font-semibold text-primary/70">
                  Swipe for more
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto px-1 pb-2 hide-scrollbar">
                {moodOptions.map((option) => {
                  const active = selectedMood === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setFormNotice(null);
                        setSelectedMood(option.id);
                      }}
                      className="group flex min-w-[4.9rem] shrink-0 flex-col items-center"
                    >
                      <div
                        className={`flex h-16 w-[4.9rem] items-center justify-center rounded-[1.6rem] border transition-all duration-300 ${
                          active
                            ? "selected-glow border-terracotta/20 bg-[#d96c4e] text-white shadow-[0_14px_28px_rgba(217,108,78,0.25)]"
                            : "border-white bg-[#fff4f5] text-on-surface squishy-pill hover:bg-[#fdebed]"
                        }`}
                      >
                        <span className="text-sm font-bold uppercase tracking-[0.12em]">
                          {option.emoji}
                        </span>
                      </div>
                      <span
                        className={`mt-2 text-[10px] font-bold transition-colors ${
                          active
                            ? "text-primary"
                            : "text-on-surface-variant/65 group-hover:text-on-surface"
                        }`}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-7">
              <h4 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                Flow intensity
              </h4>
              <div className="rounded-[2rem] border border-white bg-[#fff2f3] p-1.5 shadow-inner">
                <div className="grid grid-cols-4 gap-1">
                  {flowOptions.map((option) => {
                    const active = selectedFlow === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setFormNotice(null);
                          setSelectedFlow(option.id);
                        }}
                        className={`rounded-[1.4rem] px-2 py-3 text-[11px] font-bold transition-all duration-300 ${
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

            <section className="mb-7">
              <div className="mb-3 flex items-center justify-between px-1">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                  Pain level
                </h4>
                <span className="text-[11px] font-semibold text-primary">
                  {painLevel}/10
                </span>
              </div>
              <div className="rounded-[1.7rem] border border-white bg-[#fff4f5] px-4 py-4 shadow-inner">
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={painLevel}
                  onChange={(event) => {
                    setFormNotice(null);
                    setPainLevel(Number(event.target.value));
                  }}
                  className="w-full accent-[#d96c4e]"
                  aria-label="Pain level from 0 to 10"
                />
                <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-on-surface-variant/65">
                  <span>No pain</span>
                  <span>Severe pain</span>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h4 className="mb-3 px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/65">
                Symptoms
              </h4>
              <div className="flex flex-wrap gap-2.5 px-1">
                {symptomOptions.map((option) => {
                  const active = selectedSymptoms.includes(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleSymptom(option.id)}
                      className={`rounded-full px-5 py-3 text-[11px] font-bold transition-all duration-300 ${
                        active
                          ? "selected-glow border border-terracotta/20 bg-[#fbe4e2] text-primary"
                          : "squishy-pill border border-white bg-[#fff4f5] text-on-surface-variant hover:bg-[#fdebed]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <footer className="border-t border-white/70 bg-gradient-to-t from-white via-white/96 to-white/88 px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.9rem] py-5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_36px_rgba(217,108,78,0.28)] transition ${
                isSaving
                  ? "cursor-not-allowed bg-[#d96c4e]/70"
                  : "bg-[#d96c4e] hover:brightness-105 active:scale-[0.98]"
              }`}
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              {isSaving ? "Saving..." : "Save Entry"}
              <HeartIcon className="relative z-10 h-5 w-5" />
            </button>
            {onDismissForToday ? (
              <button
                type="button"
                onClick={onDismissForToday}
                className="mt-3 w-full rounded-full border border-outline-variant/35 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant transition hover:bg-[#faf4ef] active:scale-[0.99]"
              >
                Don&apos;t show again today
              </button>
            ) : null}
            <p className="mt-4 text-center text-[10px] font-medium italic tracking-wide text-on-surface-variant/50">
              Your data is encrypted and private.
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
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

function ResetIcon({ className }: { className?: string }) {
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
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}
