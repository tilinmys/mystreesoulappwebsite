"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { SanctuaryMenuSheet } from "@/components/sanctuary-menu-sheet";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import { DailyEntrySheet } from "@/components/daily-entry-sheet";
import { useDailyEntryRecord, buildDailyEntryDraft } from "@/lib/use-daily-entry-state";

// ─── Types ────────────────────────────────────────────────────────────────────

type EmptyStateId = "no-logs" | "no-symptoms" | "no-devices" | "no-history";

const EMPTY_STATES: Array<{
  id: EmptyStateId;
  label: string;
  bloopExpression: string;
  heading: string;
  subtext: string;
  cta: string;
  Icon: (props: { className?: string }) => React.ReactNode;
}> = [
  {
    id: "no-logs",
    label: "No Logs",
    bloopExpression: "curious",
    heading: "Let's start your first entry.",
    subtext: "It only takes a few seconds.",
    cta: "Log Today",
    Icon: PenIcon,
  },
  {
    id: "no-symptoms",
    label: "No Symptoms",
    bloopExpression: "encouraging",
    heading: "No symptoms logged yet",
    subtext: "Tracking helps us understand your patterns.",
    cta: "Add Symptoms",
    Icon: LeafIcon,
  },
  {
    id: "no-devices",
    label: "No Devices",
    bloopExpression: "calm",
    heading: "No devices connected",
    subtext: "Connect a device to automatically track your data.",
    cta: "Connect Device",
    Icon: DeviceIcon,
  },
  {
    id: "no-history",
    label: "No History",
    bloopExpression: "guiding",
    heading: "No history yet",
    subtext: "Your records will appear here over time.",
    cta: "Start Tracking",
    Icon: HistoryIcon,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function EmptyStatesScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeId, setActiveId] = useState<EmptyStateId>("no-logs");
  const [pressed, setPressed] = useState<EmptyStateId | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const { formState } = useOnboardingFormState();
  const { dailyEntry } = useDailyEntryRecord();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const active = EMPTY_STATES.find((s) => s.id === activeId)!;

  function handleCtaTap() {
    setPressed(activeId);
    window.setTimeout(() => {
      setPressed(null);
      if (activeId === "no-logs" || activeId === "no-symptoms") {
        setIsQuickLogOpen(true);
      }
    }, 400);
  }

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#faf7f2] text-on-surface md:min-h-[860px]">
        {/* ── Ambient background ────────────────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[20%] top-[5%] h-[22rem] w-[22rem] rounded-full bg-[#f9e6dc]/40 blur-[80px]" />
          <div className="absolute -right-[14%] top-[40%] h-[18rem] w-[18rem] rounded-full bg-[#d5e9bf]/25 blur-[90px]" />
          <div className="absolute bottom-[8%] left-[20%] h-[16rem] w-[16rem] rounded-full bg-primary/4 blur-[100px]" />

          {/* ── Animated period pad / cramp elements ──────────────────────── */}
          <div className="absolute left-[6%] top-[18%] empty-float-1 opacity-[0.07]">
            <PadIllustration />
          </div>
          <div className="absolute right-[4%] top-[28%] empty-float-2 opacity-[0.06]">
            <CrampWaveIllustration />
          </div>
          <div className="absolute bottom-[22%] left-[4%] empty-float-3 opacity-[0.06]">
            <DropletIllustration />
          </div>
          <div className="absolute bottom-[32%] right-[8%] empty-float-1 opacity-[0.05] [animation-delay:-2s]">
            <FlowerIllustration />
          </div>
        </div>

        {/* ── Header ───────────────────────────────────────────────────────── */}
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
              Getting Started
            </h1>
          </div>

          <div className="h-10 w-10" />
        </header>

        {/* ── Tab selector ─────────────────────────────────────────────────── */}
        <div className="relative z-10 px-6 pt-5">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x">
            {EMPTY_STATES.map((state) => (
              <button
                key={state.id}
                type="button"
                onClick={() => setActiveId(state.id)}
                className={`snap-start shrink-0 rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] transition-all duration-300 ${
                  activeId === state.id
                    ? "bg-[#f5ded7] text-primary shadow-sm"
                    : "bg-white/60 text-on-surface-variant/70 hover:bg-white/80"
                }`}
              >
                {state.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Empty state panel ────────────────────────────────────────────── */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center pb-[calc(env(safe-area-inset-bottom)+8rem)] pt-6 px-8">
          {/* Animated pad/cramp context badge */}
          <div
            className={`mb-6 transition-all duration-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <ContextBadge id={activeId} />
          </div>

          {/* Bloop illustration */}
          <div
            key={activeId}
            className={`relative mb-8 flex h-36 w-36 items-center justify-center transition-all duration-500 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
          >
            {/* Glowing halo */}
            <div className="absolute inset-0 rounded-full bg-[#f5ddd6]/60 blur-2xl empty-bloop-breathe" />
            {/* Orbital ring */}
            <div className="absolute inset-[-8px] rounded-full border border-[#f4ddd6]/70 empty-bloop-orbit" />
            <div className="absolute inset-[-16px] rounded-full border border-[#f4ddd6]/30 empty-bloop-orbit [animation-delay:-3s]" />

            {/* Bloop */}
            <Bloop
              state="empty"
              animated
              size="large"
              accessibilityLabel={`Bloop ${active.bloopExpression} empty state companion`}
              className="relative z-10 h-28 w-28 object-contain drop-shadow-[0_12px_24px_rgba(156,62,36,0.18)] empty-bloop-breathe"
            />

            {/* Expression float (small context icon) */}
            <div className="absolute -right-2 -top-2 empty-float-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white shadow-md">
                <active.Icon className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Copy */}
          <div
            key={`copy-${activeId}`}
            className={`mb-8 text-center transition-all duration-600 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "150ms" }}
          >
            <h2 className="text-[1.35rem] font-semibold leading-snug tracking-tight text-on-surface">
              {active.heading}
            </h2>
            <p className="mt-3 max-w-[17rem] text-[13.5px] font-medium leading-relaxed text-on-surface-variant/70">
              {active.subtext}
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleCtaTap}
            className={`rounded-full bg-[#d96c4e] px-8 py-3.5 text-[13px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_36px_rgba(217,108,78,0.28)] transition-all duration-200 hover:brightness-105 ${
              pressed === activeId ? "scale-95" : "scale-100"
            }`}
            style={{ transitionDelay: "250ms" }}
          >
            {active.cta}
          </button>

          {/* Skip link */}
          <button
            type="button"
            className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant/40 transition hover:text-on-surface-variant/60 active:scale-95"
          >
            Maybe later
          </button>

          {/* Animated period/ pad elements (in-frame) */}
          <div className="relative mt-10 flex h-16 w-full items-end justify-center gap-8 opacity-30">
            <div className="empty-float-3">
              <MiniPadSvg />
            </div>
            <div className="empty-float-1 [animation-delay:-1s]">
              <MiniDropSvg />
            </div>
            <div className="empty-float-2 [animation-delay:-2s]">
              <MiniFlowerSvg />
            </div>
            <div className="empty-float-1 [animation-delay:-3s]">
              <MiniCrampSvg />
            </div>
          </div>
        </main>

        {/* ── Bottom nav ───────────────────────────────────────────────────── */}
        <SanctuaryBottomNav />

        {isMenuOpen && (
          <SanctuaryMenuSheet
            userName={formState.name}
            onClose={() => setIsMenuOpen(false)}
          />
        )}

        {isQuickLogOpen && (
          <DailyEntrySheet
            initialDraft={buildDailyEntryDraft(dailyEntry)}
            hasExistingEntry={Boolean(dailyEntry)}
            onClose={() => setIsQuickLogOpen(false)}
            onSave={(req) => {
              setIsQuickLogOpen(false);
              // In a real app, this would refresh data and state would no longer be "empty"
            }}
          />
        )}
      </div>
    </PhonePreviewShell>
  );
}

// ─── Context Badge ────────────────────────────────────────────────────────────

function ContextBadge({ id }: { id: EmptyStateId }) {
  const map: Record<EmptyStateId, { text: string; color: string }> = {
    "no-logs": { text: "Just getting started 🌱", color: "bg-[#f3f9ec] text-[#6b8a4a]" },
    "no-symptoms": { text: "Patterns take time to form 🌸", color: "bg-[#f9ece9] text-[#a04a38]" },
    "no-devices": { text: "Optional — don't worry 💙", color: "bg-[#ecedf9] text-[#4e5898]" },
    "no-history": { text: "Every journey starts here 🌿", color: "bg-[#f3f9ec] text-[#6b8a4a]" },
  };
  const { text, color } = map[id];
  return (
    <span className={`inline-block rounded-full px-4 py-1.5 text-[10px] font-bold tracking-[0.16em] uppercase ${color}`}>
      {text}
    </span>
  );
}

// ─── Animated background illustrations ───────────────────────────────────────

function PadIllustration() {
  return (
    <svg width="80" height="52" viewBox="0 0 80 52" fill="none" aria-hidden="true">
      {/* Pad body */}
      <rect x="10" y="8" width="60" height="36" rx="18" fill="#f5ddd6" />
      {/* Wing left */}
      <path d="M10 20 C2 20 2 32 10 32" fill="#ebb5a8" />
      {/* Wing right */}
      <path d="M70 20 C78 20 78 32 70 32" fill="#ebb5a8" />
      {/* Texture lines */}
      <line x1="28" y1="16" x2="28" y2="36" stroke="#d4a49a" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="40" y1="14" x2="40" y2="38" stroke="#d4a49a" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="52" y1="16" x2="52" y2="36" stroke="#d4a49a" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

function CrampWaveIllustration() {
  return (
    <svg width="70" height="40" viewBox="0 0 70 40" fill="none" aria-hidden="true">
      <path d="M2 20 C10 8 20 8 28 20 C36 32 46 32 54 20 C62 8 68 12 68 20" stroke="#f5ded7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M2 26 C10 18 20 18 28 26 C36 34 46 34 54 26" stroke="#ebbcb0" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeOpacity="0.6" />
    </svg>
  );
}

function DropletIllustration() {
  return (
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" aria-hidden="true">
      <path d="M16 2C16 2 28 16 28 25a12 12 0 0 1-24 0C4 16 16 2 16 2Z" fill="#f5ddd6" />
      <ellipse cx="10" cy="22" rx="3" ry="5" fill="#fff" fillOpacity="0.4" transform="rotate(-20 10 22)" />
    </svg>
  );
}

function FlowerIllustration() {
  return (
    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="25" cy="25" rx="7" ry="14" fill="#f5ddd6" transform={`rotate(${deg} 25 25)`} />
      ))}
      <circle cx="25" cy="25" r="6" fill="#ebb5a8" />
    </svg>
  );
}

// ─── Mini in-frame SVGs ───────────────────────────────────────────────────────

function MiniPadSvg() {
  return (
    <svg width="52" height="34" viewBox="0 0 80 52" fill="none" className="opacity-80" aria-hidden="true">
      <rect x="10" y="8" width="60" height="36" rx="18" fill="#f5ddd6" />
      <path d="M10 20 C2 20 2 32 10 32" fill="#ebb5a8" />
      <path d="M70 20 C78 20 78 32 70 32" fill="#ebb5a8" />
    </svg>
  );
}

function MiniDropSvg() {
  return (
    <svg width="20" height="28" viewBox="0 0 32 42" fill="none" aria-hidden="true">
      <path d="M16 2C16 2 28 16 28 25a12 12 0 0 1-24 0C4 16 16 2 16 2Z" fill="#f5ddd6" />
    </svg>
  );
}

function MiniFlowerSvg() {
  return (
    <svg width="32" height="32" viewBox="0 0 50 50" fill="none" aria-hidden="true">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="25" cy="25" rx="7" ry="14" fill="#f5ddd6" transform={`rotate(${deg} 25 25)`} />
      ))}
      <circle cx="25" cy="25" r="6" fill="#ebb5a8" />
    </svg>
  );
}

function MiniCrampSvg() {
  return (
    <svg width="40" height="22" viewBox="0 0 70 40" fill="none" aria-hidden="true">
      <path d="M2 20 C10 8 20 8 28 20 C36 32 46 32 54 20 C62 8 68 12 68 20" stroke="#f5ded7" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h8" />
    </svg>
  );
}

function PenIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" />
    </svg>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function DeviceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22v-4" /><path d="M4 6h16" /><rect x="2" y="4" width="20" height="14" rx="3" /><path d="M9 22h6" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
  );
}

