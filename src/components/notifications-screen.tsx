"use client";

import { useEffect, useState } from "react";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { SanctuaryMenuSheet } from "@/components/sanctuary-menu-sheet";
import { getCurrentCycleDay, parseDateValue } from "@/lib/cycle-tracker";
import { normalizeSupportArea } from "@/lib/onboarding-questionnaire";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import type { OnboardingState } from "@/lib/onboarding-state";

type NotificationPriority = "high" | "low";

type NotifItem = {
  id: string;
  icon: "cycle" | "fertility" | "hydration" | "kick" | "insight" | "mood" | "general";
  title: string;
  body: string;
  time: string;
  priority: NotificationPriority;
  read: boolean;
};

type NotifGroup = {
  label: string;
  items: NotifItem[];
};

const unreadCount = (groups: NotifGroup[]) =>
  groups.flatMap((group) => group.items).filter((item) => !item.read).length;

function buildInitialGroups(
  supportArea: ReturnType<typeof normalizeSupportArea>,
  formState: OnboardingState,
): NotifGroup[] {
  const cycleMessage = buildCycleNotification(formState);
  const todayItems: NotifItem[] = [
    {
      id: "n1",
      icon: supportArea === "pregnancy" ? "hydration" : "cycle",
      title:
        supportArea === "pregnancy"
          ? "Hydration check-in"
          : supportArea === "menopause"
            ? "Body pattern check-in"
            : cycleMessage.title,
      body:
        supportArea === "pregnancy"
          ? "A few steady sips through the morning can help you feel more supported."
          : supportArea === "menopause"
            ? "Log today's symptoms to make heat, sleep, and mood changes easier to spot."
            : cycleMessage.body,
      time: "9:14 am",
      priority: "high",
      read: false,
    },
    {
      id: "n2",
      icon: "insight",
      title: "Reminder",
      body:
        supportArea === "pregnancy"
          ? "Keep today's care simple: rest when you can and check in if anything feels different."
          : supportArea === "adolescence"
            ? "A short mood check-in is enough. You do not need a perfect streak."
            : "A quick check-in today will make your patterns clearer over time.",
      time: "8:02 am",
      priority: "low",
      read: false,
    },
  ];

  const yesterdayItems: NotifItem[] = [
    {
      id: "n4",
      icon:
        supportArea === "pregnancy"
          ? "hydration"
          : supportArea === "menopause"
            ? "general"
            : "fertility",
      title:
        supportArea === "pregnancy"
          ? "Daily care summary"
          : supportArea === "menopause"
            ? "Symptom trend available"
            : "Fertility update",
      body:
        supportArea === "pregnancy"
          ? "Your week-based support changed slightly after yesterday's check-in."
          : supportArea === "menopause"
            ? "We noticed a repeating pattern worth reviewing when you have a quiet minute."
            : "Your cycle timing suggests the fertile window is approaching soon.",
      time: "11:55 am",
      priority: "high",
      read: true,
    },
    {
      id: "n5",
      icon: "mood",
      title: "Daily mood check-in",
      body: "You have not logged your mood yet. Tap to add a quick note - it takes about 10 seconds.",
      time: "8:00 pm",
      priority: "low",
      read: true,
    },
  ];

  const earlierItems: NotifItem[] = [
    supportArea === "pregnancy"
      ? {
          id: "n6",
          icon: "kick",
          title: "Kick count reminder",
          body: "If your care team suggested it, this is a good time to start today's kick count.",
          time: "Mon",
          priority: "low",
          read: true,
        }
      : {
          id: "n6",
          icon: "general",
          title:
            supportArea === "menopause"
              ? "Comfort recap ready"
              : supportArea === "adolescence"
                ? "Weekly check-in ready"
                : "Weekly recap ready",
          body:
            supportArea === "menopause"
              ? "Your symptom notes are ready to review so you can spot what is changing."
              : supportArea === "adolescence"
                ? "Your recent mood and routine notes are ready to review."
                : "Your cycle and symptom notes are ready to review in one place.",
          time: "Sun",
          priority: "low",
          read: true,
        },
  ];

  return [
    { label: "Today", items: todayItems },
    { label: "Yesterday", items: yesterdayItems },
    { label: "Earlier", items: earlierItems },
  ];
}

