"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import { normalizeSupportArea } from "@/lib/onboarding-questionnaire";

export function SanctuaryBottomNav() {
  const pathname = usePathname();
  const { formState } = useOnboardingFormState();
  const supportArea = normalizeSupportArea(formState.supportArea);

  // Determine dynamic 3rd tab
  let dynamicHref = "/dashboard/fertility";
  let dynamicLabel = "Support";
  let DynamicIcon = SeedIcon;

  if (supportArea === "pregnancy" || pathname.startsWith("/dashboard/pregnancy")) {
    dynamicHref = "/dashboard/pregnancy";
    dynamicLabel = "Support";
    DynamicIcon = CarePulseIcon;
  } else if (supportArea === "menopause" || pathname.startsWith("/dashboard/menopause")) {
    dynamicHref = "/dashboard/menopause";
    dynamicLabel = "Support";
    DynamicIcon = FlameNavIcon;
  } else if (supportArea === "adolescence" || pathname.startsWith("/dashboard/adolescence")) {
    dynamicHref = "/dashboard/adolescence";
    dynamicLabel = "Support";
    DynamicIcon = SparkNavIcon;
  }

  const items = [
    { href: "/dashboard", label: "Home", icon: LotusIcon },
    { href: "/dashboard/cycle", label: "Cycle", icon: CycleIcon },
    { href: dynamicHref, label: dynamicLabel, icon: DynamicIcon },
    { href: "/dashboard/history", label: "History", icon: HistoryEduIcon },
    { href: "/onboarding/summary", label: "Profile", icon: ProfileUserIcon },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-around rounded-t-[2.3rem] border-t border-outline-variant/10 bg-[#fcfaf7]/94 px-2 pb-[calc(env(safe-area-inset-bottom)+0.55rem)] pt-2 shadow-[0_-14px_34px_-12px_rgba(0,0,0,0.03)] backdrop-blur-xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href === "/onboarding/summary" && pathname.startsWith("/settings"));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex w-[20%] flex-col items-center justify-center transition-colors active:scale-95 ${
              isActive
                ? "rounded-[1rem] bg-[#f4ddd6] py-1.5 text-[#9c3e24] transition-all"
                : "py-1.5 text-on-surface-variant/60 hover:text-[#9c3e24]"
            }`}
          >
            <Icon className="mb-[2px] h-[22px] w-[22px]" />
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-center truncate w-full px-0.5">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
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

function SeedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2c4.1 0 7 2.96 7 7.2 0 5.36-4.72 9.8-7 10.8-2.28-1-7-5.44-7-10.8C5 4.96 7.9 2 12 2Z" />
      <path d="M12 6.5c.55 0 1 .45 1 1v7a1 1 0 1 1-2 0v-7c0-.55.45-1 1-1Z" fill="#fcfaf7" />
    </svg>
  );
}

function CarePulseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 12h4l2.2-5 3.6 10 2.2-5H20" />
      <path d="M12 3v2" />
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

function SparkNavIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2a1.5 1.5 0 0 1 1.5 1.5V6h2.5A1.5 1.5 0 0 1 17.5 7.5v2.5h2.5a1.5 1.5 0 0 1 0 3h-2.5v2.5a1.5 1.5 0 0 1-1.5 1.5H13.5v2.5a1.5 1.5 0 0 1-3 0V17.5H8a1.5 1.5 0 0 1-1.5-1.5v-2.5h-2.5a1.5 1.5 0 0 1 0-3h2.5V7.5A1.5 1.5 0 0 1 8 6h2.5V3.5A1.5 1.5 0 0 1 12 2Z" opacity="0.4" />
      <circle cx="12" cy="12" r="4.5" />
    </svg>
  );
}

function HistoryEduIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}
