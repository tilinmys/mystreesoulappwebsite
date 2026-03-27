"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthSession } from "@/lib/auth-session";
import { normalizeSupportArea } from "@/lib/onboarding-questionnaire";
import { useAuthSessionState } from "@/lib/use-auth-session-state";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";

type SanctuaryMenuSheetProps = {
  userName?: string;
  onClose: () => void;
};

const primaryItems = [
  {
    href: "/dashboard",
    label: "Home",
    description: "Return to your daily rhythm, quick log, and gentle guidance.",
    icon: LotusIcon,
  },
  {
    href: "/dashboard/cycle",
    label: "Cycle Tracking",
    description: "Map your rhythms and predict your next flow.",
    icon: CycleIcon,
  },
  {
    href: "/dashboard/fertility",
    label: "Fertility",
    description: "Track fertile timing, LH patterns, and conception support.",
    icon: SeedIcon,
  },
  {
    href: "/dashboard/pregnancy",
    label: "Pregnancy",
    description: "Follow weekly growth, hydration, and nurturing care.",
    icon: CareIcon,
  },
  {
    href: "/dashboard/menopause",
    label: "Menopause",
    description: "Log hot flashes, body signals, and symptom support with clarity.",
    icon: FlameIcon,
  },
  {
    href: "/dashboard/adolescence",
    label: "Adolescence",
    description: "Beginner-friendly cycle help, soft check-ins, and confidence-building guidance.",
    icon: BloomIcon,
  },
] as const;

const secondaryItems = [
  {
    href: "/onboarding/summary",
    label: "Profile & Summary",
    description: "Review setup, goals, and your saved onboarding story.",
    icon: ProfileIcon,
  },
  {
    href: "/dashboard/history",
    label: "Records & History",
    description: "Browse your recent logs, milestones, and daily history.",
    icon: HistoryIcon,
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    description: "Calm reminders, cycle nudges, and Bloop's gentle check-ins.",
    icon: BellIcon,
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Manage reminders, privacy, sync, and personal protections.",
    icon: ShieldIcon,
  },
] as const;

