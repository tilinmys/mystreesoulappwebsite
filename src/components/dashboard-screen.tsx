"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bloop, type BloopState } from "@/components/common/Bloop";
import { DashboardFirstSessionTutorial } from "@/components/dashboard-first-session-tutorial";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { DailyEntrySheet } from "@/components/daily-entry-sheet";
import { SanctuaryMenuSheet } from "@/components/sanctuary-menu-sheet";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { markAuthTutorialSeen } from "@/lib/auth-session";
import { normalizeSupportArea } from "@/lib/onboarding-questionnaire";
import { getPregnancyWeekAnswer } from "@/lib/pregnancy-support";
import { useAuthSessionState } from "@/lib/use-auth-session-state";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import {
  buildDailyEntryDraft,
  dismissDailyEntryPromptForToday,
  useDailyEntryRecord,
  type DailyEntryFlow,
  type DailyEntryMood,
  type DailyEntryRecord,
} from "@/lib/use-daily-entry-state";

const moodLabels: Record<DailyEntryMood, string> = {
  radiant: "Radiant",
  calm: "Calm",
  focus: "Focused",
  soft: "Soft",
  tender: "Tender",
};

const flowLabels: Record<DailyEntryFlow, string> = {
  none: "No flow",
  light: "Light flow",
  medium: "Medium flow",
  heavy: "Heavy flow",
};

