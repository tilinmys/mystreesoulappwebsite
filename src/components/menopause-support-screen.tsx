"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { SanctuaryMenuSheet } from "@/components/sanctuary-menu-sheet";
import {
  useMenopauseSupportState,
  type MenopauseIntensity,
  type MenopauseSupportLog,
} from "@/lib/use-menopause-support-state";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";

type WeekDayData = {
  key: string;
  label: string;
  shortLabel: string;
  date: Date;
  logs: MenopauseSupportLog[];
  mildCount: number;
  moderateCount: number;
  intenseCount: number;
  totalCount: number;
};

const intensityLabel: Record<MenopauseIntensity, string> = {
  mild: "Mild",
  moderate: "Moderate",
  intense: "Intense",
};

const intensityColor: Record<MenopauseIntensity, string> = {
  mild: "bg-[#f0ede9] text-[#56423d]",
  moderate: "bg-primary/10 text-primary",
  intense: "bg-primary/20 text-primary font-bold",
};

export function MenopauseSupportScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogNotice, setShowLogNotice] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { formState } = useOnboardingFormState();
  const { menopauseState, updateMenopauseState, addMenopauseLog } =
    useMenopauseSupportState();

  const anchorDate = useMemo(() => getTodayAtNoon(), []);
  const weekData = useMemo(
    () => buildWeekData(menopauseState.logs, anchorDate),
    [anchorDate, menopauseState.logs],
  );
  const [activeDay, setActiveDay] = useState(weekData.length - 1);
  const safeActiveDay = Math.min(Math.max(activeDay, 0), weekData.length - 1);
  const selectedDay = weekData[safeActiveDay];
  const todayData = weekData[weekData.length - 1];
  const maxDailyCount = Math.max(1, ...weekData.map((day) => day.totalCount));

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!showLogNotice) {
      return;
    }

    const timer = window.setTimeout(() => setShowLogNotice(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showLogNotice]);

  function handleQuickLog(intensity: MenopauseIntensity = "moderate") {
    addMenopauseLog({
      symptom: "hot_flash",
      intensity,
      note:
        intensity === "intense"
          ? "Logged during a stronger discomfort wave"
          : undefined,
    });
    setShowLogNotice(true);
  }

  const supportiveMessage =
    todayData.totalCount === 0
      ? "No symptoms have been logged yet. Start with one calm check-in whenever you notice a body shift."
      : todayData.intenseCount > 0
        ? "You logged stronger symptoms today. Keeping the tone calm and the actions simple matters most here."
        : "Symptoms are showing up in a manageable pattern today. Gentle tracking will make your weekly picture clearer.";
  const menopauseBloopState =
    todayData.intenseCount > 0 ? "reassure" : "menopause";

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#fffdf9] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[16%] -top-[8%] h-[28rem] w-[28rem] rounded-full bg-[#f9e6dc]/60 blur-[92px]" />
          <div className="absolute -right-[16%] top-[32%] h-[22rem] w-[22rem] rounded-full bg-secondary-container/30 blur-[96px]" />
          <div className="absolute bottom-[4%] left-[8%] h-[18rem] w-[18rem] rounded-full bg-primary/4 blur-[110px]" />
          <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_18%,rgba(156,62,36,0.05),transparent_20%),radial-gradient(circle_at_78%_42%,rgba(188,86,58,0.04),transparent_22%),radial-gradient(circle_at_30%_84%,rgba(82,100,66,0.04),transparent_24%)]" />
          <div
            className={`absolute -right-20 top-16 h-72 w-72 text-primary/5 transition-opacity duration-1000 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <BotanicalPetal className="float-slow h-full w-full rotate-45 object-contain" />
          </div>
          <div
            className={`absolute -left-20 bottom-40 h-80 w-80 text-[#d5e9bf]/18 transition-opacity duration-1000 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <BotanicalLeaf className="sway-slow h-full w-full -rotate-12 object-contain" />
          </div>
        </div>

        {showLogNotice ? (
          <div className="pointer-events-none absolute left-1/2 top-24 z-[75] -translate-x-1/2 md:top-28">
            <div className="rounded-full border border-white/80 bg-white/92 px-4 py-2 text-[11px] font-semibold tracking-wide text-primary shadow-[0_10px_24px_rgba(156,62,36,0.14)] backdrop-blur-md">
              Symptom logged
            </div>
          </div>
        ) : null}

        <header className="relative z-30 flex items-center justify-between bg-white/78 px-4 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <button
            type="button"
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-md transition hover:bg-white active:scale-95"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5 text-on-surface-variant transition-colors group-hover:text-primary" />
          </button>
          <div className="min-w-0 flex-1 px-3 text-center">
            <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.24em] text-primary/65">
              Support
            </p>
            <h1 className="mt-1 truncate text-sm font-semibold tracking-[0.12em] text-on-surface">
              Menopause Support
            </h1>
          </div>
          <button
            type="button"
            onClick={() => handleQuickLog("moderate")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Quick log hot flash"
          >
            <FlameIcon className="h-5 w-5" />
          </button>
        </header>

        <main className="relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+10.5rem)] pt-6">
          <section
            className={`cycle-enter mb-8 text-center ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
              Today&apos;s patterns
            </p>
            <h2 className="text-[2rem] font-light leading-tight tracking-tight text-on-surface">
              {todayData.totalCount === 0 ? (
                <>
                  A calmer start for <span className="font-medium italic text-primary">today</span>
                </>
              ) : (
                <>
                  {todayData.totalCount} symptom
                  {todayData.totalCount > 1 ? "s" : ""} noted{" "}
                  <span className="font-medium italic text-primary">today</span>
                </>
              )}
            </h2>
            <p className="mx-auto mt-3 max-w-[19rem] text-[14px] font-medium leading-relaxed text-on-surface-variant">
              {supportiveMessage}
            </p>
          </section>

          <section
            className={`cycle-card-rise mb-8 rounded-[2.25rem] border border-white/85 bg-white/72 px-6 py-7 shadow-[0_18px_45px_rgba(44,28,17,0.06)] backdrop-blur-xl ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "80ms" }}
          >
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Symptom intensity
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-on-surface">
                  Last 7 Days
                </h3>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <LegendDot label="Mild" className="bg-[#e5e2dd]" />
                <LegendDot label="Mod" className="bg-primary/40" />
                <LegendDot label="Intense" className="bg-primary" />
              </div>
            </div>

            {menopauseState.logs.length > 0 ? (
              <>
                <div className="flex h-40 items-end justify-between gap-2">
                  {weekData.map((bar, index) => {
                    const active = index === safeActiveDay;
                    const mildHeight = (bar.mildCount / maxDailyCount) * 100;
                    const moderateHeight = (bar.moderateCount / maxDailyCount) * 100;
                    const intenseHeight = (bar.intenseCount / maxDailyCount) * 100;

                    return (
                      <button
                        key={bar.key}
                        type="button"
                        onClick={() => setActiveDay(index)}
                        className="group flex flex-1 flex-col items-center gap-1"
                      >
                        <div className="flex w-full flex-1 flex-col items-center justify-end gap-[2px]">
                          {intenseHeight > 0 ? (
                            <div
                              className={`w-full rounded-t-full transition-all ${
                                active ? "bg-primary" : "bg-primary/30"
                              }`}
                              style={{ height: `${intenseHeight}%` }}
                            />
                          ) : null}
                          {moderateHeight > 0 ? (
                            <div
                              className={`w-full transition-all ${
                                intenseHeight > 0 ? "" : "rounded-t-full"
                              } ${active ? "bg-primary/50" : "bg-primary/18"}`}
                              style={{ height: `${moderateHeight}%` }}
                            />
                          ) : null}
                          {mildHeight > 0 ? (
                            <div
                              className={`w-full rounded-b-full transition-all ${
                                intenseHeight === 0 && moderateHeight === 0
                                  ? "rounded-t-full"
                                  : ""
                              } ${active ? "bg-[#dcd9d4]" : "bg-[#ece9e3]"}`}
                              style={{ height: `${mildHeight}%` }}
                            />
                          ) : null}
                        </div>
                        <span
                          className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                            active ? "text-primary" : "text-on-surface-variant/50"
                          }`}
                        >
                          {bar.shortLabel}
                        </span>
                        {active ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-white/80 bg-white/82 p-3 shadow-[0_10px_24px_rgba(44,28,17,0.04)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/55">
                    {selectedDay.label}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <CountPill count={selectedDay.mildCount} label="mild" className="bg-[#f0ede9] text-on-surface-variant" />
                    <CountPill count={selectedDay.moderateCount} label="moderate" className="bg-primary/8 text-primary" />
                    <CountPill count={selectedDay.intenseCount} label="intense" className="bg-primary/16 text-primary" />
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-[1.7rem] border border-white/85 bg-white/82 p-6 text-center shadow-[0_10px_24px_rgba(44,28,17,0.04)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/8 text-primary">
                  <FlameIcon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-[1.1rem] font-semibold tracking-tight text-on-surface">
                  Not enough data yet
                </h4>
                <p className="mt-2 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                  This weekly view will stay calm until you log a few symptom check-ins. Start with one note whenever you feel ready.
                </p>
              </div>
            )}
          </section>

          <section
            className={`cycle-card-rise mb-8 overflow-hidden rounded-[2.2rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,243,237,0.96))] p-6 shadow-[0_18px_42px_rgba(44,28,17,0.06)] ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "160ms" }}
          >
            <div className="relative">
              <div className="absolute -right-10 -top-8 h-28 w-28 rounded-full bg-primary/6 blur-3xl" />
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-5">
                <div className="relative mt-1 flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.4rem] border border-white/80 bg-white shadow-[0_10px_24px_rgba(44,28,17,0.06)]">
                  <Bloop
                    state={menopauseBloopState}
                    animated
                    size="medium"
                    accessibilityLabel="Bloop menopause guide"
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div className="min-w-0 pt-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/68">
                      Bloop&apos;s insight
                    </p>
                    <span className="rounded-full border border-primary/8 bg-primary/8 px-3 py-1 text-[10px] font-semibold text-primary">
                      {todayData.totalCount > 0 ? "Supportive pacing" : "First check-in"}
                    </span>
                  </div>
                  <p className="mt-4 max-w-[16.75rem] text-[15px] font-medium leading-[1.7] tracking-[-0.01em] text-on-surface">
                    {todayData.totalCount === 0
                      ? "You do not need to over-log. One gentle symptom note is enough to begin seeing patterns."
                      : todayData.intenseCount > 0
                        ? "A softer tone matters today. Cooling rituals, breathable layers, and fewer demands can help."
                        : "Your symptoms look manageable today. Staying consistent with calm tracking is more useful than adding pressure."}
                  </p>
                </div>

                <div className="col-span-2 rounded-[1.45rem] border border-white/80 bg-white/82 p-3.5 shadow-[0_10px_24px_rgba(44,28,17,0.04)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
                      <HeartIcon className="h-4 w-4" />
                    </div>
                    <p className="text-[12px] font-medium leading-snug text-on-surface-variant">
                      What you&apos;re experiencing is{" "}
                      <span className="font-bold text-primary">valid and normal.</span>{" "}
                      This screen stays supportive instead of overly cheerful on harder days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`cycle-card-rise mb-8 rounded-[2.2rem] border border-white/85 bg-white/76 p-6 shadow-[0_18px_42px_rgba(44,28,17,0.05)] backdrop-blur-xl ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "240ms" }}
          >
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/80 bg-white/82 p-3.5 shadow-[0_8px_20px_rgba(44,28,17,0.04)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-secondary-container/40 text-secondary">
                  <PillIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-on-surface">
                    HRT Protocol
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/55">
                    Track if taken today
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  updateMenopauseState({ hrtOn: !menopauseState.hrtOn })
                }
                className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${
                  menopauseState.hrtOn ? "bg-secondary" : "bg-outline-variant"
                }`}
                role="switch"
                aria-checked={menopauseState.hrtOn}
                aria-label="HRT taken today"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                    menopauseState.hrtOn
                      ? "left-[calc(100%-1.25rem-0.25rem)]"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ActionCard
                icon={<FlameIcon className="h-5 w-5" />}
                title="Log hot flash"
                detail="Quick moderate log"
                onClick={() => handleQuickLog("moderate")}
              />
              <ActionCard
                icon={<MoonIcon className="h-5 w-5" />}
                title="Log night sweat"
                detail="Save a softer overnight note"
                onClick={() => {
                  addMenopauseLog({
                    symptom: "night_sweat",
                    intensity: "mild",
                    note: "Quick night comfort check-in",
                  });
                  setShowLogNotice(true);
                }}
              />
            </div>
          </section>

          <section
            className={`cycle-card-rise mb-8 rounded-[2rem] border border-white/85 bg-white/78 p-5 shadow-[0_14px_34px_rgba(44,28,17,0.05)] ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "320ms" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/65">
                  Selected day
                </p>
                <h4 className="mt-1 text-[1.05rem] font-semibold tracking-tight text-on-surface">
                  {selectedDay.label}
                </h4>
              </div>
              <span className="rounded-full bg-primary/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                {selectedDay.totalCount} logged
              </span>
            </div>

            {selectedDay.logs.length > 0 ? (
              <div className="space-y-3">
                {selectedDay.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/72 px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/8 text-primary">
                        <FlameIcon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-on-surface">
                          {formatLogTime(log.savedAt)}
                        </p>
                        <p className="text-[10px] font-medium text-on-surface-variant/60">
                          {formatSymptomLabel(log.symptom)}
                          {log.note ? ` · ${log.note}` : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold ${intensityColor[log.intensity]}`}
                    >
                      {intensityLabel[log.intensity]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.6rem] border border-white/80 bg-white/82 p-5 text-center shadow-[0_8px_20px_rgba(44,28,17,0.04)]">
                <p className="text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                  No symptom notes for this day yet. That&apos;s okay. Empty days should feel calm, not broken.
                </p>
              </div>
            )}
          </section>
        </main>

        <button
          type="button"
          onClick={() => handleQuickLog("moderate")}
          className="absolute bottom-[calc(env(safe-area-inset-bottom)+7.5rem)] right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#bc563a] to-[#9c3e24] text-white shadow-[0_12px_28px_rgba(156,62,36,0.22)] transition-transform hover:scale-105 active:scale-95"
          aria-label="Log hot flash"
        >
          <FlameIcon className="h-6 w-6" />
        </button>

        <SanctuaryBottomNav />

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

