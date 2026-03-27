"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { FertilityLogSheet } from "@/components/fertility-log-sheet";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { SanctuaryMenuSheet } from "@/components/sanctuary-menu-sheet";
import { buildFertilityCompanionModel } from "@/lib/fertility-companion";
import { getTodayAtNoon, parseDateValue } from "@/lib/cycle-tracker";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import {
  buildFertilityLogDraft,
  type FertilityLogDraft,
  useFertilityLogRecord,
} from "@/lib/use-fertility-log-state";

type FertilitySheetFocus = "lh" | "bbt" | "fluid" | "intimacy";
type FertilityHeroMode = FertilitySheetFocus | "default";

export function FertilityCompanionScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logFocus, setLogFocus] = useState<FertilitySheetFocus | undefined>();
  const [heroMode, setHeroMode] = useState<FertilityHeroMode>("default");
  const [showSavedNotice, setShowSavedNotice] = useState(false);
  const { formState } = useOnboardingFormState();
  const { fertilityLog, saveFertilityLog } = useFertilityLogRecord();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const today = getTodayAtNoon();
  const cycleStart = formState.lastCycleDate
    ? parseDateValue(formState.lastCycleDate)
    : today;
  const model = buildFertilityCompanionModel({
    cycleStart,
    cycleLength: formState.cycleLength,
    flowDuration: formState.flowDuration,
    anchorDate: today,
    fertilityLog,
  });
  const heroVisual = getHeroVisual(heroMode, model);

  function handleOpenLog(focus?: FertilitySheetFocus) {
    setLogFocus(focus);
    setHeroMode(focus ?? "default");
    setIsLogOpen(true);
  }

  function handleSaveLog(draft: FertilityLogDraft) {
    saveFertilityLog(draft);
    setIsLogOpen(false);
    setShowSavedNotice(true);
    window.setTimeout(() => setShowSavedNotice(false), 2200);
  }

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#fffdfa] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[14%] top-[6%] h-[20rem] w-[20rem] rounded-full bg-primary/5 blur-[96px]" />
          <div className="absolute -right-[14%] top-[18%] h-[18rem] w-[18rem] rounded-full bg-secondary/8 blur-[100px]" />
          <div className="absolute bottom-[8%] left-[18%] h-[16rem] w-[16rem] rounded-full bg-[#f4ddd6]/50 blur-[96px]" />

          <div className="absolute left-[7%] top-[22%] h-28 w-28 text-primary/8 fertility-orb-drift">
            <FertilitySeed className="h-full w-full object-contain" />
          </div>
          <div className="absolute right-[7%] top-[10%] h-36 w-36 text-secondary/12 fertility-orb-drift [animation-delay:-1.8s]">
            <FertilityBloom className="h-full w-full object-contain" />
          </div>
          <div className="absolute bottom-[18%] right-[12%] h-24 w-24 text-primary/10 fertility-orb-drift [animation-delay:-3.2s]">
            <FertilitySeed className="h-full w-full rotate-[18deg] object-contain" />
          </div>
        </div>

        {showSavedNotice ? (
          <div className="pointer-events-none absolute left-1/2 top-24 z-[75] -translate-x-1/2 md:top-28">
            <div className="rounded-full border border-white/80 bg-white/92 px-4 py-2 text-[11px] font-semibold tracking-wide text-primary shadow-[0_10px_24px_rgba(156,62,36,0.14)] backdrop-blur-md">
              Fertility log saved
            </div>
          </div>
        ) : null}

        <header className="relative z-30 flex items-center justify-between bg-white/78 px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <button
            type="button"
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-md transition hover:bg-white active:scale-95"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5 text-on-surface-variant transition-colors group-hover:text-primary" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-primary/65">
              Fertility Companion
            </p>
            <h1 className="mt-1 text-sm font-semibold tracking-[0.14em] text-on-surface">
              Fertility Companion
            </h1>
          </div>
          <button
            type="button"
            onClick={() => handleOpenLog("lh")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Open fertility log"
          >
            <SeedLogIcon className="h-5 w-5" />
          </button>
        </header>

        <main className="relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+15rem)] pt-6">
          <section
            className={`cycle-enter mb-6 rounded-[2.4rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(250,246,242,0.96))] p-7 shadow-[0_18px_45px_rgba(44,28,17,0.06)] ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative overflow-hidden">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-secondary/8 blur-3xl fertility-glow-breathe" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <span className="rounded-full bg-secondary-container/55 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-on-secondary-container">
                  {model.statusChip}
                </span>
                <h2 className="mt-6 text-[2rem] font-light tracking-tight text-on-surface">
                  {model.headline}
                </h2>
                <p className="mt-2 text-[15px] font-medium text-primary">
                  {model.subtitle}
                </p>
                <div className="relative mt-7 flex flex-col items-center">
                  <div
                    className={`relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${heroVisual.shellClass} shadow-[0_20px_40px_rgba(156,62,36,0.12)]`}
                  >
                    <div className="halo-ring absolute inset-[-14%] rounded-full border border-primary/15" />
                    <div className="fertility-hero-orbit absolute inset-[8%] rounded-full border border-white/70" />
                    <div className="absolute inset-[22%] rounded-full bg-white/60 blur-2xl fertility-glow-breathe" />
                    <div
                      key={heroVisual.key}
                      className={`fertility-hero-shift relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${heroVisual.coreClass} text-white shadow-[0_16px_28px_rgba(156,62,36,0.22)]`}
                    >
                      {heroVisual.icon}
                    </div>
                  </div>
                  <div className="mt-4 rounded-full border border-white/85 bg-white/88 px-4 py-2 shadow-sm backdrop-blur-md">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70">
                      {heroVisual.eyebrow}
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-on-surface-variant">
                      {heroVisual.detail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`cycle-card-rise mb-8 px-2 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "120ms" }}
          >
            <div className="mb-4 flex items-end justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                Probability scale
              </span>
              <span className="text-sm font-semibold text-primary">
                {model.scoreLabel}
              </span>
            </div>

            <div className="relative h-6 rounded-full bg-surface-container p-1 shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-secondary-fixed via-primary-fixed to-primary-container opacity-90" />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${model.markerPercent}%` }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/30 shadow-lg backdrop-blur-md">
                  <div className="h-3 w-3 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)]" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-on-surface-variant/50">
              <span>Follicular</span>
              <span className="font-bold text-primary">Ovulation</span>
              <span>Luteal</span>
            </div>
          </section>

          <section
            className={`cycle-card-rise mb-8 rounded-[2rem] border border-white/80 bg-surface-container-low/92 p-6 shadow-[0_16px_38px_rgba(44,28,17,0.05)] ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "180ms" }}
          >
            {model.hasLoggedData ? (
              <>
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface">
                      LH Hormone Trend
                    </h3>
                    <p className="mt-1 text-xs font-medium text-on-surface-variant">
                      Luteinizing hormone surge watch
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[1.9rem] font-extralight tracking-tight text-primary">
                      {model.lhValue.toFixed(2)}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/60">
                      {model.lhDeltaLabel}
                    </p>
                  </div>
                </div>

                <div className="flex h-34 items-end justify-between gap-3 px-2">
                  {model.lhBars.map((bar) => (
                    <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={`relative w-full rounded-t-full transition-all duration-700 ${
                          bar.active
                            ? "bg-primary-container shadow-[0_10px_20px_rgba(188,86,58,0.2)]"
                            : bar.projected
                              ? "border border-dashed border-outline-variant bg-surface-container-highest/60"
                              : "bg-surface-container-highest"
                        }`}
                        style={{ height: `${bar.value}%` }}
                      >
                        {bar.active ? (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary">
                            {model.lhValue.toFixed(2)}
                          </div>
                        ) : null}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
                          bar.active ? "text-primary" : "text-on-surface-variant/55"
                        }`}
                      >
                        {bar.active ? "Today" : bar.shortLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-[1.7rem] border border-white/80 bg-white/82 p-6 text-center shadow-[0_10px_24px_rgba(44,28,17,0.04)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/8 text-primary">
                  <PulseIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-[1.2rem] font-semibold tracking-tight text-on-surface">
                  {model.emptyStateTitle}
                </h3>
                <p className="mt-2 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                  {model.emptyStateBody}
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenLog("lh")}
                  className="mt-5 rounded-full bg-primary px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_22px_rgba(156,62,36,0.18)] transition hover:brightness-105 active:scale-[0.98]"
                >
                  Log first fertility signal
                </button>
              </div>
            )}
          </section>

          <section
            className={`cycle-card-rise mb-8 rounded-[1.7rem] border border-white/80 bg-[#f9f1ec]/95 p-4 shadow-[0_12px_30px_rgba(44,28,17,0.04)] ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-white text-primary shadow-sm">
                <Bloop
                  state="inform"
                  animated
                  size="small"
                  accessibilityLabel="Bloop fertility companion"
                  className="h-9 w-9 object-contain"
                />
              </div>
              <p className="text-[13px] font-medium leading-[1.6] text-on-surface-variant">
                <span className="font-semibold text-primary">Bloop&apos;s note:</span>{" "}
                {model.bloopMessage}
              </p>
            </div>
          </section>

          <section
            className={`cycle-card-rise mb-8 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "300ms" }}
          >
            <div className="mb-4 flex items-center justify-between px-1">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                Log daily vitals
              </h4>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/70">
                All actions live
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ActionCard
                icon={<ThermometerIcon className="h-5 w-5" />}
                label="Basal temp"
                value={
                  fertilityLog
                    ? `${fertilityLog.basalTemp.toFixed(1)} deg`
                    : "Add reading"
                }
                active={heroMode === "bbt"}
                onClick={() => handleOpenLog("bbt")}
              />
              <ActionCard
                icon={<FluidIcon className="h-5 w-5" />}
                label="Cervical fluid"
                value={
                  fertilityLog
                    ? formatFluid(fertilityLog.cervicalFluid)
                    : "Select type"
                }
                active={heroMode === "fluid"}
                onClick={() => handleOpenLog("fluid")}
              />
              <ActionCard
                icon={<HeartIcon className="h-5 w-5" />}
                label="Sexual activity"
                value={
                  fertilityLog
                    ? fertilityLog.intercourse
                      ? "Logged today"
                      : "Not logged"
                    : "Log status"
                }
                active={heroMode === "intimacy"}
                onClick={() => handleOpenLog("intimacy")}
              />
              <ActionCard
                icon={<PulseIcon className="h-5 w-5" />}
                label="LH result"
                value={
                  fertilityLog
                    ? capitalize(fertilityLog.lhResult)
                    : "Add strip result"
                }
                active={heroMode === "lh"}
                onClick={() => handleOpenLog("lh")}
              />
            </div>
          </section>

          <section
            id="fertility-guide"
            className={`cycle-card-rise mb-8 overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(244,221,214,0.6))] p-6 shadow-[0_16px_38px_rgba(44,28,17,0.05)] ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "360ms" }}
          >
            <div className="relative">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/60 blur-3xl" />
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/65">
                  Holistic guide
                </p>
                <h3 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-on-surface">
                  {model.guideTitle}
                </h3>
                <p className="mt-3 text-[14px] font-medium leading-[1.7] text-on-surface-variant">
                  {model.guideBody}
                </p>
                {isGuideExpanded ? (
                  <p className="mt-4 text-[13px] font-medium leading-[1.7] text-on-surface-variant">
                    Favor calm mornings, hydration, and steady meals. The more consistently you log today, the more precise your fertile timing becomes across future cycles.
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setIsGuideExpanded((current) => !current)}
                    className="rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm transition hover:bg-[#fff7f3] active:scale-95"
                  >
                    {isGuideExpanded ? "Hide notes" : model.guideAction}
                  </button>
                  <Link
                    href="/dashboard/cycle"
                    className="rounded-full border border-white/80 bg-white/50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant shadow-sm transition hover:bg-white/80 active:scale-95"
                  >
                    Open cycle tracker
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <div className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+7rem)] left-0 right-0 z-40 px-6">
          <div className="mx-auto flex max-w-[420px] flex-col gap-3">
            <button
              type="button"
              onClick={() => handleOpenLog("lh")}
              className="pointer-events-auto group flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#9c3e24] to-[#bc563a] px-6 py-4 text-[13px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_20px_42px_rgba(156,62,36,0.22)] transition hover:brightness-105 active:scale-[0.98]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 transition-transform group-hover:rotate-12">
                <SeedLogIcon className="h-[1.125rem] w-[1.125rem]" />
              </span>
              Update fertility data
            </button>
          </div>
        </div>

        <SanctuaryBottomNav />

        {isLogOpen ? (
          <FertilityLogSheet
            initialDraft={buildFertilityLogDraft(fertilityLog)}
            initialFocus={logFocus}
            onClose={() => setIsLogOpen(false)}
            onSave={handleSaveLog}
          />
        ) : null}

        {isMenuOpen ? (
          <SanctuaryMenuSheet
            userName={formState.name}
            onClose={() => setIsMenuOpen(false)}
          />
        ) : null}
      </div>
    </PhonePreviewShell>
  );
}