export function DashboardScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [showSavedNotice, setShowSavedNotice] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const { session } = useAuthSessionState();
  const { formState } = useOnboardingFormState();
  const { dailyEntry, saveDailyEntry } = useDailyEntryRecord();
  const showTutorial = Boolean(
    session && !session.tutorialSeen && !tutorialDismissed,
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const today = new Date();
  const cycleStart = formState.lastCycleDate
    ? parseDateValue(formState.lastCycleDate)
    : today;
  const supportArea = normalizeSupportArea(formState.supportArea);
  const cycleDay = getCurrentCycleDay(cycleStart, formState.cycleLength, today);
  const phase = getDashboardPhase(
    cycleDay,
    formState.cycleLength,
    formState.flowDuration,
  );
  const supportIsPregnancy = supportArea === "pregnancy";
  const supportIsAdolescence = supportArea === "adolescence";
  const supportIsMenopause = supportArea === "menopause";
  const supportIsCycle =
    supportArea === "cycle_tracker" || supportArea === "fertility";
  const pregnancyWeek = supportIsPregnancy
    ? getPregnancyWeekAnswer(formState.questionnaireAnswers)
    : null;
  const daysUntilNextPeriod = Math.max(1, formState.cycleLength - cycleDay + 1);
  const dashboardHero = getDashboardHero({
    supportArea,
    phase,
    cycleDay,
    cycleLength: formState.cycleLength,
    pregnancyWeek,
  });
  const dashboardBloopState = getDashboardBloopState(supportArea, dailyEntry);
  const heroCompanionPosition = supportIsPregnancy
    ? "absolute -bottom-6 right-[-1.75rem] flex flex-col items-center"
    : "absolute -bottom-2 right-[-1rem] flex flex-col items-center";
  const heroTooltipPosition =
    "absolute -left-14 -top-6 flex items-center gap-2 rounded-full border border-outline-variant/20 bg-white/92 px-3 py-2 shadow-lg backdrop-blur-md";
  const latestEntrySummary = getDailyEntrySummary(dailyEntry);
  const quickLogLabel = dailyEntry
    ? "Update Today's Entry"
    : "Log Symptoms Today";
  const primaryDashboardCard = supportIsPregnancy
    ? {
        href: "/dashboard/pregnancy",
        label: "Pregnancy",
        title: `Week ${pregnancyWeek} care`,
        emphasis: "today",
        icon: CareIcon,
        iconClass: "bg-[#f5ded7]/70 text-primary",
        hoverClass: "hover:bg-[#fff6f0]",
        emphasisClass: "text-primary",
      }
    : supportIsMenopause
      ? {
          href: "/dashboard/menopause",
          label: "Menopause",
          title: "Track comfort",
          emphasis: "gently",
          icon: FlameNavIcon,
          iconClass: "bg-[#f5ded7]/70 text-primary",
          hoverClass: "hover:bg-[#fff5ef]",
          emphasisClass: "text-primary",
        }
      : supportIsAdolescence
        ? {
            href: "/dashboard/adolescence",
            label: "Adolescence",
            title: "Mood and ritual",
            emphasis: "support",
            icon: BloomIcon,
            iconClass: "bg-[#f5ded7]/70 text-primary",
            hoverClass: "hover:bg-[#fff7f1]",
            emphasisClass: "text-primary",
          }
        : {
            href: "/dashboard/cycle",
            label: "Cycle",
            title: "Next period in",
            emphasis: `${daysUntilNextPeriod} days`,
            icon: CalendarIcon,
            iconClass: "bg-primary/10 text-primary",
            hoverClass: "hover:bg-[#fdf6f1]",
            emphasisClass: "text-primary",
          };
  const secondarySupportCard = supportIsCycle
    ? {
        href: "/dashboard/fertility",
        label: "Fertility",
        title: phase.fertilityHeadline,
        emphasis: "today",
        icon: LeafIcon,
        iconClass: "bg-[#d2e6bc]/40 text-secondary",
        hoverClass: "hover:bg-[#f6faf2]",
        emphasisClass: "text-secondary",
      }
    : {
        href: "/dashboard/history",
        label: "Health Records",
        title: dailyEntry ? "Recent check-ins" : "Start logging",
        emphasis: dailyEntry ? "saved" : "today",
        icon: BookIcon,
        iconClass: "bg-[#f5ded7]/70 text-primary",
        hoverClass: "hover:bg-[#fff7f1]",
        emphasisClass: "text-primary",
      };
  const PrimaryDashboardIcon = primaryDashboardCard.icon;
  const SecondarySupportIcon = secondarySupportCard.icon;
  const dailyLogBloopState = dailyEntry
    ? "celebrate"
    : supportIsPregnancy
      ? "pregnancy"
      : supportIsMenopause
        ? "reassure"
        : supportIsAdolescence
          ? "adolescence"
          : "encourage";
  const primaryCardBloopState = supportIsPregnancy
    ? "pregnancy"
    : supportIsMenopause
      ? "menopause"
      : supportIsAdolescence
        ? "adolescence"
        : "inform";
  const secondaryCardBloopState = supportIsCycle ? "inform" : "empty";

  function handleCompleteTutorial() {
    markAuthTutorialSeen();
    setTutorialDismissed(true);
  }

  function handleOpenQuickLog() {
    setIsMenuOpen(false);
    setIsQuickLogOpen(true);
  }

  function handleCloseQuickLog() {
    setIsQuickLogOpen(false);
  }

  function handleSaveQuickLog(draft: ReturnType<typeof buildDailyEntryDraft>) {
    saveDailyEntry(draft);
    setIsQuickLogOpen(false);
    setShowSavedNotice(true);
    window.setTimeout(() => setShowSavedNotice(false), 2200);
  }

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#fdfaf7] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[12%] -top-[10%] h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-[90px]" />
          <div className="absolute -right-[8%] bottom-[8%] h-[28rem] w-[28rem] rounded-full bg-secondary/6 blur-[90px]" />
          <div className="absolute left-[18%] top-[38%] h-[18rem] w-[18rem] rounded-full bg-[#e9d5a3]/12 blur-[80px]" />
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute -left-[18%] -top-[12%] h-[36rem] w-[36rem] text-primary/6 mix-blend-multiply">
              <BotanicalPetal className="float-slow h-full w-full object-contain" />
            </div>
            <div className="absolute -bottom-[22%] -right-[18%] h-[44rem] w-[44rem] text-[#d5e9bf]/15 mix-blend-multiply">
              <BotanicalLeaf className="sway-slow h-full w-full rotate-45 object-contain" />
            </div>
          </div>
        </div>

        {showSavedNotice ? (
          <div className="pointer-events-none absolute left-1/2 top-24 z-[75] -translate-x-1/2 md:top-28">
            <div className="rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[11px] font-semibold tracking-wide text-primary shadow-[0_10px_24px_rgba(156,62,36,0.14)] backdrop-blur-md">
              Daily entry saved
            </div>
          </div>
        ) : null}

        <header
          id="dashboard-top"
          className="relative z-50 flex w-full items-center justify-between bg-white/72 px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]"
        >
          <button
            type="button"
            onClick={() => {
              if (process.env.NODE_ENV !== "production") {
                console.info("[dashboard] opening sanctuary menu");
              }
              setIsMenuOpen(true);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Open sanctuary menu"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[13px] font-extrabold uppercase tracking-[0.3em] text-primary">
              Home
            </span>
          </div>
          <Link
            href="/dashboard/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="View notifications"
          >
            <BellIcon className="h-6 w-6" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </header>

        <main className="relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-6">
          <section className="mb-10 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
                {dashboardHero.eyebrow}
                {formState.name ? `, ${formState.name}` : ""}
              </p>
              <h1 className="mb-2 text-[32px] font-light leading-tight tracking-tight text-on-surface">
                {dashboardHero.title} <br />
                <span className="font-medium italic text-primary">
                  {dashboardHero.emphasis}
                </span>
              </h1>
              <p className="mt-2 text-[14px] font-medium leading-relaxed text-on-surface-variant">
                {dashboardHero.description}{" "}
                <span className="font-semibold text-primary">
                  {dashboardHero.support}
                </span>
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant shadow-sm">
                <span className="text-primary">Life stage</span>
                <span className="text-on-surface">
                  {supportArea === "pregnancy"
                    ? "Pregnancy"
                    : supportArea === "menopause"
                      ? "Menopause"
                      : supportArea === "adolescence"
                        ? "Adolescence"
                        : supportArea === "fertility"
                          ? "Fertility"
                          : "Cycle tracking"}
                </span>
              </div>
            </div>
          </section>

          <section className="mb-12 flex flex-col items-center">
            <div className="relative flex h-72 w-72 items-center justify-center pb-4">
              <svg
                className="absolute inset-0 h-full w-full -rotate-90 transform"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#8E4D5B"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="31.4 282.7"
                  strokeDashoffset="0"
                  className="opacity-80"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E89B86"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="62.8 282.7"
                  strokeDashoffset="-35"
                  className="opacity-80"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="25.1 282.7"
                  strokeDashoffset="-102"
                  className="opacity-80"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#9c3e24"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="88 282.7"
                  strokeDashoffset="-132"
                  className="shadow-[0_0_15px_rgba(156,62,36,0.3)]"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="1 282.7"
                  strokeDashoffset={getRingMarkerOffsetFromProgress(
                    dashboardHero.progressPercent,
                  )}
                  className="drop-shadow-md"
                />
              </svg>

              <div className="relative z-10 flex h-52 w-52 flex-col items-center justify-center rounded-full border border-white/70 bg-white/68 shadow-[inset_0_0_24px_rgba(255,255,255,0.78),0_14px_36px_-8px_rgba(0,0,0,0.06)] backdrop-blur-xl">
                <span className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/60">
                  {dashboardHero.metricLabel}
                </span>
                <span className="mb-1 text-[56px] font-extralight leading-none tracking-tighter text-primary">
                  {dashboardHero.metricValue}
                </span>
                <span className="text-sm font-medium text-on-surface">
                  {dashboardHero.metricCaption}
                </span>
                <div className="mt-3 flex items-center justify-center rounded-full border border-primary/10 bg-primary/5 px-3 py-1">
                  <StarIcon className="mr-1 h-3 w-3 text-primary" />
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary">
                    {dashboardHero.metricBadge}
                  </span>
                </div>
              </div>

              <div className={heroCompanionPosition}>
                <div className="relative h-28 w-28 animate-[float_4s_ease-in-out_infinite]">
                  <Bloop
                    state={dashboardBloopState}
                    animated
                    size="hero"
                    priority
                    accessibilityLabel="Bloop assistant"
                    className="h-full w-full object-contain drop-shadow-2xl"
                    sizes="112px"
                  />
                  {!supportIsPregnancy ? (
                    <div className={heroTooltipPosition}>
                      <WaveIcon className="h-4 w-4 text-secondary" />
                      <span className="whitespace-nowrap text-[10px] font-bold text-on-surface-variant">
                        {dashboardHero.tooltip}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <Link
              href={dashboardHero.ctaHref}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/78 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur-md transition hover:bg-[#fbf4ef] active:scale-95"
            >
              {dashboardHero.ctaLabel}
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </section>

          <section className="mb-8">
            <button
              type="button"
              onClick={handleOpenQuickLog}
              className="group flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-br from-[#bc563a] to-[#9c3e24] py-4 text-[14px] font-bold tracking-wide text-white shadow-[0_15px_30px_-5px_rgba(156,62,36,0.3)] transition-all hover:brightness-110 active:scale-95"
            >
              <span className="flex items-center justify-center rounded-full bg-white/20 p-1.5 backdrop-blur-sm transition-transform group-hover:rotate-12">
                <EditIcon className="h-5 w-5" />
              </span>
              {quickLogLabel}
            </button>
            <div className="mt-3 rounded-[1.6rem] border border-white/70 bg-white/72 px-4 py-3 shadow-sm backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f8efe9]">
                  <Bloop
                    state={dailyLogBloopState}
                    animated
                    decorative
                    size="small"
                    className="h-8 w-8 object-contain"
                    sizes="32px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/60">
                    Daily log
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-on-surface">
                    {latestEntrySummary}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12 grid grid-cols-2 gap-4">
            <Link
              href={primaryDashboardCard.href}
              className={`relative flex h-40 flex-col justify-between rounded-3xl border border-white/50 bg-white/68 p-5 shadow-sm backdrop-blur-xl transition ${primaryDashboardCard.hoverClass}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-[1.2rem] ${primaryDashboardCard.iconClass}`}>
                <PrimaryDashboardIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant/60">
                  {primaryDashboardCard.label}
                </h3>
                <p className="text-[17px] font-medium leading-tight text-on-surface">
                  {primaryDashboardCard.title} <br />
                  <span className={`font-bold ${primaryDashboardCard.emphasisClass}`}>
                    {primaryDashboardCard.emphasis}
                  </span>
                </p>
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-white/75 p-1 shadow-sm">
                <Bloop
                  state={primaryCardBloopState}
                  decorative
                  animated
                  size="small"
                  className="h-7 w-7 object-contain"
                  sizes="28px"
                />
              </div>
            </Link>

            <Link
              href={secondarySupportCard.href}
              className={`relative flex h-40 flex-col justify-between rounded-3xl border border-white/50 bg-white/68 p-5 shadow-sm backdrop-blur-xl transition ${secondarySupportCard.hoverClass}`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-[1.2rem] ${secondarySupportCard.iconClass}`}
              >
                <SecondarySupportIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant/60">
                  {secondarySupportCard.label}
                </h3>
                <p className="text-[17px] font-medium leading-tight text-on-surface">
                  {secondarySupportCard.title} <br />
                  <span className={`font-bold ${secondarySupportCard.emphasisClass}`}>
                    {secondarySupportCard.emphasis}
                  </span>
                </p>
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-white/75 p-1 shadow-sm">
                <Bloop
                  state={secondaryCardBloopState}
                  decorative
                  animated
                  size="small"
                  className="h-7 w-7 object-contain"
                  sizes="28px"
                />
              </div>
            </Link>

            <Link
              href="/dashboard/history"
              className="relative flex h-40 flex-col justify-between rounded-3xl border border-white/50 bg-[#fef6f3] p-5 shadow-sm backdrop-blur-xl transition hover:bg-[#fdf0eb]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-primary/10 text-primary">
                <BookIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant/60">
                  Health Records
                </h3>
                <p className="text-[17px] font-medium leading-tight text-on-surface">
                  Review what you&apos;ve <br />
                  <span className="font-bold text-primary">logged</span>
                </p>
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-white/75 p-1 shadow-sm">
                <Bloop
                  state={dailyEntry ? "celebrate" : "empty"}
                  decorative
                  animated
                  size="small"
                  className="h-7 w-7 object-contain"
                  sizes="28px"
                />
              </div>
            </Link>

            <Link
              href="#daily-insight"
              id="daily-insight"
              className="relative flex h-40 flex-col justify-between rounded-3xl border border-white/50 bg-[#f9ece6] p-5 shadow-sm backdrop-blur-xl transition-colors hover:bg-[#f7e5dc]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-primary/8 text-primary">
                <BookIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-on-surface-variant/70">
                  Daily Insight
                </h3>
                <p className="text-[14px] font-medium leading-relaxed text-on-surface">
                  {dashboardHero.insight}
                </p>
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-white/75 p-1 shadow-sm">
                <Bloop
                  state="inform"
                  decorative
                  animated
                  size="small"
                  className="h-7 w-7 object-contain"
                  sizes="28px"
                />
              </div>
            </Link>
          </section>
        </main>

        <SanctuaryBottomNav />

        {showTutorial ? (
          <DashboardFirstSessionTutorial
            userName={formState.name}
            onFinish={handleCompleteTutorial}
          />
        ) : null}

        {isQuickLogOpen ? (
          <DailyEntrySheet
            initialDraft={buildDailyEntryDraft(dailyEntry)}
            hasExistingEntry={Boolean(dailyEntry)}
            onClose={handleCloseQuickLog}
            onDismissForToday={() => {
              dismissDailyEntryPromptForToday();
              setIsQuickLogOpen(false);
            }}
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

function parseDateValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function getCurrentCycleDay(
  cycleStart: Date,
  cycleLength: number,
  today: Date,
): number {
  const difference = differenceInDays(today, cycleStart);
  return (Math.max(0, difference) % Math.max(cycleLength, 1)) + 1;
}

function differenceInDays(later: Date, earlier: Date): number {
  const laterDay = new Date(
    later.getFullYear(),
    later.getMonth(),
    later.getDate(),
    12,
  );
  const earlierDay = new Date(
    earlier.getFullYear(),
    earlier.getMonth(),
    earlier.getDate(),
    12,
  );
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (laterDay.getTime() - earlierDay.getTime()) / millisecondsPerDay,
  );
}

function getDashboardPhase(
  cycleDay: number,
  cycleLength: number,
  flowDuration: number,
) {
  if (cycleDay <= flowDuration) {
    return {
      label: "menstrual phase",
      shortLabel: "Menstrual",
      headline: "softening",
      guidance: "Slow down and restore where you can.",
      badge: "Restore Phase",
      tooltip: "Gentle pace",
      fertilityHeadline: "Low fertility",
      insight:
        "Warm meals, hydration, and lighter movement may help your body feel more supported today.",
    };
  }

  if (cycleDay <= Math.max(flowDuration + 6, Math.floor(cycleLength / 2) - 2)) {
    return {
      label: "follicular phase",
      shortLabel: "Follicular",
      headline: "building",
      guidance: "Momentum is naturally returning.",
      badge: "Rise Phase",
      tooltip: "Fresh energy",
      fertilityHeadline: "Increasing fertility",
      insight:
        "This can be a good window for planning, lighter cardio, and social energy if your body feels up for it.",
    };
  }

  if (cycleDay <= Math.floor(cycleLength / 2) + 2) {
    return {
      label: "ovulation window",
      shortLabel: "Ovulation",
      headline: "near ovulation",
      guidance: "You may feel brighter and more outward-facing.",
      badge: "Peak Window",
      tooltip: "Brighter energy",
      fertilityHeadline: "Higher fertility",
      insight:
        "Notice hydration, cervical changes, and energy fluctuations. This window can feel mentally clearer and more social.",
    };
  }

  return {
    label: "luteal phase",
    shortLabel: "Luteal",
    headline: "deepening",
    guidance: "Be gentle today.",
    badge: "Nesting Phase",
    tooltip: "Energy dip",
    fertilityHeadline: "Low fertility",
    insight:
      "Magnesium-rich foods, gentler evenings, and softer expectations can support your current luteal rhythm.",
  };
}

function getRingMarkerOffsetFromProgress(progress: number) {
  const circumference = 282.7;
  const normalizedProgress = Math.min(1, Math.max(0, progress));
  return -(normalizedProgress * circumference);
}

function getDashboardHero(params: {
  supportArea: "cycle_tracker" | "fertility" | "pregnancy" | "menopause" | "adolescence";
  phase: ReturnType<typeof getDashboardPhase>;
  cycleDay: number;
  cycleLength: number;
  pregnancyWeek: number | null;
}) {
  const { supportArea, phase, cycleDay, cycleLength, pregnancyWeek } = params;

  if (supportArea === "pregnancy") {
    const week = pregnancyWeek ?? 18;
    return {
      eyebrow: "Today",
      title: "Your care feels",
      emphasis: "steady",
      description: "Pregnancy support should stay simple and reassuring.",
      support: "Week-based check-ins will help you move gently through this stage.",
      metricLabel: "Pregnancy week",
      metricValue: String(week),
      metricCaption: week < 14 ? "1st Trimester" : week < 28 ? "2nd Trimester" : "3rd Trimester",
      metricBadge: "Care Rhythm",
      tooltip: "Week-based support",
      ctaHref: "/dashboard/pregnancy",
      ctaLabel: "Open pregnancy support",
      progressPercent: week / 40,
      insight:
        "Clearer care plans, hydration, and gentle routines matter more than perfect tracking right now.",
    };
  }

  if (supportArea === "menopause") {
    return {
      eyebrow: "Today",
      title: "Your support stays",
      emphasis: "calm",
      description: "This space should help you track shifts without pressure.",
      support: "Gentle symptom logging and steadier routines will make patterns easier to trust.",
      metricLabel: "Support focus",
      metricValue: "Ease",
      metricCaption: "Menopause",
      metricBadge: "Body Shifts",
      tooltip: "Comfort first",
      ctaHref: "/dashboard/menopause",
      ctaLabel: "Open menopause support",
      progressPercent: 0.58,
      insight:
        "Supportive layers, hydration, and calmer evenings can help body shifts feel less abrupt.",
    };
  }

  if (supportArea === "adolescence") {
    return {
      eyebrow: "Today",
      title: "Your space feels",
      emphasis: "gentle",
      description: "Adolescence support works best when it feels safe and easy to return to.",
      support: "Mood check-ins and short rituals can build confidence without becoming another task.",
      metricLabel: "Daily space",
      metricValue: "You",
      metricCaption: "Adolescence",
    metricBadge: "Guidance",
      tooltip: "Check in softly",
      ctaHref: "/dashboard/adolescence",
      ctaLabel: "Open adolescence support",
      progressPercent: 0.34,
      insight:
        "Smaller daily rituals often do more than big fixes when emotions and energy are still changing quickly.",
    };
  }

  return {
    eyebrow: "Morning",
    title: "You're in",
    emphasis: phase.shortLabel,
    description: `Today is day ${cycleDay} of your ${cycleLength}-day cycle.`,
    support: phase.guidance,
    metricLabel: "Day of cycle",
    metricValue: String(cycleDay),
    metricCaption: phase.shortLabel,
    metricBadge: phase.badge,
    tooltip: phase.tooltip,
    ctaHref: "/dashboard/cycle",
    ctaLabel: supportArea === "fertility" ? "Open fertility companion" : "Open cycle tracker",
    progressPercent: cycleDay / Math.max(cycleLength, 1),
    insight: phase.insight,
  };
}

function getDashboardBloopState(
  supportArea: "cycle_tracker" | "fertility" | "pregnancy" | "menopause" | "adolescence",
  dailyEntry: DailyEntryRecord | null,
): BloopState {
  if (supportArea === "pregnancy") {
    return "pregnancy";
  }

  if (supportArea === "menopause") {
    return "menopause";
  }

  if (supportArea === "adolescence") {
    return "adolescence";
  }

  if (supportArea === "fertility" || supportArea === "cycle_tracker") {
    return "idle";
  }

  return dailyEntry ? "inform" : "idle";
}

function getDailyEntrySummary(dailyEntry: DailyEntryRecord | null) {
  if (!dailyEntry) {
    return "Your assistant is ready when you are. Log your first day to start building clearer cycle insights.";
  }

  const symptoms =
    dailyEntry.symptoms.length > 0
      ? `${dailyEntry.symptoms.length} symptom${dailyEntry.symptoms.length > 1 ? "s" : ""}`
      : "no symptoms logged";
  const painSummary =
    dailyEntry.painLevel > 0
      ? `pain ${dailyEntry.painLevel}/10`
      : "pain not recorded";

  return `Saved ${formatSavedAt(dailyEntry.savedAt)} • ${moodLabels[dailyEntry.mood]} mood • ${flowLabels[dailyEntry.flow]} • ${painSummary} • ${symptoms}.`;
}

function formatSavedAt(savedAt: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(savedAt));
  } catch {
    return "recently";
  }
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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

function EditIcon({ className }: { className?: string }) {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
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
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function CareIcon({ className }: { className?: string }) {
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
      <path d="M4 12h4l2.2-5 3.6 10 2.2-5H20" />
      <path d="M12 3v2" />
    </svg>
  );
}

function BloomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C13.5 2 15 3.5 15 5C15 6.5 13.5 8 12 8C10.5 8 9 6.5 9 5C9 3.5 10.5 2 12 2ZM6 8C7.5 8 9 9.5 9 11C9 12.5 7.5 14 6 14C4.5 14 3 12.5 3 11C3 9.5 4.5 8 6 8ZM18 8C19.5 8 21 9.5 21 11C21 12.5 19.5 14 18 14C16.5 14 15 12.5 15 11C15 9.5 16.5 8 18 8ZM12 16C13.5 16 15 17.5 15 19C15 20.5 13.5 22 12 22C10.5 22 9 20.5 9 19C9 17.5 10.5 16 12 16Z" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
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
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function LotusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C12 2 15 7 15 11C15 13 13.5 15 12 15C10.5 15 9 13 9 11C9 7 12 2 12 2ZM6 8C6 8 8.5 11 8.5 13C8.5 14.5 7.5 15.5 6 15.5C4.5 15.5 3 14 3 12.5C3 10.5 6 8 6 8ZM18 8C18 8 15.5 11 15.5 13C15.5 14.5 16.5 15.5 18 15.5C19.5 15.5 21 14 21 12.5C21 10.5 18 8 18 8ZM12 16.5C10 16.5 8 18.5 8 21C8 21 10 21 12 19C14 21 16 21 16 21C16 18.5 14 16.5 12 16.5Z" />
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

function ProfileUserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
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
