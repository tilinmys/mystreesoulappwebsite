"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { SanctuaryMenuSheet } from "@/components/sanctuary-menu-sheet";
import { AdolescenceSupportSheet } from "@/components/adolescence-support-sheet";
import { buildAdolescenceSupportModel } from "@/lib/adolescence-support";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import {
  type AdolescenceMood,
  type AdolescenceRitualId,
  useAdolescenceSupportState,
} from "@/lib/use-adolescence-support-state";

const moodOptions: Array<{
  id: AdolescenceMood;
  label: string;
  eyebrow: string;
  icon: ReactNode;
  tint: string;
  activeTint: string;
}> = [
  {
    id: "radiant",
    label: "Radiant",
    eyebrow: "Bright energy",
    icon: <SunIcon className="h-5 w-5" />,
    tint: "border-[#f0ddd4] bg-white/78 text-primary",
    activeTint: "border-primary/18 bg-[#fff2eb] text-primary",
  },
  {
    id: "calm",
    label: "Calm",
    eyebrow: "Steady pace",
    icon: <LeafIcon className="h-5 w-5" />,
    tint: "border-[#edf3e6] bg-white/78 text-secondary",
    activeTint: "border-secondary/18 bg-[#f3f8ee] text-secondary",
  },
  {
    id: "pensive",
    label: "Pensive",
    eyebrow: "Thoughtful",
    icon: <CloudIcon className="h-5 w-5" />,
    tint: "border-[#ece5e2] bg-white/78 text-[#7d6660]",
    activeTint: "border-[#cdbab4] bg-[#faf4f1] text-[#7d6660]",
  },
  {
    id: "flowing",
    label: "Flowing",
    eyebrow: "Changeable",
    icon: <DropIcon className="h-5 w-5" />,
    tint: "border-[#f2dfda] bg-white/78 text-primary",
    activeTint: "border-primary/18 bg-[#fff1eb] text-primary",
  },
  {
    id: "growing",
    label: "Growing",
    eyebrow: "Learning",
    icon: <SproutIcon className="h-5 w-5" />,
    tint: "border-[#e8efd8] bg-white/78 text-[#6b7d59]",
    activeTint: "border-[#9caf88]/20 bg-[#f2f8ea] text-[#6b7d59]",
  },
];