export function NotificationsScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { formState } = useOnboardingFormState();
  const supportArea = normalizeSupportArea(formState.supportArea);
  const [groups, setGroups] = useState<NotifGroup[]>(() =>
    buildInitialGroups(supportArea, formState),
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    setGroups(buildInitialGroups(supportArea, formState));
  }, [supportArea, formState]);

  function markRead(id: string) {
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      })),
    );
  }

  function dismiss(id: string) {
    setGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.id !== id),
        }))
        .filter((group) => group.items.length > 0),
    );
  }

  function markAllRead() {
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) => ({ ...item, read: true })),
      })),
    );
  }

  const totalUnread = unreadCount(groups);
  const allRead = totalUnread === 0;

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#faf7f2] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[18%] top-[5%] h-[20rem] w-[20rem] rounded-full bg-[#f5ddd6]/35 blur-[80px]" />
          <div className="absolute -right-[12%] top-[50%] h-[18rem] w-[18rem] rounded-full bg-[#d5e9bf]/22 blur-[90px]" />
          <div className="absolute bottom-0 left-[15%] h-[14rem] w-[14rem] rounded-full bg-primary/4 blur-[100px]" />
        </div>

        <header className="sticky top-0 z-40 flex items-center justify-between bg-[#faf7f2]/88 px-6 py-4 backdrop-blur-xl shadow-[0_2px_16px_rgba(28,20,12,0.03)] md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
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
              MyStree Soul
            </p>
            <h1 className="mt-0.5 text-sm font-semibold tracking-[0.12em] text-on-surface">
              Notifications
            </h1>
          </div>

          <button
            type="button"
            disabled={allRead}
            onClick={markAllRead}
            className="rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-primary/70 transition hover:bg-[#f4ddd6]/40 disabled:opacity-30 active:scale-95"
          >
            Mark all
          </button>
        </header>

        {allRead ? (
          <div
            className={`mx-6 mt-5 flex items-center gap-4 overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/70 p-4 shadow-[0_10px_28px_rgba(44,28,17,0.04)] backdrop-blur-sm transition-all duration-700 ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <Bloop
              state="alert"
              animated
              size="small"
              accessibilityLabel="Reminder companion"
              className="notif-bloop-breathe h-12 w-12 shrink-0 object-contain drop-shadow-md"
            />
            <p className="text-[13px] font-medium leading-relaxed text-on-surface-variant">
              Everything looks on track today.{" "}
              <span className="font-semibold text-primary">You&apos;re all caught up.</span>
            </p>
          </div>
        ) : (
          <div
            className={`mx-6 mt-5 flex items-center gap-3 rounded-[1.4rem] border border-white/75 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-700 ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#d96c4e]" />
            <p className="text-[11px] font-bold text-on-surface-variant">
              {totalUnread} unread{" "}
              <span className="font-normal opacity-70">- notifications waiting</span>
            </p>
          </div>
        )}

        <main className="relative z-10 flex-1 space-y-7 overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+7.5rem)] pt-6">
          {groups.length === 0 ? (
            <EmptyNotifications isLoaded={isLoaded} />
          ) : (
            groups.map((group, groupIndex) => (
              <section
                key={group.label}
                className="cycle-enter"
                style={{ animationDelay: `${groupIndex * 80}ms` }}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-on-surface-variant/50">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-outline-variant/15" />
                </div>

                <div className="space-y-2.5">
                  {group.items.map((notif, notifIndex) => (
                    <NotifCard
                      key={notif.id}
                      notif={notif}
                      delay={groupIndex * 80 + notifIndex * 40}
                      isLoaded={isLoaded}
                      onRead={() => markRead(notif.id)}
                      onDismiss={() => dismiss(notif.id)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

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

function buildCycleNotification(formState: OnboardingState) {
  if (!formState.lastCycleDate) {
    return {
      title: "Cycle check-in",
      body: "Add your next period start date to keep reminders and predictions accurate.",
    };
  }

  const cycleStart = parseDateValue(formState.lastCycleDate);
  const today = new Date();
  const cycleDay = getCurrentCycleDay(cycleStart, formState.cycleLength, today);

  if (cycleDay <= formState.flowDuration) {
    return {
      title: "Period day logged",
      body: `You are on day ${cycleDay} of your current period. Add today's flow or symptoms when you're ready.`,
    };
  }

  const daysUntilNext = Math.max(1, formState.cycleLength - cycleDay + 1);
  if (daysUntilNext <= 2) {
    return {
      title: "Period may start soon",
      body: `Based on your recent cycle, your next period may start in about ${daysUntilNext} day${daysUntilNext === 1 ? "" : "s"}.`,
    };
  }

  return {
    title: "Cycle check-in",
    body: `You're on day ${cycleDay} of your cycle. A quick log today will make future reminders more accurate.`,
  };
}

function NotifCard({
  notif,
  delay,
  isLoaded,
  onRead,
  onDismiss,
}: {
  notif: NotifItem;
  delay: number;
  isLoaded: boolean;
  onRead: () => void;
  onDismiss: () => void;
}) {
  const [swiped, setSwiped] = useState(false);

  function handleDismiss() {
    setSwiped(true);
    window.setTimeout(onDismiss, 340);
  }

  const bg =
    notif.priority === "high" && !notif.read
      ? "bg-[#fff5f0] border-[#f5ddd6]/90"
      : "bg-white/88 border-white/80";

  return (
    <div
      className={`overflow-hidden rounded-[1.4rem] border shadow-[0_8px_22px_rgba(44,28,17,0.04)] transition-all duration-300 ${bg} ${
        swiped ? "scale-95 -translate-x-8 opacity-0" : "opacity-100"
      } ${isLoaded ? "" : "opacity-0"}`}
      style={{ transitionDelay: `${delay}ms`, animationDelay: `${delay}ms` }}
      onClick={onRead}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") onRead();
      }}
    >
      <div className="flex items-start gap-3 px-4 py-4">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] ${getIconBg(
            notif.icon,
          )}`}
        >
          {getNotifIcon(notif.icon)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-[13px] font-semibold leading-snug ${
                notif.read ? "text-on-surface/75" : "text-on-surface"
              }`}
            >
              {notif.title}
              {!notif.read ? (
                <span className="ml-2 inline-block h-1.5 w-1.5 align-middle rounded-full bg-[#d96c4e]" />
              ) : null}
            </p>
            <span className="shrink-0 text-[10px] font-medium text-on-surface-variant/50">
              {notif.time}
            </span>
          </div>
          <p className="mt-1.5 text-[11.5px] font-medium leading-relaxed text-on-surface-variant/75">
            {notif.body}
          </p>
        </div>
      </div>

      <div className="flex justify-end border-t border-outline-variant/10 px-4 py-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleDismiss();
          }}
          className="text-[9px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/40 transition hover:text-primary/60 active:scale-95"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function EmptyNotifications({ isLoaded }: { isLoaded: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 py-16 text-center transition-all duration-700 ${
        isLoaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="relative flex h-32 w-32 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#f5ddd6]/40 blur-xl" />
        <Bloop
          state="alert"
          animated
          size="large"
          accessibilityLabel="Reminder companion"
          className="notif-bloop-breathe relative z-10 h-24 w-24 object-contain drop-shadow-lg"
        />
      </div>
      <div>
        <p className="text-lg font-semibold text-on-surface">You&apos;re all caught up</p>
        <p className="mt-2 max-w-[18rem] text-[13px] font-medium leading-relaxed text-on-surface-variant/70">
          No new notifications right now. Your assistant will let you know when something needs your attention.
        </p>
      </div>
    </div>
  );
}

function getIconBg(icon: NotifItem["icon"]) {
  const map: Record<NotifItem["icon"], string> = {
    cycle: "bg-[#ffeee8] text-[#c0563a]",
    fertility: "bg-[#e8f7e4] text-[#5a8c4a]",
    hydration: "bg-[#e8f0fb] text-[#4a6fac]",
    kick: "bg-[#fff0e5] text-[#c0763a]",
    insight: "bg-[#f5e8fb] text-[#8a5ab0]",
    mood: "bg-[#fef4e4] text-[#c09030]",
    general: "bg-[#f0f0f0] text-[#888]",
  };

  return map[icon];
}

function getNotifIcon(icon: NotifItem["icon"]) {
  const className = "h-5 w-5";
  if (icon === "cycle") return <CycleDropIcon className={className} />;
  if (icon === "fertility") return <SeedIcon className={className} />;
  if (icon === "hydration") return <WaterIcon className={className} />;
  if (icon === "kick") return <BabyIcon className={className} />;
  if (icon === "insight") return <InsightIcon className={className} />;
  if (icon === "mood") return <MoodIcon className={className} />;
  return <BellIcon className={className} />;
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h8" />
    </svg>
  );
}

function CycleDropIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2s5 5.8 5 10a5 5 0 0 1-10 0C7 7.8 12 2 12 2Z" />
    </svg>
  );
}

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22V12" />
      <path d="M12 12C12 8.7 9.8 6 7 5c.2 3.6 2.4 6.5 5 7Z" />
      <path d="M12 12c0-3.3 2.2-6 5-7-.2 3.6-2.4 6.5-5 7Z" />
    </svg>
  );
}

function WaterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2s6 6.36 6 11a6 6 0 1 1-12 0C6 8.36 12 2 12 2Z" />
    </svg>
  );
}

function BabyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="6" r="3" />
      <path d="M7 22c0-3.3 2.2-5 5-5s5 1.7 5 5" />
      <path d="M10 14h4" />
    </svg>
  );
}

function InsightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function MoodIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 14.5c.8 1 1.9 1.5 3 1.5s2.2-.5 3-1.5" />
      <circle cx="9.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="10.5" r="1" fill="currentColor" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
