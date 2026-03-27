"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { DailyEntrySheet } from "@/components/daily-entry-sheet";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { SanctuaryMenuSheet } from "@/components/sanctuary-menu-sheet";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import {
  buildDailyEntryDraft,
  useDailyEntryRecord,
} from "@/lib/use-daily-entry-state";
import { useFertilityLogRecord } from "@/lib/use-fertility-log-state";
import { usePregnancySupportState } from "@/lib/use-pregnancy-support-state";
import { useAdolescenceSupportState } from "@/lib/use-adolescence-support-state";
import { useMenopauseSupportState } from "@/lib/use-menopause-support-state";

const HISTORY_FILTERS = [
  "All",
  "Cycle",
  "Mood",
  "Symptoms",
  "Fertility",
  "Pregnancy",
  "Menopause",
] as const;

type HistoryFilter = (typeof HISTORY_FILTERS)[number];

type LogCategory =
  | "cycle"
  | "mood"
  | "symptom"
  | "fertility"
  | "pregnancy"
  | "menopause"
  | "adolescence";

type HistoryLog = {
  id: string;
  category: LogCategory;
  title: string;
  description: string;
  time: string;
  icon: ReactNode;
  colorClass: string;
  savedAt: string;
};

type HistoryDay = {
  id: string;
  dateLabel: string;
  logs: HistoryLog[];
};

