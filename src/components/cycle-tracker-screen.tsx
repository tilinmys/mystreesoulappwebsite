"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { DailyEntrySheet } from "@/components/daily-entry-sheet";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { SanctuaryMenuSheet } from "@/components/sanctuary-menu-sheet";
import {
  buildDateRail,
  buildTemperatureSeries,
  formatDateValue,
  getCurrentCycleDay,
  getCyclePhase,
  getDaysUntilNextPeriod,
  getMonthYearLabel,
  getMonthShortLabel,
  getTemperatureForCycleDay,
  getTodayAtNoon,
  getWeekdayLabel,
  isSameDay,
  parseDateValue,
} from "@/lib/cycle-tracker";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import {
  buildDailyEntryDraft,
  type DailyEntryRecord,
  useDailyEntryRecord,
} from "@/lib/use-daily-entry-state";

export function CycleTrackerScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSavedNotice, setShowSavedNotice] = useState(false);
  const [todayKey] = useState(() => formatDateValue(getTodayAtNoon()));
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const { formState } = useOnboardingFormState();
  const { dailyEntry, saveDailyEntry } = useDailyEntryRecord();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const today = parseDateValue(todayKey);
  const selectedDate = parseDateValue(selectedDateKey);
  const cycleStart = formState.lastCycleDate
    ? parseDateValue(formState.lastCycleDate)
    : today;
  const cycleDay = getCurrentCycleDay(
    cycleStart,
    formState.cycleLength,
    selectedDate,
  );
  const phase = getCyclePhase(
    cycleDay,
    formState.cycleLength,
    formState.flowDuration,
  );
  const daysUntilNextPeriod = getDaysUntilNextPeriod(
    cycleDay,
    formState.cycleLength,
  );
  const temperatureSeries = buildTemperatureSeries(
    selectedDate,
    cycleStart,
    formState.cycleLength,
    formState.flowDuration,
  );
  const currentTemperature = getTemperatureForCycleDay(
    cycleDay,
    formState.cycleLength,
    formState.flowDuration,
  );
  const chartModel = buildChartModel(temperatureSeries);
  const railDates = buildDateRail(today, 9);
  const isTodaySelected = selectedDateKey === todayKey;
  const visibleEntry = isTodaySelected ? dailyEntry : null;
  const bloopMessage = getBloopMessage(phase, visibleEntry);
  const quickLogSummary = getQuickLogSummary(visibleEntry);

  function handleOpenQuickLog() {
    if (process.env.NODE_ENV !== "production") {
      console.info("[cycle-tracker] opening quick log");
    }
    setIsQuickLogOpen(true);
  }

  function handleCloseQuickLog() {
    setIsQuickLogOpen(false);
  }

  function handleSaveQuickLog(draft: ReturnType<typeof buildDailyEntryDraft>) {
    saveDailyEntry(draft);
    setIsQuickLogOpen(false);
    setShowSavedNotice(true);
    setSelectedDateKey(todayKey);
    window.setTimeout(() => setShowSavedNotice(false), 2200);
  }

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#fffdf9] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[16%] -top-[8%] h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-[92px]" />
          <div className="absolute -right-[16%] top-[32%] h-[22rem] w-[22rem] rounded-full bg-[#f4ddd6]/55 blur-[96px]" />
          <div className="absolute bottom-[4%] left-[8%] h-[18rem] w-[18rem] rounded-full bg-secondary/6 blur-[110px]" />
          <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_18%,rgba(156,62,36,0.06),transparent_20%),radial-gradient(circle_at_78%_42%,rgba(188,86,58,0.05),transparent_22%),radial-gradient(circle_at_30%_84%,rgba(82,100,66,0.04),transparent_24%)]" />
          <div
            className={`absolute -right-20 top-16 h-72 w-72 text-primary/6 transition-opacity duration-1000 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <BotanicalPetal className="float-slow h-full w-full rotate-12 object-contain" />
          </div>
          <div
            className={`absolute -left-20 bottom-40 h-80 w-80 text-[#d5e9bf]/18 transition-opacity duration-1000 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <BotanicalLeaf className="sway-slow h-full w-full -rotate-6 object-contain" />
          </div>
        </div>

        {showSavedNotice ? (
          <div className="pointer-events-none absolute left-1/2 top-24 z-[75] -translate-x-1/2 md:top-28">
            <div className="rounded-full border border-white/80 bg-white/92 px-4 py-2 text-[11px] font-semibold tracking-wide text-primary shadow-[0_10px_24px_rgba(156,62,36,0.14)] backdrop-blur-md">
              Daily entry saved
            </div>
          </div>
        ) : null}

        <header className="relative z-30 flex items-center justify-between bg-white/78 px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <button
            type="button"
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-md transition hover:bg-white active:scale-95"
            onClick={() => {
              if (process.env.NODE_ENV !== "production") {
                console.info("[cycle-tracker] opening sanctuary menu");
              }
              setIsMenuOpen(true);
            }}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5 text-on-surface-variant transition-colors group-hover:text-primary" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-primary/65">
              Home
            </p>
            <h1 className="mt-1 text-sm font-semibold tracking-[0.14em] text-on-surface">
              Cycle Tracker
            </h1>
          </div>
          <button
            type="button"
            onClick={handleOpenQuickLog}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Log today"
          >
            <VitalsIcon className="h-5 w-5" />
          </button>
        </header>

        <main className="relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+10.5rem)] pt-6">
          <section className={`cycle-enter mb-8 text-center ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
              {isTodaySelected ? "Today's rhythm" : "Selected day"}
            </p>
            <h2 className="text-[2rem] font-light leading-tight tracking-tight text-on-surface">
              Your energy is{" "}
              <span className="font-medium italic text-primary">
                {phase.headline}
              </span>
            </h2>
            <p className="mx-auto mt-3 max-w-[19rem] text-[14px] font-medium leading-relaxed text-on-surface-variant">
              {phase.narrativeBody}
            </p>
          </section>

          <section
            className={`cycle-card-rise mb-8 rounded-[2.25rem] border border-white/85 bg-white/72 px-6 py-7 shadow-[0_18px_45px_rgba(44,28,17,0.06)] backdrop-blur-xl ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative flex h-56 w-56 items-center justify-center">
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 100 100"
                  aria-hidden="true"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#efe6e0"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={phase.ringStroke}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(cycleDay / Math.max(formState.cycleLength, 1)) * 282.7} 282.7`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.96)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="1 282.7"
                    strokeDashoffset={getMarkerOffset(
                      cycleDay,
                      formState.cycleLength,
                    )}
                    className="cycle-marker"
                  />
                </svg>

                <div className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-full border border-white/85 bg-[#fffdfa] shadow-[inset_0_0_20px_rgba(255,255,255,0.9),0_16px_32px_rgba(156,62,36,0.08)]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                    Day of cycle
                  </span>
                  <span className="mt-1 text-[3.4rem] font-extralight leading-none tracking-tighter text-on-surface">
                    {cycleDay}
                  </span>
                  <span className="mt-2 text-sm font-semibold text-primary">
                    {phase.shortLabel}
                  </span>
                  <span className="mt-2 rounded-full bg-primary/7 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    {phase.badge}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="inline-flex items-center rounded-full border border-outline-variant/20 bg-[#faf4ef] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {phase.fertilityHeadline}
                </div>
                <div>
                  <h3 className="text-[1.55rem] font-semibold tracking-tight text-on-surface">
                    {phase.narrativeTitle}
                  </h3>
                  <p className="mt-2 max-w-[18.5rem] text-[14px] font-medium leading-relaxed text-on-surface-variant">
                    {phase.guidance}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-on-surface-variant">
                  <span className="rounded-full bg-surface-container-low px-3 py-2">
                    {daysUntilNextPeriod}
                    {"\u00A0"}days to next period
                  </span>
                  <span className="rounded-full bg-surface-container-low px-3 py-2">
                    {`${getMonthShortLabel(selectedDate)} ${selectedDate.getDate()}`}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`cycle-card-rise mb-8 rounded-[2.15rem] border border-white/85 bg-white/76 p-5 shadow-[0_16px_40px_rgba(44,28,17,0.05)] backdrop-blur-xl ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "180ms" }}
          >
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Cycle window
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-on-surface">
                  {getMonthYearLabel(today)}
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-primary">
                {isTodaySelected ? "Today selected" : "Tap a day"}
              </span>
            </div>

            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 hide-scrollbar">
              {railDates.map((date) => {
                const railCycleDay = getCurrentCycleDay(
                  cycleStart,
                  formState.cycleLength,
                  date,
                );
                const railPhase = getCyclePhase(
                  railCycleDay,
                  formState.cycleLength,
                  formState.flowDuration,
                );
                const active = selectedDateKey === formatDateValue(date);
                const todayMatch = isSameDay(date, today);

                return (
                  <button
                    key={formatDateValue(date)}
                    type="button"
                    onClick={() => setSelectedDateKey(formatDateValue(date))}
                    className={`flex min-w-[4.15rem] shrink-0 flex-col items-center rounded-[1.7rem] border px-3 py-4 text-center transition-all duration-300 ${
                      active
                        ? "border-primary/15 bg-[#fbf1ec] shadow-[0_14px_28px_rgba(156,62,36,0.11)]"
                        : "border-white/80 bg-[#fffdfa] hover:bg-[#fcf5f0]"
                    }`}
                    aria-pressed={active}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                        active ? "text-primary" : "text-on-surface-variant/65"
                      }`}
                    >
                      {getWeekdayLabel(date)}
                    </span>
                    <span className="mt-2 text-[1.2rem] font-semibold tracking-tight text-on-surface">
                      {date.getDate()}
                    </span>
                    <span
                      className={`mt-3 h-2.5 w-2.5 rounded-full ${
                        todayMatch
                          ? "bg-primary"
                          : getPhaseDotClass(railPhase.key)
                      }`}
                    />
                    <span className="mt-2 text-[10px] font-medium text-on-surface-variant/55">
                      Day {railCycleDay}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section
            id="bbt-section"
            className={`cycle-card-rise mb-8 rounded-[2.2rem] border border-white/85 bg-white/78 p-6 shadow-[0_18px_42px_rgba(44,28,17,0.06)] backdrop-blur-xl ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "240ms" }}
          >
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Basal body temp
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-on-surface">
                  Last 7 days
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[2rem] font-extralight tracking-tight text-secondary">
                  {currentTemperature.toFixed(1)}&deg;
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                  {phase.shortLabel}
                </p>
              </div>
            </div>

            <div className="relative h-52 rounded-[1.75rem] bg-[linear-gradient(180deg,rgba(250,246,241,0.9),rgba(255,255,255,0.96))] p-4">
              <div className="absolute inset-0 rounded-[1.75rem] bg-[radial-gradient(circle_at_50%_12%,rgba(156,62,36,0.08),transparent_42%)]" />
              <svg
                className="relative z-10 h-full w-full"
                viewBox="0 0 360 180"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="cycle-temp-line" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#dcb6a8" />
                    <stop offset="100%" stopColor="#526442" />
                  </linearGradient>
                  <linearGradient id="cycle-temp-area" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(156,62,36,0.16)" />
                    <stop offset="100%" stopColor="rgba(156,62,36,0)" />
                  </linearGradient>
                </defs>

                <path
                  d={chartModel.areaPath}
                  fill="url(#cycle-temp-area)"
                  opacity="0.95"
                />
                <path
                  d={chartModel.linePath}
                  fill="none"
                  stroke="url(#cycle-temp-line)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartModel.points.map((point, index) => (
                  <g key={`${point.x}-${point.y}`}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={index === chartModel.activeIndex ? 8 : 4}
                      fill={index === chartModel.activeIndex ? "#fff" : "#f3ddd4"}
                      opacity={index === chartModel.activeIndex ? 1 : 0.85}
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={index === chartModel.activeIndex ? 4 : 2.5}
                      fill={index === chartModel.activeIndex ? "#526442" : "#9c3e24"}
                    />
                  </g>
                ))}
              </svg>

              <div className="relative z-10 mt-3 flex justify-between px-1">
                {temperatureSeries.map((item, index) => (
                  <div
                    key={`${formatDateValue(item.date)}-${index}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                        index === temperatureSeries.length - 1
                          ? "text-secondary"
                          : "text-on-surface-variant/50"
                      }`}
                    >
                      {getWeekdayLabel(item.date)}
                    </span>
                    <span className="text-[10px] font-medium text-on-surface-variant/60">
                      {item.temperature.toFixed(1)}&deg;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            className={`cycle-card-rise mb-8 overflow-hidden rounded-[2.2rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(250,243,237,0.96))] p-6 shadow-[0_18px_42px_rgba(44,28,17,0.06)] ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "300ms" }}
          >
            <div className="relative">
              <div className="absolute -right-10 -top-8 h-28 w-28 rounded-full bg-primary/6 blur-3xl" />
              <div className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-5">
                <div className="relative mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] border border-white/80 bg-white shadow-[0_10px_24px_rgba(44,28,17,0.06)]">
                  <Bloop
                    state="inform"
                    animated
                    size="small"
                    accessibilityLabel="Bloop cycle guide"
                    className="h-9 w-9 object-contain"
                  />
                </div>
                <div className="min-w-0 pt-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/68">
                      Bloop&apos;s insight
                    </p>
                    <span className="rounded-full border border-primary/8 bg-primary/8 px-3 py-1 text-[10px] font-semibold text-primary">
                      {phase.tooltip}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] font-medium leading-[1.7] tracking-[-0.01em] text-on-surface">
                    {bloopMessage}
                  </p>
                </div>

                <div className="col-span-2 rounded-[1.45rem] border border-white/80 bg-white/82 p-3.5 shadow-[0_10px_24px_rgba(44,28,17,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
                        <PulseIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/55">
                          Quick log status
                        </p>
                        <p className="text-[12px] font-semibold leading-relaxed text-on-surface-variant">
                          {quickLogSummary}
                        </p>
                      </div>
                    </div>
                    <StatusBadge variant={visibleEntry ? "synced" : "pending"}>
                      {visibleEntry ? "Synced" : "Pending"}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`cycle-card-rise grid grid-cols-2 gap-4 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ animationDelay: "360ms" }}
          >
            <article
              className="flex min-h-[15.75rem] flex-col rounded-[2rem] border border-white/85 p-6 shadow-[0_14px_34px_rgba(44,28,17,0.05)]"
              style={{ backgroundColor: phase.cardTint }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/72 text-primary shadow-sm">
                <DropIcon className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/65">
                {phase.bodySignalTitle}
              </p>
              <h4 className="mt-3 text-[1.05rem] font-semibold tracking-tight text-on-surface">
                {phase.shortLabel}
              </h4>
              <p className="mt-3 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                {phase.bodySignalBody}
              </p>
              <div className="mt-auto pt-6">
                <span className="inline-flex rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary/85">
                  Cycle phase
                </span>
              </div>
            </article>

            <article className="flex min-h-[15.75rem] flex-col rounded-[2rem] border border-white/85 bg-white/78 p-6 shadow-[0_14px_34px_rgba(44,28,17,0.05)]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-[1rem] bg-secondary-container/50 text-secondary shadow-sm">
                <SupportBloomIcon className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/65">
                {phase.supportTitle}
              </p>
              <h4 className="mt-3 text-[1.05rem] font-semibold tracking-tight text-on-surface">
                Today&apos;s support
              </h4>
              <p className="mt-3 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                {phase.supportBody}
              </p>
              <div className="mt-auto pt-6">
                <span className="inline-flex rounded-full bg-[#f3f7eb] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
                  Guidance
                </span>
              </div>
            </article>
          </section>
        </main>

        <div className="pointer-events-none absolute bottom-[5.6rem] left-0 right-0 z-40 px-6">
          <div className="mx-auto flex max-w-[420px] justify-center">
            <button
              type="button"
              onClick={handleOpenQuickLog}
              className="pointer-events-auto group flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#bc563a] to-[#9c3e24] px-6 py-4 text-[13px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_16px_38px_rgba(156,62,36,0.26)] transition hover:brightness-105 active:scale-[0.98]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 transition-transform group-hover:rotate-12">
                <EditIcon className="h-[1.125rem] w-[1.125rem]" />
              </span>
              {dailyEntry ? "Update today's entry" : "Log today"}
            </button>
          </div>
        </div>

        <SanctuaryBottomNav />

        {isQuickLogOpen ? (
          <DailyEntrySheet
            initialDraft={buildDailyEntryDraft(dailyEntry)}
            hasExistingEntry={Boolean(dailyEntry)}
            onClose={handleCloseQuickLog}
            onSave={handleSaveQuickLog}
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

function buildChartModel(
  series: ReturnType<typeof buildTemperatureSeries>,
): {
  linePath: string;
  areaPath: string;
  points: Array<{ x: number; y: number }>;
  activeIndex: number;
} {
  const width = 360;
  const height = 180;
  const left = 14;
  const right = width - 14;
  const top = 18;
  const bottom = 126;
  const values = series.map((item) => item.temperature);
  const min = Math.min(...values) - 0.08;
  const max = Math.max(...values) + 0.08;

  const points = series.map((item, index) => {
    const x =
      left + (index * (right - left)) / Math.max(series.length - 1, 1);
    const y =
      bottom -
      ((item.temperature - min) / Math.max(max - min, 0.001)) *
        (bottom - top);

    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
    };
  });

  const linePath = points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlX = Number(((previous.x + point.x) / 2).toFixed(2));
    return `${path} Q ${controlX} ${previous.y} ${point.x} ${point.y}`;
  }, "");

  const first = points[0];
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x} ${height} L ${first.x} ${height} Z`;

  return {
    linePath,
    areaPath,
    points,
    activeIndex: points.length - 1,
  };
}