export function SanctuaryMenuSheet({
  userName,
  onClose,
}: SanctuaryMenuSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAuthSessionState();
  const { formState } = useOnboardingFormState();
  const supportArea = normalizeSupportArea(formState.supportArea);
  const displayName =
    userName?.trim() ||
    session?.name?.trim() ||
    formState.name?.trim() ||
    "Your Home";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
  const phaseStatus = getPhaseStatus(
    formState.lastCycleDate,
    formState.cycleLength,
    formState.flowDuration,
  );
  const focusLabel = supportAreaLabel(supportArea);
  const quickLink = getRecommendedLink(supportArea);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleLogout() {
    clearAuthSession();
    onClose();
    router.replace("/sign-in");
  }

  function handleNavigate(href: string) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[sanctuary-menu] navigating", { href });
    }
    onClose();
    router.push(href);
  }

  return (
    <div className="absolute inset-0 z-[85] overflow-hidden">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="drawer-sheet-backdrop absolute inset-0 bg-on-surface/5 backdrop-blur-sm"
        aria-label="Close sanctuary drawer"
      />

      {/* Drawer panel */}
      <aside
        className="drawer-sheet-panel absolute inset-y-0 left-0 z-10 flex w-[85vw] max-w-[20rem] flex-col rounded-r-[2rem] bg-[#fcf9f4] shadow-[40px_0_60px_-15px_rgba(28,28,25,0.06)]"
        aria-label="Sanctuary navigation"
      >
        {/* Botanical blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-r-[2rem]">
          <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-[#f5ded7]/35 blur-2xl" />
        </div>

        {/* Scrollable inner */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto hide-scrollbar px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-6">
          <div className="mb-4 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-on-surface-variant shadow-sm transition hover:text-primary active:scale-95"
              aria-label="Close drawer"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* ── Profile ───────────────────────────────────────────────── */}
          <div className="mb-7 flex items-center gap-4">
            {/* Avatar + Bloop badge */}
            <div className="shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5ded7] text-[1.05rem] font-bold text-primary shadow-sm">
                {initials || "MS"}
              </div>
            </div>

            {/* Name + phase */}
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold leading-tight text-primary">
                {displayName}
              </p>
              <p className="mt-0.5 max-w-[11rem] text-[11px] font-light leading-relaxed tracking-[0.04em] text-on-surface-variant/65">
                {phaseStatus}
              </p>
            </div>
          </div>

          {/* ── Primary nav ───────────────────────────────────────────── */}
          <nav className="space-y-0.5">
            {primaryItems.map((item) => {
              const active = matchesPath(pathname, item.href);
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className={`group flex items-center gap-4 rounded-xl px-3 py-[0.7rem] transition-all duration-200 active:opacity-80 ${
                    active
                      ? "bg-[#f0ede9] text-primary"
                      : "text-[#56423d] hover:bg-[#f6f3ee] hover:text-primary"
                  }`}
                >
                  <Icon
                    className={`h-[1.1rem] w-[1.1rem] shrink-0 ${
                      active ? "text-primary" : "text-[#56423d]/70 group-hover:text-primary"
                    }`}
                  />
                  <span className={`text-[13.5px] tracking-wide ${active ? "font-semibold" : "font-medium"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* ── Divider ───────────────────────────────────────────────── */}
          <div className="my-5 h-px bg-outline-variant/20" />

          {/* ── Secondary nav ─────────────────────────────────────────── */}
          <nav className="space-y-0.5">
            {secondaryItems.map((item) => {
              const active = matchesPath(pathname, item.href);
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className={`group flex items-center gap-4 rounded-xl px-3 py-[0.6rem] transition-all duration-200 active:opacity-80 ${
                    active
                      ? "bg-[#f0ede9] text-primary"
                      : "text-[#56423d]/60 hover:bg-[#f6f3ee] hover:text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em]">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* ── Brand footer ──────────────────────────────────────────── */}
          <div className="mt-5 rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(245,222,215,0.42))] p-4 shadow-[0_10px_24px_rgba(28,28,25,0.04)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/65">
              Current Focus
            </p>
            <p className="mt-2 text-[14px] font-semibold tracking-tight text-on-surface">
              {focusLabel}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-on-surface-variant/70">
              Jump back into the support area that best matches your current stage.
            </p>
            <button
              type="button"
              onClick={() => handleNavigate(quickLink.href)}
              className="mt-4 inline-flex items-center rounded-full bg-white/92 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary shadow-sm transition hover:bg-white active:scale-95"
            >
              {quickLink.label}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.35rem] border border-white/75 bg-white/75 px-3.5 py-3 shadow-sm">
            <span className="text-[10px] font-light uppercase tracking-[0.2em] text-primary/55">
              MyStree Soul
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#fff4ef] px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-primary transition hover:bg-white active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function matchesPath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

function supportAreaLabel(
  area: ReturnType<typeof normalizeSupportArea>,
) {
  switch (area) {
    case "fertility":
      return "Fertility focus";
    case "pregnancy":
      return "Pregnancy care";
    case "menopause":
      return "Menopause care";
    case "adolescence":
      return "Adolescence support";
    case "cycle_tracker":
    default:
      return "Cycle focus";
  }
}

function getRecommendedLink(
  area: ReturnType<typeof normalizeSupportArea>,
) {
  switch (area) {
    case "fertility":
      return {
        href: "/dashboard/fertility",
        label: "Open fertility",
      };
    case "pregnancy":
      return {
        href: "/dashboard/pregnancy",
        label: "Open care",
      };
    case "menopause":
      return {
        href: "/dashboard/menopause",
        label: "Open support",
      };
    case "adolescence":
      return {
        href: "/dashboard/adolescence",
        label: "Open support",
      };
    case "cycle_tracker":
    default:
      return {
        href: "/dashboard/cycle",
        label: "Open tracker",
      };
  }
}

function getPhaseStatus(
  lastCycleDate: string,
  cycleLength: number,
  flowDuration: number,
) {
  if (!lastCycleDate) {
    return "Your space is ready for quiet, guided tracking.";
  }

  const cycleStart = parseDateValue(lastCycleDate);
  const today = getTodayAtNoon();
  const days = differenceInDays(today, cycleStart);
  const cycleDay = (Math.max(0, days) % Math.max(cycleLength, 1)) + 1;

  if (cycleDay <= flowDuration) {
    return `You're in a softer menstrual window, day ${cycleDay}.`;
  }

  if (cycleDay <= Math.max(flowDuration + 6, Math.floor(cycleLength / 2) - 2)) {
    return `You're in a building follicular window, day ${cycleDay}.`;
  }

  if (cycleDay <= Math.floor(cycleLength / 2) + 2) {
    return `You're in a brighter ovulation window, day ${cycleDay}.`;
  }

  return `You're in a nesting luteal window, day ${cycleDay}.`;
}

function getTodayAtNoon() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today;
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function differenceInDays(later: Date, earlier: Date) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((later.getTime() - earlier.getTime()) / millisecondsPerDay);
}

function CloseIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="M9 18l6-6-6-6" />
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
      <path d="M12 6.5c.55 0 1 .45 1 1v7a1 1 0 1 1-2 0v-7c0-.55.45-1 1-1Z" fill="#fffaf6" />
    </svg>
  );
}

function CareIcon({ className }: { className?: string }) {
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
      <path d="M4 12h4l2.2-5 3.6 10 2.2-5H20" />
      <path d="M12 3v2" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
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
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-.5-2.5-2.5-4.5C9 12 8.5 13.12 8.5 14.5Z" />
      <path d="M12 2c0 6-6 8-6 13a6 6 0 0 0 12 0c0-5-6-7-6-13Z" />
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

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
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
      <path d="M12 8v5l3 2" />
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
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
      <path d="M12 2 4 5v6c0 5.2 3.4 9.98 8 11 4.6-1.02 8-5.8 8-11V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PetalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <path d="M50 10C65 28 90 38 90 58C90 78 65 88 50 100C35 88 10 78 10 58C10 38 35 28 50 10Z" />
    </svg>
  );
}

function LeafAccentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <path d="M0 100C30 100 50 70 50 50C50 30 70 0 100 0C70 20 50 50 50 70C50 90 30 100 0 100Z" />
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