export function HealthHistoryScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>("All");
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { formState } = useOnboardingFormState();
  const { dailyEntry, saveDailyEntry } = useDailyEntryRecord();
  const { fertilityLog } = useFertilityLogRecord();
  const { pregnancyState } = usePregnancySupportState();
  const { adolescenceState } = useAdolescenceSupportState();
  const { menopauseState } = useMenopauseSupportState();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const history = useMemo(
    () =>
      buildHistoryDays({
        dailyEntry,
        fertilityLog,
        pregnancyState,
        adolescenceState,
        menopauseState,
      }),
    [adolescenceState, dailyEntry, fertilityLog, menopauseState, pregnancyState],
  );

  const filteredHistory = history
    .map((day) => ({
      ...day,
      logs: day.logs.filter((log) => matchesFilter(log.category, activeFilter)),
    }))
    .filter((day) => day.logs.length > 0);

  const chartPoints = useMemo(
    () => buildTrendPoints(filteredHistory),
    [filteredHistory],
  );

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#fffcf9] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[10%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-[#f4ddd6]/20 blur-[80px]" />
          <div className="absolute -right-[15%] top-[40%] h-[20rem] w-[20rem] rounded-full bg-[#d5e9bf]/15 blur-[90px]" />
          <div className="absolute bottom-[5%] left-[20%] h-[18rem] w-[18rem] rounded-full bg-primary/4 blur-[100px]" />
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_30%,rgba(156,62,36,0.06),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(82,100,66,0.05),transparent_25%)]" />
        </div>

        <header className="sticky top-0 z-50 flex items-center justify-between bg-[#fcf9f4]/85 px-6 py-4 backdrop-blur-xl shadow-sm md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <button
            type="button"
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-md transition hover:bg-white active:scale-95"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5 text-on-surface-variant transition-colors group-hover:text-primary" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold tracking-[0.08em] text-primary">
              History
            </h1>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-[#f4ddd6]/30 active:scale-95"
            onClick={() => setActiveFilter("All")}
            aria-label="Reset history filters"
          >
            <CalendarIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="sticky top-[72px] z-40 border-b border-surface-container/30 bg-[#fcf9f4]/85 py-4 shadow-[0_4px_16px_rgba(28,28,25,0.015)] backdrop-blur-md">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 pr-8 snap-x">
            {HISTORY_FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`snap-start shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-[#f5ded7] text-primary shadow-sm"
                      : "bg-[#f6f3ee] text-on-surface-variant hover:bg-[#ebe8e3] font-medium"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <main className="relative z-20 flex-1 overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+12rem)] pt-6 space-y-9">
          <HealthTrendChart
            filter={activeFilter}
            isLoaded={isLoaded}
            points={chartPoints}
            hasLogs={filteredHistory.length > 0}
          />

          {filteredHistory.length > 0 ? (
            filteredHistory.map((day, dayIndex) => (
              <section
                key={day.id}
                className={`cycle-enter ${isLoaded ? "opacity-100" : "opacity-0"}`}
                style={{ animationDelay: `${dayIndex * 100}ms` }}
              >
                <header className="mb-4 flex items-center gap-4">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-outline opacity-70">
                    {day.dateLabel}
                  </h2>
                  <div className="h-[1px] flex-grow bg-outline-variant/20" />
                </header>

                <div className="space-y-4">
                  {day.logs.map((log, logIndex) => (
                    <div
                      key={log.id}
                      className="group flex items-center rounded-2xl border border-surface-container/50 bg-[#FFFDFC] p-5 shadow-[0_4px_20px_rgba(28,28,25,0.03)] transition-all duration-500 hover:shadow-[0_8px_30px_rgba(28,28,25,0.06)]"
                      style={{ animationDelay: `${dayIndex * 100 + logIndex * 80}ms` }}
                    >
                      <div className={`mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${log.colorClass}`}>
                        {log.icon}
                      </div>
                      <div className="min-w-0 flex-grow pr-2">
                        <h3 className="truncate text-sm font-semibold text-on-surface">
                          {log.title}
                        </h3>
                        <p className="mt-0.5 line-clamp-2 text-xs text-on-surface-variant opacity-80">
                          {log.description}
                        </p>
                      </div>
                      <div className="pl-2 text-right text-[10px] font-medium uppercase tracking-wider text-outline">
                        {log.time}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className={`cycle-enter flex flex-col items-center justify-center px-4 py-20 text-center ${isLoaded ? "opacity-100" : "opacity-0"}`}>
              <div className="relative mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-primary/5">
                <HeartIcon className="h-12 w-12 text-primary/30" />
              </div>
              <h4 className="text-lg font-semibold text-on-surface">
                No records yet
              </h4>
              <p className="mt-2 max-w-[17rem] text-[13px] font-light text-on-surface-variant">
                {activeFilter === "All"
                  ? "Your history will start here after your first check-in. Start logging to see patterns over time."
                  : `No ${activeFilter.toLowerCase()} records yet. The timeline will stay calm until you save one.`}
              </p>
            </div>
          )}
        </main>

        <button
          className="absolute bottom-[calc(env(safe-area-inset-bottom)+7.5rem)] right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
          onClick={() => setIsQuickLogOpen(true)}
          aria-label="Add new log"
        >
          <AddIcon className="h-6 w-6" />
        </button>

        <SanctuaryBottomNav />

        {isQuickLogOpen ? (
          <DailyEntrySheet
            initialDraft={buildDailyEntryDraft(dailyEntry)}
            hasExistingEntry={Boolean(dailyEntry)}
            onClose={() => setIsQuickLogOpen(false)}
            onSave={(draft) => {
              saveDailyEntry(draft);
              setIsQuickLogOpen(false);
            }}
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

function buildHistoryDays(params: {
  dailyEntry: ReturnType<typeof useDailyEntryRecord>["dailyEntry"];
  fertilityLog: ReturnType<typeof useFertilityLogRecord>["fertilityLog"];
  pregnancyState: ReturnType<typeof usePregnancySupportState>["pregnancyState"];
  adolescenceState: ReturnType<typeof useAdolescenceSupportState>["adolescenceState"];
  menopauseState: ReturnType<typeof useMenopauseSupportState>["menopauseState"];
}) {
  const logs: HistoryLog[] = [];
  const {
    dailyEntry,
    fertilityLog,
    pregnancyState,
    adolescenceState,
    menopauseState,
  } = params;

  if (dailyEntry) {
    logs.push({
      id: `${dailyEntry.savedAt}-mood`,
      category: "mood",
      title: "Mood Logged",
      description: capitalize(dailyEntry.mood),
      time: formatTime(dailyEntry.savedAt),
      savedAt: dailyEntry.savedAt,
      icon: <HeartIcon className="h-5 w-5" />,
      colorClass: "bg-[#f5ded7]/40 text-[#9c3e24]",
    });

    logs.push({
      id: `${dailyEntry.savedAt}-cycle`,
      category: "cycle",
      title: "Cycle Update",
      description: `${capitalize(dailyEntry.flow)} flow`,
      time: formatTime(dailyEntry.savedAt),
      savedAt: dailyEntry.savedAt,
      icon: <WaterDropIcon className="h-5 w-5" />,
      colorClass: "bg-[#FFEAE5] text-primary",
    });

    if (dailyEntry.symptoms.length > 0) {
      logs.push({
        id: `${dailyEntry.savedAt}-symptoms`,
        category: "symptom",
        title: "Symptoms Noted",
        description: dailyEntry.symptoms.map(formatToken).join(" • "),
        time: formatTime(dailyEntry.savedAt),
        savedAt: dailyEntry.savedAt,
        icon: <BodyScanIcon className="h-5 w-5" />,
        colorClass: "bg-secondary-container/30 text-secondary",
      });
    }
  }

  if (fertilityLog) {
    logs.push({
      id: `${fertilityLog.savedAt}-fertility`,
      category: "fertility",
      title: "Fertility Signals Saved",
      description: `${capitalize(fertilityLog.lhResult)} LH • ${fertilityLog.basalTemp.toFixed(1)}°F`,
      time: formatTime(fertilityLog.savedAt),
      savedAt: fertilityLog.savedAt,
      icon: <FlameIcon className="h-5 w-5" />,
      colorClass: "bg-primary/10 text-primary",
    });
  }

  if (pregnancyState.lastUpdatedAt) {
    if (pregnancyState.kickCount > 0) {
      logs.push({
        id: `${pregnancyState.lastUpdatedAt}-kick`,
        category: "pregnancy",
        title: "Kick Count",
        description: `${pregnancyState.kickCount} movements logged`,
        time: formatTime(pregnancyState.lastUpdatedAt),
        savedAt: pregnancyState.lastUpdatedAt,
        icon: <BabyKickIcon className="h-5 w-5" />,
        colorClass: "bg-[#d5e9bf]/40 text-secondary",
      });
    }

    if (pregnancyState.waterCups > 0) {
      logs.push({
        id: `${pregnancyState.lastUpdatedAt}-hydration`,
        category: "pregnancy",
        title: "Hydration Updated",
        description: `${pregnancyState.waterCups} cups tracked today`,
        time: formatTime(pregnancyState.lastUpdatedAt),
        savedAt: pregnancyState.lastUpdatedAt,
        icon: <WaterDropIcon className="h-5 w-5" />,
        colorClass: "bg-[#f5ded7]/40 text-primary",
      });
    }
  }

  if (adolescenceState.lastUpdatedAt) {
    logs.push({
      id: `${adolescenceState.lastUpdatedAt}-adolescence`,
      category: "mood",
      title: "Check-in Saved",
      description: `${capitalize(adolescenceState.mood)} mood • ${formatToken(adolescenceState.ritualId)}`,
      time: formatTime(adolescenceState.lastUpdatedAt),
      savedAt: adolescenceState.lastUpdatedAt,
      icon: <HeartIcon className="h-5 w-5" />,
      colorClass: "bg-[#f5ded7]/35 text-primary",
    });
  }

  menopauseState.logs.forEach((log) => {
    logs.push({
      id: log.id,
      category: "menopause",
      title: "Menopause Symptom",
      description: `${formatSymptom(log.symptom)} • ${capitalize(log.intensity)}`,
      time: formatTime(log.savedAt),
      savedAt: log.savedAt,
      icon: <FlameIcon className="h-5 w-5" />,
      colorClass: "bg-primary/10 text-primary",
    });
  });

  const grouped = new Map<string, HistoryLog[]>();

  logs
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .forEach((log) => {
      const key = getDateKey(new Date(log.savedAt));
      const existing = grouped.get(key) ?? [];
      existing.push(log);
      grouped.set(key, existing);
    });

  return Array.from(grouped.entries()).map(([key, dayLogs]) => ({
    id: key,
    dateLabel: formatDateLabel(key),
    logs: dayLogs,
  }));
}

function matchesFilter(category: LogCategory, filter: HistoryFilter) {
  if (filter === "All") return true;
  if (filter === "Cycle") return category === "cycle";
  if (filter === "Mood") return category === "mood" || category === "adolescence";
  if (filter === "Symptoms") return category === "symptom";
  if (filter === "Fertility") return category === "fertility";
  if (filter === "Pregnancy") return category === "pregnancy";
  if (filter === "Menopause") return category === "menopause";
  return false;
}

function buildTrendPoints(days: HistoryDay[]) {
  const counts = days.slice(0, 7).map((day) => day.logs.length).reverse();
  if (counts.length === 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }

  const padded = [...counts];
  while (padded.length < 7) {
    padded.unshift(0);
  }

  return padded;
}

function HealthTrendChart({
  filter,
  isLoaded,
  points,
  hasLogs,
}: {
  filter: HistoryFilter;
  isLoaded: boolean;
  points: number[];
  hasLogs: boolean;
}) {
  const width = 300;
  const height = 90;
  const padding = 12;
  const max = Math.max(...points, 1);
  const min = 0;
  const range = max - min || 1;
  const stepX = width / Math.max(points.length - 1, 1);
  const mappedPoints = points.map((value, index) => ({
    x: index * stepX,
    y: height - padding - ((value - min) / range) * (height - padding * 2),
  }));

  let pathData = `M ${mappedPoints[0]?.x ?? 0},${mappedPoints[0]?.y ?? height} `;
  for (let index = 0; index < mappedPoints.length - 1; index += 1) {
    const current = mappedPoints[index];
    const next = mappedPoints[index + 1];
    const middleX = (current.x + next.x) / 2;
    pathData += `C ${middleX},${current.y} ${middleX},${next.y} ${next.x},${next.y} `;
  }
  const areaPath = `${pathData} L ${width},${height} L 0,${height} Z`;

  return (
    <section className={`cycle-enter transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
      <div className="overflow-hidden rounded-[1.4rem] border border-white/75 bg-white/60 p-5 shadow-[0_8px_30px_rgba(28,28,25,0.04)] backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9c3e24]/80">
            {filter === "All" ? "Overall Trend" : `${filter} Insight`}
          </h3>
          <span className="rounded-full bg-[#f4ddd6]/50 px-2.5 py-1 text-[9px] font-bold text-[#9c3e24]/80">
            Last 7 Days
          </span>
        </div>

        {hasLogs ? (
          <div className="relative h-[90px] w-full">
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id={`history-gradient-${filter}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9c3e24" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f5ded7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill={`url(#history-gradient-${filter})`} />
              <path d={pathData} fill="none" stroke="#9c3e24" strokeWidth="2.5" strokeLinecap="round" />
              {mappedPoints.map((point, index) => (
                <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="3.5" fill="#fff" stroke="#9c3e24" strokeWidth="2" />
              ))}
            </svg>
          </div>
        ) : (
          <div className="rounded-[1.2rem] bg-[#fff7f3] px-4 py-6 text-center text-[12px] font-medium text-on-surface-variant">
            Not enough data yet. Your trend will appear here after the first few check-ins.
          </div>
        )}
      </div>
    </section>
  );
}

function getDateKey(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)
    .toISOString()
    .slice(0, 10);
}

function formatDateLabel(key: string) {
  const date = new Date(`${key}T12:00:00`);
  const todayKey = getDateKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (key === todayKey) {
    return "Today";
  }

  if (key === getDateKey(yesterday)) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(savedAt: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(savedAt));
  } catch {
    return "Recent";
  }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatToken(value: string) {
  return value
    .split("_")
    .map(capitalize)
    .join(" ");
}

function formatSymptom(value: string) {
  return formatToken(value);
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h8" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
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

function WaterDropIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 21.05C9.45 21.05 7.375 20.15 5.775 18.35C4.175 16.55 3.375 14.45 3.375 12.05C3.375 10.3833 3.86667 8.78333 4.85 7.25C5.83333 5.71667 7.08333 4.25 8.6 2.85C9.56667 1.95 10.6667 1.13333 11.9 0.4L12 0.35L12.1 0.4C13.3333 1.13333 14.4333 1.95 15.4 2.85C16.9167 4.25 18.1667 5.71667 19.15 7.25C20.1333 8.78333 20.625 10.3833 20.625 12.05C20.625 14.45 19.825 16.55 18.225 18.35C16.625 20.15 14.55 21.05 12 21.05Z" />
    </svg>
  );
}

function BodyScanIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3Z" />
      <path d="M10 11v6l-2-2" />
      <path d="M14 11v6l2-2" />
      <path d="M8 22l4-8 4 8" />
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

function BabyKickIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3c3.8 0 7 3.13 7 7 0 5-4.1 8.43-7 10-2.9-1.57-7-5-7-10 0-3.87 3.2-7 7-7Z" />
      <path d="M10 12c1.5-1 2.5-1.1 4 0" />
    </svg>
  );
}

function AddIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M12 5v14m-7-7h14" />
    </svg>
  );
}