function getMarkerOffset(cycleDay: number, cycleLength: number) {
  const circumference = 282.7;
  const progress = cycleDay / Math.max(cycleLength, 1);
  return -(progress * circumference);
}

function getPhaseDotClass(phaseKey: ReturnType<typeof getCyclePhase>["key"]) {
  switch (phaseKey) {
    case "menstrual":
      return "bg-primary/45";
    case "follicular":
      return "bg-[#d9b3a5]";
    case "ovulatory":
      return "bg-secondary/70";
    case "luteal":
      return "bg-[#8c6557]";
    default:
      return "bg-outline-variant";
  }
}

function getBloopMessage(
  phase: ReturnType<typeof getCyclePhase>,
  dailyEntry: DailyEntryRecord | null,
) {
  if (!dailyEntry) {
    return phase.insight;
  }

  const symptomText =
    dailyEntry.symptoms.length > 0
      ? dailyEntry.symptoms
          .slice(0, 2)
          .map((symptom) => symptom.replace("_", " "))
          .join(" and ")
      : "no symptoms logged";

  return `I noticed a ${dailyEntry.flow} flow day with ${symptomText}. ${phase.supportBody}`;
}

function getQuickLogSummary(dailyEntry: DailyEntryRecord | null) {
  if (!dailyEntry) {
    return "No check-in saved for today yet. Log your flow, mood, or symptoms when you are ready.";
  }

  return `Saved today: ${capitalize(dailyEntry.mood)} mood, ${dailyEntry.flow} flow`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function StatusBadge({
  variant,
  children,
}: {
  variant: "synced" | "pending";
  children: ReactNode;
}) {
  const tone =
    variant === "synced"
      ? "bg-[#faf1eb] text-primary"
      : "bg-surface-container-low text-on-surface-variant";

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tone}`}
    >
      {children}
    </span>
  );
}

function VitalsIcon({ className }: { className?: string }) {
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
      <path d="M4 12h4l2 5 4-10 2 5h4" />
      <circle cx="12" cy="12" r="10" strokeOpacity="0.1" />
    </svg>
  );
}

function SupportBloomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
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

function DropIcon({ className }: { className?: string }) {
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
      <path d="M12 2s6 6.36 6 11a6 6 0 1 1-12 0C6 8.36 12 2 12 2Z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
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

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c4.1 0 7 2.96 7 7.2 0 5.36-4.72 9.8-7 10.8-2.28-1-7-5.44-7-10.8C5 4.96 7.9 2 12 2Z" />
      <path d="M12 6.5c.55 0 1 .45 1 1v7a1 1 0 1 1-2 0v-7c0-.55.45-1 1-1Z" fill="#fcf9f4" />
    </svg>
  );
}

function CareIcon({ className }: { className?: string }) {
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
      <path d="M4 12h4l2.2-5 3.6 10 2.2-5H20" />
      <path d="M12 3v2" />
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

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2v10l4.5 4.5" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h8" />
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