function ActionCard({
  icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[8.8rem] flex-col items-start justify-between rounded-[1.75rem] border p-5 text-left shadow-[0_12px_28px_rgba(44,28,17,0.04)] transition active:scale-[0.98] ${
        active
          ? "border-primary/20 bg-[#fff4ee] shadow-[0_16px_32px_rgba(156,62,36,0.1)]"
          : "border-white/80 bg-white/90 hover:bg-[#fff8f4]"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${
          active ? "bg-primary text-white" : "bg-primary/8 text-primary"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
          {label}
        </p>
        <p
          className={`mt-2 text-sm font-semibold leading-relaxed ${
            active ? "text-primary" : "text-on-surface"
          }`}
        >
          {value}
        </p>
      </div>
    </button>
  );
}

function getHeroVisual(
  mode: FertilityHeroMode,
  model: ReturnType<typeof buildFertilityCompanionModel>,
) {
  const highWindow = model.markerPercent >= 58;

  if (mode === "bbt") {
    return {
      key: "bbt",
      eyebrow: "Basal temp focus",
      detail: "Thermal shift preview",
      shellClass: "from-[#eef5e8] to-[#fffdfa]",
      coreClass: "from-[#6d7f59] to-[#526442]",
      icon: <ThermometerIcon className="h-8 w-8" />,
    };
  }

  if (mode === "fluid") {
    return {
      key: "fluid",
      eyebrow: "Cervical fluid focus",
      detail: "Texture and window clues",
      shellClass: "from-[#fbefe7] to-[#fffdfa]",
      coreClass: "from-[#cc7a5b] to-[#a95338]",
      icon: <FluidIcon className="h-8 w-8" />,
    };
  }

  if (mode === "intimacy") {
    return {
      key: "intimacy",
      eyebrow: "Intimacy focus",
      detail: "Connection timing log",
      shellClass: "from-[#f7e9e6] to-[#fffdfa]",
      coreClass: "from-[#bd6a62] to-[#9c4d44]",
      icon: <HeartIcon className="h-7 w-7" />,
    };
  }

  if (mode === "lh") {
    return {
      key: "lh",
      eyebrow: "LH focus",
      detail: "Hormone surge preview",
      shellClass: "from-[#faeee8] to-[#fffdfa]",
      coreClass: "from-[#bc563a] to-[#9c3e24]",
      icon: <PulseIcon className="h-8 w-8" />,
    };
  }

  return {
    key: highWindow ? "default-peak" : "default-gentle",
    eyebrow: highWindow ? "Peak window focus" : "Cycle rhythm focus",
    detail: highWindow ? "Biological window is opening" : "Gentler support window",
    shellClass: highWindow
      ? "from-[#fbefe8] to-[#fffdfa]"
      : "from-[#f8f3ec] to-[#fffdfa]",
    coreClass: highWindow
      ? "from-[#bc563a] to-[#9c3e24]"
      : "from-[#c06a49] to-[#9c3e24]",
    icon: highWindow ? (
      <FertilityBloom className="h-8 w-8" />
    ) : (
      <FertilitySeed className="h-8 w-8" />
    ),
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatFluid(value: string) {
  return value === "egg_white" ? "Egg white" : capitalize(value);
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h8" />
    </svg>
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
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

function SeedLogIcon({ className }: { className?: string }) {
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
      <path d="M12 2c4 0 7 3 7 7 0 5-7 13-7 13S5 14 5 9c0-4 3-7 7-7Z" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  );
}

function ThermometerIcon({ className }: { className?: string }) {
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
      <path d="M14 14.76V5a2 2 0 1 0-4 0v9.76a4 4 0 1 0 4 0Z" />
    </svg>
  );
}

function FluidIcon({ className }: { className?: string }) {
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
      <path d="M12 2s6 6.36 6 11a6 6 0 1 1-12 0C6 8.36 12 2 12 2Z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 21-1.45-1.32C5.4 15.02 2 11.9 2 8.09 2 5 4.42 2.5 7.5 2.5c1.74 0 3.41.81 4.5 2.09A6.01 6.01 0 0 1 16.5 2.5C19.58 2.5 22 5 22 8.09c0 3.81-3.4 6.93-8.55 11.59L12 21Z" />
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

function LotusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2s3 5 3 9c0 2-1.5 4-3 4s-3-2-3-4c0-4 3-9 3-9Zm-6 6s2.5 3 2.5 5c0 1.5-1 2.5-2.5 2.5S3 14 3 12.5C3 10.5 6 8 6 8Zm12 0s-2.5 3-2.5 5c0 1.5 1 2.5 2.5 2.5s3-1.5 3-3C21 10.5 18 8 18 8Zm-6 8.5c-2 0-4 2-4 4.5 0 0 2 0 4-2 2 2 4 2 4 2 0-2.5-2-4.5-4-4.5Z" />
    </svg>
  );
}

function CycleIcon({ className }: { className?: string }) {
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

function ProfileUserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </svg>
  );
}

function FertilitySeed({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c4.1 0 7 2.96 7 7.2 0 5.36-4.72 9.8-7 10.8-2.28-1-7-5.44-7-10.8C5 4.96 7.9 2 12 2Z" />
      <path d="M12 6.5c.55 0 1 .45 1 1v7a1 1 0 1 1-2 0v-7c0-.55.45-1 1-1Z" fill="#fcf9f4" />
    </svg>
  );
}

function FertilityBloom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <path d="M50 50C50 30 70 10 90 10C90 30 70 50 50 50Z" />
      <path d="M50 50C70 50 90 70 90 90C70 90 50 70 50 50Z" />
      <path d="M50 50C50 70 30 90 10 90C10 70 30 50 50 50Z" />
      <path d="M50 50C30 50 10 30 10 10C30 10 50 30 50 50Z" />
      <circle cx="50" cy="50" r="10" fill="currentColor" />
    </svg>
  );
}

function FlameNavIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-.5-2.5-2.5-4.5C9 12 8.5 13.12 8.5 14.5Z" />
      <path d="M12 2c0 6-6 8-6 13a6 6 0 0 0 12 0c0-5-6-7-6-13Z" />
    </svg>
  );
}
