"use client";

import { useState } from "react";

type AdolescenceSupportSheetProps = {
  moodLabel: string;
  guideChip: string;
  onClose: () => void;
  onSelectTopic: (topic: string) => void;
};

const topics = [
  {
    id: "body_changes",
    title: "What is happening in my body?",
    description: "A simple explanation without too much medical language.",
  },
  {
    id: "emotions",
    title: "Help me calm down",
    description: "A softer reset for big feelings, nerves, or overwhelm.",
  },
  {
    id: "practical_help",
    title: "Give me one simple tip",
    description: "Something useful I can do right now without overthinking it.",
  },
] as const;

export function AdolescenceSupportSheet({
  moodLabel,
  guideChip,
  onClose,
  onSelectTopic,
}: AdolescenceSupportSheetProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>(topics[0].id);

  function handleConfirm() {
    onSelectTopic(selectedTopic);
  }

  return (
    <div className="absolute inset-0 z-[86] flex items-end justify-center">
      <button
        type="button"
        onClick={onClose}
        className="log-sheet-backdrop absolute inset-0 bg-[#fcf9f4]/78 backdrop-blur-[4px]"
        aria-label="Close adolescence support sheet"
      />

      <section className="log-sheet-up relative z-10 flex w-full max-w-[430px] flex-col overflow-hidden rounded-t-[2.85rem] border border-white/80 bg-[rgba(255,255,255,0.98)] shadow-[0_-24px_70px_rgba(28,19,16,0.16)] md:max-w-[440px]">
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_18%,rgba(245,222,215,0.62),transparent_24%),radial-gradient(circle_at_78%_18%,rgba(210,230,188,0.55),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(156,62,36,0.05),transparent_28%)]" />
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
                Bloop support
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-on-surface">
                Ask in a simple way
              </h2>
            </div>
            <div className="w-11" />
          </header>

          <div className="max-h-[72dvh] overflow-y-auto px-6 pb-4 pt-1 hide-scrollbar">
            <div className="mb-6 rounded-[1.6rem] border border-white/80 bg-white/80 p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                Today&apos;s tone
              </p>
              <p className="mt-2 text-sm font-medium text-on-surface">
                Feeling <span className="text-primary">{moodLabel}</span> with{" "}
                <span className="text-primary">{guideChip.toLowerCase()}</span> guidance.
              </p>
            </div>

            <div className="space-y-3">
              {topics.map((topic) => {
                const active = selectedTopic === topic.id;

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`flex w-full items-start gap-3 rounded-[1.45rem] border px-4 py-4 text-left transition-all duration-300 active:scale-[0.99] ${
                      active
                        ? "border-primary/18 bg-[#fff4ee] shadow-[0_12px_24px_rgba(156,62,36,0.08)]"
                        : "border-white/80 bg-white/84 hover:bg-[#fff9f5]"
                    }`}
                  >
                    <div
                      className={`mt-1 h-5 w-5 shrink-0 rounded-full border transition-all ${
                        active
                          ? "border-primary bg-primary shadow-[0_0_0_4px_rgba(156,62,36,0.12)]"
                          : "border-outline-variant"
                      }`}
                    />
                    <div>
                      <p className="text-[15px] font-semibold text-on-surface">
                        {topic.title}
                      </p>
                      <p className="mt-1 text-[12px] font-medium leading-[1.6] text-on-surface-variant">
                        {topic.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <footer className="border-t border-white/70 bg-gradient-to-t from-white via-white/96 to-white/88 px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4">
            <button
              type="button"
              onClick={handleConfirm}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[1.9rem] bg-[#d96c4e] py-5 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_36px_rgba(217,108,78,0.28)] transition hover:brightness-105 active:scale-[0.98]"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/12 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              Ask Bloop
              <BloomIcon className="relative z-10 h-5 w-5" />
            </button>
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

function BloomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2C13.5 2 15 3.5 15 5C15 6.5 13.5 8 12 8C10.5 8 9 6.5 9 5C9 3.5 10.5 2 12 2ZM6 8C7.5 8 9 9.5 9 11C9 12.5 7.5 14 6 14C4.5 14 3 12.5 3 11C3 9.5 4.5 8 6 8ZM18 8C19.5 8 21 9.5 21 11C21 12.5 19.5 14 18 14C16.5 14 15 12.5 15 11C15 9.5 16.5 8 18 8ZM12 16C13.5 16 15 17.5 15 19C15 20.5 13.5 22 12 22C10.5 22 9 20.5 9 19C9 17.5 10.5 16 12 16Z" />
    </svg>
  );
}