function buildWeekData(logs: MenopauseSupportLog[], anchorDate: Date): WeekDayData[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(anchorDate, index - 6);
    const key = getDateKey(date);
    const dayLogs = logs.filter((log) => getDateKey(new Date(log.savedAt)) === key);

    return {
      key,
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      shortLabel: date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
      date,
      logs: dayLogs,
      mildCount: dayLogs.filter((log) => log.intensity === "mild").length,
      moderateCount: dayLogs.filter((log) => log.intensity === "moderate").length,
      intenseCount: dayLogs.filter((log) => log.intensity === "intense").length,
      totalCount: dayLogs.length,
    };
  });
}

function CountPill({
  count,
  label,
  className,
}: {
  count: number;
  label: string;
  className: string;
}) {
  if (count === 0) {
    return null;
  }

  return (
    <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${className}`}>
      {count} {label}
    </span>
  );
}

function LegendDot({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${className}`} />
      <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/60">
        {label}
      </span>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  detail,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[7.5rem] flex-col items-start justify-between rounded-[1.7rem] border border-white/80 bg-white/82 p-4 text-left shadow-[0_10px_24px_rgba(44,28,17,0.04)] transition hover:bg-[#fffaf7] active:scale-[0.99]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-primary/8 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-semibold text-on-surface">{title}</p>
        <p className="mt-1 text-[11px] font-medium text-on-surface-variant/70">
          {detail}
        </p>
      </div>
    </button>
  );
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function getTodayAtNoon() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today;
}

function getDateKey(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
    .toISOString()
    .slice(0, 10);
}

function formatLogTime(savedAt: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(savedAt));
  } catch {
    return "Recent";
  }
}

function formatSymptomLabel(symptom: MenopauseSupportLog["symptom"]) {
  switch (symptom) {
    case "night_sweat":
      return "Night sweat";
    case "brain_fog":
      return "Brain fog";
    case "anxiety":
      return "Anxiety";
    case "insomnia":
      return "Insomnia";
    case "hot_flash":
    default:
      return "Hot flash";
  }
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h8" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-.5-2.5-2.5-4.5C9 12 8.5 13.12 8.5 14.5Z" />
      <path d="M12 2c0 6-6 8-6 13a6 6 0 0 0 12 0c0-5-6-7-6-13Z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

function PillIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="M8.5 8.5 16 16" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function BotanicalLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <path d="M0 100C30 100 50 70 50 50C50 30 70 0 100 0C70 20 50 50 50 70C50 90 30 100 0 100Z" />
    </svg>
  );
}

function BotanicalPetal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <path d="M50 10C65 30 90 40 90 60C90 80 65 90 50 100C35 90 10 80 10 60C10 40 35 30 50 10Z" />
    </svg>
  );
}