export function AdolescenceSupportScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [showAllRituals, setShowAllRituals] = useState(false);
  const [activeInsightId, setActiveInsightId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const ritualRef = useRef<HTMLElement | null>(null);
  const { formState } = useOnboardingFormState();
  const { adolescenceState, updateAdolescenceState } = useAdolescenceSupportState();

  const model = useMemo(
    () =>
      buildAdolescenceSupportModel({
        answers: formState.questionnaireAnswers,
        state: adolescenceState,
      }),
    [adolescenceState, formState.questionnaireAnswers],
  );

  const selectedInsight =
    model.insights.find((item) => item.id === activeInsightId) ?? model.insights[0];
  const currentRitualProgress = adolescenceState.ritualProgress;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function handleMoodSelect(mood: AdolescenceMood) {
    updateAdolescenceState({ mood });
    setNotice(`Mood saved: ${capitalize(mood)}`);
  }

  function handleInsightSelect(id: string) {
    setActiveInsightId(id);
    updateAdolescenceState({
      insightsViewed: adolescenceState.insightsViewed + 1,
    });
  }

  function handleRitualSelect(id: AdolescenceRitualId) {
    updateAdolescenceState({
      ritualId: id,
      ritualProgress: id === adolescenceState.ritualId ? adolescenceState.ritualProgress : 36,
      ritualPlaying: false,
    });
    setShowAllRituals(false);
    setNotice("Ritual updated");
  }

  function handleRitualAction() {
    const nextProgress = Math.min(100, currentRitualProgress + 12);
    const completed = nextProgress >= 100;

    updateAdolescenceState({
      ritualPlaying: !adolescenceState.ritualPlaying,
      ritualProgress: completed ? 100 : nextProgress,
    });

    setNotice(completed ? "Ritual completed" : "Ritual started");
  }

  function handleAllRituals() {
    setShowAllRituals((current) => !current);
  }

  function handleSupportTopic(topic: string) {
    updateAdolescenceState({ lastChatTopic: topic });
    setIsSupportOpen(false);

    if (topic === "body_changes") {
      handleInsightSelect(model.insights[1]?.id ?? model.insights[0].id);
      setNotice("Showing a body explanation");
      return;
    }

    if (topic === "practical_help") {
      ritualRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setNotice("A simple ritual is ready");
      return;
    }

    setNotice("Bloop is keeping things gentle");
  }

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#fffdf9] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[16%] top-[3%] h-[22rem] w-[22rem] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute -right-[12%] top-[22%] h-[18rem] w-[18rem] rounded-full bg-secondary-container/28 blur-[94px]" />
          <div className="absolute bottom-[8%] left-[12%] h-[16rem] w-[16rem] rounded-full bg-[#f5ded7]/55 blur-[92px]" />
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_18%_22%,rgba(156,62,36,0.04),transparent_18%),radial-gradient(circle_at_82%_38%,rgba(156,62,36,0.03),transparent_16%),radial-gradient(circle_at_32%_82%,rgba(82,100,66,0.04),transparent_18%)]" />
          <div className="absolute left-[7%] top-[12%] h-20 w-20 text-primary/9 adolescence-bloom-drift">
            <BloomIcon className="h-full w-full" />
          </div>
          <div className="absolute right-[8%] top-[26%] h-24 w-24 text-secondary/14 adolescence-bloom-drift [animation-delay:-1.6s]">
            <LeafPetal className="h-full w-full" />
          </div>
          <div className="absolute bottom-[18%] right-[12%] h-16 w-16 text-primary/10 adolescence-bloom-drift [animation-delay:-2.7s]">
            <SoftFlower className="h-full w-full" />
          </div>
        </div>

        {notice ? (
          <div className="pointer-events-none absolute left-1/2 top-24 z-[75] -translate-x-1/2 md:top-28">
            <div className="rounded-full border border-white/85 bg-white/92 px-4 py-2 text-[11px] font-semibold tracking-wide text-primary shadow-[0_10px_24px_rgba(156,62,36,0.14)] backdrop-blur-md">
              {notice}
            </div>
          </div>
        ) : null}

        <header className="relative z-30 flex items-center justify-between bg-white/78 px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Open sanctuary menu"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-primary/65">
              Your space
            </p>
            <h1 className="mt-1 text-sm font-semibold tracking-[0.14em] text-on-surface">
              Adolescence Support
            </h1>
          </div>
          <div className="h-10 w-10" />
        </header>

        <main className="relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] pt-5">
          <section className={`cycle-enter mb-8 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <div className="overflow-hidden rounded-[2.45rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,239,0.92))] p-6 shadow-[0_18px_46px_rgba(44,28,17,0.06)]">
              <div className="flex items-center justify-center">
                <div className="relative flex h-56 w-56 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl adolescence-orb-breathe" />
                  <Bloop
                    state="adolescence"
                    animated
                    size="large"
                    accessibilityLabel="Bloop adolescence support companion"
                    className="relative z-10 h-36 w-36 object-contain drop-shadow-xl"
                  />
                </div>
              </div>

              <div className="mt-2 text-center">
                <span className="inline-flex rounded-full bg-[#f8efe9] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/75">
                  {model.heroEyebrow}
                </span>
                <h2 className="mt-5 text-[2rem] font-light leading-tight tracking-tight text-on-surface">
                  {model.heroTitle}
                </h2>
                <p className="mx-auto mt-3 max-w-[18.5rem] text-[14px] font-medium leading-[1.7] text-on-surface-variant">
                  {model.heroBody}
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/84 px-4 py-2 shadow-sm">
                  <span className={`text-sm ${model.moodAccent}`}>
                    {getMoodIcon(model.moodIcon)}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface">
                    {model.moodLabel} today
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className={`cycle-card-rise mb-8 ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "100ms" }}>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Feeling check-in
                </p>
                <h3 className="mt-1 text-[1.25rem] font-semibold tracking-tight text-on-surface">
                  How are you today?
                </h3>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/70">
                Tap to save
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {moodOptions.slice(0, 3).map((mood) => {
                const active = adolescenceState.mood === mood.id;
                return (
                  <MoodButton
                    key={mood.id}
                    mood={mood}
                    active={active}
                    onClick={() => handleMoodSelect(mood.id)}
                  />
                );
              })}
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {moodOptions.slice(3).map((mood) => {
                const active = adolescenceState.mood === mood.id;
                return (
                  <MoodButton
                    key={mood.id}
                    mood={mood}
                    active={active}
                    onClick={() => handleMoodSelect(mood.id)}
                  />
                );
              })}
            </div>
          </section>

          <section className={`cycle-card-rise mb-8 rounded-[2rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,245,240,0.96))] p-5 shadow-[0_16px_38px_rgba(44,28,17,0.05)] ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[#fff3ed] text-primary shadow-sm">
                <BloomIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/68">
                    Bloop&apos;s guidance
                  </p>
                  <span className="rounded-full border border-primary/8 bg-primary/8 px-3 py-1 text-[10px] font-semibold text-primary">
                    {model.guideChip}
                  </span>
                </div>
                <p className="mt-3 text-[14px] font-medium leading-[1.7] text-on-surface-variant">
                  {model.guideBody}
                </p>
                <div className="mt-4 rounded-[1.4rem] border border-white/80 bg-white/82 p-3.5 shadow-sm">
                  <p className="text-[11px] font-semibold leading-[1.65] text-on-surface">
                    {model.trustedPhrase}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className={`cycle-card-rise mb-8 ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "240ms" }}>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Insights for you
                </p>
                <h3 className="mt-1 text-[1.25rem] font-semibold tracking-tight text-on-surface">
                  One gentle idea at a time
                </h3>
              </div>
              <div className="flex gap-1.5">
                {model.insights.slice(0, 3).map((item) => (
                  <span
                    key={item.id}
                    className={`h-1.5 w-1.5 rounded-full ${
                      selectedInsight?.id === item.id ? "bg-primary" : "bg-primary/18"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 hide-scrollbar">
              {model.insights.map((insight) => {
                const active = selectedInsight?.id === insight.id;

                return (
                  <button
                    key={insight.id}
                    type="button"
                    onClick={() => handleInsightSelect(insight.id)}
                    className={`min-h-[10.8rem] min-w-[15rem] rounded-[1.8rem] border p-5 text-left shadow-[0_12px_28px_rgba(44,28,17,0.04)] transition-all ${
                      active
                        ? `${insight.tint} border-primary/18`
                        : "border-white/80 bg-white/88 hover:bg-[#fff8f5]"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/65">
                      {insight.meta}
                    </p>
                    <h4 className="mt-4 text-[1.1rem] font-semibold tracking-tight text-on-surface">
                      {insight.title}
                    </h4>
                    <p className="mt-3 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                      {insight.body}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedInsight ? (
              <div className="mt-4 rounded-[1.8rem] border border-white/80 bg-white/88 p-5 shadow-[0_12px_24px_rgba(44,28,17,0.04)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/60">
                      Active insight
                    </p>
                    <h4 className="mt-2 text-[1.08rem] font-semibold tracking-tight text-on-surface">
                      {selectedInsight.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSupportOpen(true)}
                    className="rounded-full bg-[#faf2ec] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary shadow-sm transition hover:bg-[#f7e9e2] active:scale-[0.98]"
                  >
                    Ask about this
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section ref={ritualRef} className={`cycle-card-rise mb-6 ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "320ms" }}>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Ritual of the day
                </p>
                <h3 className="mt-1 text-[1.25rem] font-semibold tracking-tight text-on-surface">
                  Something small that helps
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAllRituals}
                className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary transition hover:opacity-80"
              >
                {showAllRituals ? "Hide rituals" : "All rituals"}
              </button>
            </div>

            <div className="rounded-[2rem] border border-white/85 bg-surface-container-low/86 p-5 shadow-[0_14px_34px_rgba(44,28,17,0.05)]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white text-primary shadow-sm">
                  <MeditationIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/60">
                    {model.ritual.meta}
                  </p>
                  <h4 className="mt-1 text-[1.08rem] font-semibold tracking-tight text-on-surface">
                    {model.ritual.label}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleRitualAction}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_20px_rgba(156,62,36,0.18)] transition hover:brightness-105 active:scale-[0.95]"
                  aria-label={adolescenceState.ritualPlaying ? "Pause ritual" : "Start ritual"}
                >
                  {adolescenceState.ritualPlaying ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="mt-4 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                {model.ritual.body}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500"
                    style={{ width: `${currentRitualProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/60">
                  {currentRitualProgress}% ritual complete
                </span>
              </div>

              {showAllRituals ? (
                <div className="mt-4 grid gap-2">
                  {model.rituals.map((ritual) => {
                    const active = ritual.id === adolescenceState.ritualId;

                    return (
                      <button
                        key={ritual.id}
                        type="button"
                        onClick={() => handleRitualSelect(ritual.id)}
                        className={`flex items-center justify-between rounded-[1.3rem] border px-4 py-3 text-left transition-all ${
                          active
                            ? "border-primary/18 bg-white shadow-sm"
                            : "border-white/80 bg-white/70 hover:bg-white"
                        }`}
                      >
                        <div>
                          <p className="text-[12px] font-semibold text-on-surface">
                            {ritual.label}
                          </p>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-on-surface-variant/60">
                            {ritual.meta}
                          </p>
                        </div>
                        {active ? (
                          <span className="rounded-full bg-primary/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                            Active
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </section>
        </main>

        <button
          type="button"
          onClick={() => setIsSupportOpen(true)}
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_16px_30px_rgba(156,62,36,0.24)] transition hover:brightness-105 active:scale-[0.95]"
          aria-label="Talk to Bloop"
        >
          <ChatIcon className="h-6 w-6" />
        </button>

        <SanctuaryBottomNav />

        {isMenuOpen ? (
          <SanctuaryMenuSheet
            userName={formState.name}
            onClose={() => setIsMenuOpen(false)}
          />
        ) : null}

        {isSupportOpen ? (
          <AdolescenceSupportSheet
            moodLabel={model.moodLabel}
            guideChip={model.guideChip}
            onClose={() => setIsSupportOpen(false)}
            onSelectTopic={handleSupportTopic}
          />
        ) : null}
      </div>
    </PhonePreviewShell>
  );
}

function MoodButton({
  mood,
  active,
  onClick,
}: {
  mood: (typeof moodOptions)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.45rem] border p-4 text-left shadow-[0_10px_24px_rgba(44,28,17,0.04)] transition-all duration-300 active:scale-[0.98] ${
        active ? mood.activeTint : mood.tint
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-white/78 shadow-sm">
        {mood.icon}
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/60">
        {mood.eyebrow}
      </p>
      <p className="mt-2 text-[13px] font-semibold text-on-surface">{mood.label}</p>
    </button>
  );
}

function getMoodIcon(icon: string) {
  if (icon === "sun") return <SunIcon className="h-4 w-4" />;
  if (icon === "leaf") return <LeafIcon className="h-4 w-4" />;
  if (icon === "cloud") return <CloudIcon className="h-4 w-4" />;
  if (icon === "drop") return <DropIcon className="h-4 w-4" />;
  return <SproutIcon className="h-4 w-4" />;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
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
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z" />
    </svg>
  );
}

function DropIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2s6 6.36 6 11a6 6 0 1 1-12 0C6 8.36 12 2 12 2Z" />
    </svg>
  );
}

function SproutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 20v-8" />
      <path d="M12 12c0-3.3 2.2-6 5-7-0.2 3.6-2.4 6.5-5 7Z" />
      <path d="M12 12C9.2 11.5 7 8.6 7 5c2.8 1 5 3.7 5 7Z" />
    </svg>
  );
}

function MeditationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <path d="M8 22c0-2.5 1.5-4 4-4s4 1.5 4 4" />
      <path d="M7 14c1.6 0 2.6-1 3-3l1.1-3 1.1 3c.4 2 1.4 3 3 3" />
      <path d="M5 18c1.6 0 2.8-1 3.6-3" />
      <path d="M19 18c-1.6 0-2.8-1-3.6-3" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="m8 5 11 7-11 7Z" /></svg>;
}

function PauseIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M8 5h3v14H8zm5 0h3v14h-3z" /></svg>;
}

function BloomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c-.6 0-1.1.4-1.4.9l-1.1 2.1c-.2.4-.6.7-1 .8l-2.3.3c-1 .1-1.4 1.3-.7 2l1.7 1.6c.3.3.4.8.4 1.2l-.4 2.3c-.2 1 .9 1.8 1.8 1.3l2.1-1.1c.4-.2.9-.2 1.3 0l2.1 1.1c.9.5 2-.3 1.8-1.3l-.4-2.3c0-.4.1-.9.4-1.2l1.7-1.6c.7-.7.3-1.9-.7-2l-2.3-.3c-.4-.1-.8-.4-1-.8l-1.1-2.1c-.3-.5-.8-.9-1.4-.9z" />
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" opacity="0.4" />
    </svg>
  );
}

function LeafPetal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <path d="M50 16C62 28 80 36 84 50C80 64 62 72 50 84C38 72 20 64 16 50C20 36 38 28 50 16Z" />
    </svg>
  );
}

function SoftFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <path d="M50 22C58 34 76 34 78 50C76 66 58 66 50 78C42 66 24 66 22 50C24 34 42 34 50 22Z" />
      <circle cx="50" cy="50" r="8" />
    </svg>
  );
}
