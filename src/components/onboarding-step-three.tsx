"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";

const supportOptions = [
  {
    id: "cycle_tracker",
    label: "Cycle\nTracker",
    Icon: CalendarIcon,
  },
  {
    id: "fertility",
    label: "Fertility\nCompanion",
    Icon: PottedPlantIcon,
  },
  {
    id: "pregnancy",
    label: "Pregnancy\nSupport",
    Icon: EcoLeafIcon,
  },
  {
    id: "menopause",
    label: "Menopause\nWisdom",
    Icon: WavesIcon,
  },
];

export function OnboardingStepThree() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const { formState, updateFormState } = useOnboardingFormState();

  const canContinue = formState.supportArea.trim().length > 0;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function handleNext() {
    if (!canContinue) return;

    startTransition(() => {
      router.push("/onboarding/questionnaire");
    });
  }

  function handleSupportSelection(value: string) {
    updateFormState({ supportArea: value });
    if (process.env.NODE_ENV !== "production") {
      console.info("[onboarding-step-3] support area selected", { value });
    }
  }

  return (
    <PhonePreviewShell>
      <section className="relative grid h-[100dvh] w-full grid-rows-[auto_1fr_auto] overflow-hidden bg-background text-on-surface md:h-[860px]">
        {/* Subtle Background Blooms */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="float-slow absolute -left-24 -top-24 h-[500px] w-[500px] rounded-full bg-[#fce7e4] opacity-40 blur-[100px]" />
          <div className="sway-slow absolute -right-24 top-1/2 h-[450px] w-[450px] rounded-full bg-[#f4ddd6] opacity-40 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 h-1/2 w-full -translate-x-1/2 bg-gradient-to-t from-surface to-transparent" />
        </div>

        <div
          className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`absolute -left-12 top-4 w-40 text-[#dea5a4]/30 ${
              isLoaded ? "garden-blast-tl" : ""
            }`}
          >
            <GardenFlower />
          </div>
          <div
            className={`absolute -right-16 top-24 w-48 text-[#d96c4e]/20 ${
              isLoaded ? "garden-blast-tr" : ""
            }`}
          >
            <GardenFlower />
          </div>
          <div
            className={`absolute -left-16 bottom-32 w-56 text-[#bc563a]/15 ${
              isLoaded ? "garden-blast-bl" : ""
            }`}
          >
            <GardenFlower />
          </div>
          <div
            className={`absolute -right-8 bottom-48 w-44 text-[#e0b0af]/25 ${
              isLoaded ? "garden-blast-br" : ""
            }`}
          >
            <GardenFlower />
          </div>

          <div className="sway-slow absolute bottom-1/4 right-6 w-16 text-[#bc563a]/20">
            <TerracottaPetalSingle />
          </div>
          <div className="float-slow absolute left-4 top-1/2 w-12 text-[#9caf88]/20">
            <SageLeafSingle />
          </div>
        </div>

        {/* Header Navigation */}
        <header className="relative z-20 flex items-center justify-between px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <Link
            href="/onboarding/cycle"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Back to cycle step"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-extrabold tracking-[0.1em] text-primary/80 uppercase">
               Step 03 / 04
             </span>
          </div>
          <div className="w-10" />
        </header>

        <main className="relative z-20 flex min-h-0 flex-col overflow-y-auto px-8 pb-32">
          <div className="welcome-visible mx-auto flex w-full max-w-lg flex-col items-center">
            {/* Professional Bloop Character Placeholder */}
            <div className="mb-10 flex flex-col items-center">
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl" />
                <Bloop
                  state="guide"
                  animated
                  width={64}
                  priority
                  accessibilityLabel="Bloop guide"
                  className="relative z-10 h-auto w-auto object-contain drop-shadow-lg"
                />
              </div>
            </div>

            {/* Title & Vertical Rhythm */}
            <div className="text-center mb-10 space-y-4">
              <h1 className="text-3xl font-light tracking-tight text-on-surface leading-[1.15]">
                What would you like <br className="hidden sm:block" /> <span className="font-extrabold italic text-primary">support with?</span>
              </h1>
              <p className="text-on-surface-variant/80 text-[14px] max-w-[280px] mx-auto leading-relaxed">
                Personalize your experience to best fit your current rhythm and stage.
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
                Select one for now
              </p>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-2 gap-4 w-full mb-4">
              {supportOptions.map(({ id, label, Icon }) => {
                const active = formState.supportArea === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSupportSelection(id)}
                    className={`glass-card p-6 rounded-[1.5rem] flex flex-col items-center text-center gap-5 transition-all duration-300 active:scale-[0.98] ${
                      active ? "bg-white/85 ring-2 ring-primary scale-[1.02] shadow-[0_10px_30px_-10px_rgba(156,62,36,0.12)]" : "hover:border-primary/20 hover:bg-white/50"
                    }`}
                    aria-pressed={active}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      active ? "bg-primary/10 text-primary" : "bg-outline/30 text-outline"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold tracking-widest text-on-surface uppercase whitespace-pre-line leading-snug">
                      {label}
                    </span>
                    <span className={`text-[10px] font-semibold ${active ? "text-primary" : "text-on-surface-variant/55"}`}>
                      {active ? "Selected" : "Tap to choose"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Adolescence Row */}
            <button 
              onClick={() => handleSupportSelection("adolescence")}
              className={`glass-card w-full p-5 rounded-[1.5rem] flex items-center gap-5 transition-all duration-300 active:scale-[0.98] ${
                formState.supportArea === "adolescence" ? "bg-white/85 ring-2 ring-primary scale-[1.02] shadow-[0_10px_30px_-10px_rgba(156,62,36,0.12)]" : "hover:border-primary/20 hover:bg-white/50"
              }`}
              aria-pressed={formState.supportArea === "adolescence"}
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                 formState.supportArea === "adolescence" ? "bg-primary/10 text-primary" : "bg-outline/30 text-outline"
              }`}>
                <EcoLeafIcon className="h-7 w-7" />
              </div>
              <div className="text-left">
                <span className="text-[11px] font-bold tracking-widest text-on-surface uppercase block mb-1">Adolescence Support</span>
                <span className="text-[12px] text-on-surface-variant/75 font-medium">First periods, body changes, and calmer guidance</span>
              </div>
            </button>
            <p className="mt-4 text-center text-[12px] leading-relaxed text-on-surface-variant/75">
              Choose your main support area to continue. You can switch paths later from the menu.
            </p>
          </div>
        </main>

        {/* Bottom Action Space */}
        <footer className="footer-lift absolute bottom-0 left-0 w-full z-30 bg-gradient-to-t from-background via-background/95 to-transparent px-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-6 flex justify-center pointer-events-none">
          <div className="w-full max-w-sm pointer-events-auto">
             {!canContinue ? (
               <p className="mb-3 text-center text-[11px] font-medium text-on-surface-variant/70">
                 Select your primary focus to continue.
               </p>
             ) : null}
             <button
               type="button"
               disabled={!canContinue}
               onClick={handleNext}
               className="tactile-pill w-full flex items-center justify-center gap-3 rounded-full py-4 text-[14px] font-bold tracking-[0.05em] text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
             >
               Continue Journey
               <ArrowRightIcon className="h-5 w-5" />
             </button>
          </div>
        </footer>
      </section>
    </PhonePreviewShell>
  );
}

// -----------------------------------------------------
// Icons & Graphics
// -----------------------------------------------------

type IconProps = { className?: string };

function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function PottedPlantIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 22h8" />
      <path d="M7 16h10l1 6H6l1-6Z" />
      <path d="M12 16V4" />
      <path d="M12 8c-3 0-5-2-5-5" />
      <path d="M12 12c3 0 5-2 5-5" />
    </svg>
  );
}

function EcoLeafIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 10c0-4 3-7 7-7 4 0 7 3 7 7" />
      <path d="M17 10v4c0 4-3 7-7 7" />
      <path d="M10 21V10" />
      <path d="M10 14h7" />
    </svg>
  );
}

function WavesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M2 6c.6.5 1.2 1 2.5 1S7 6.5 7.5 6 8.7 5 10 5s1.8.5 2.5 1 1.2 1 2.5 1 1.8-.5 2.5-1 1.2-1 2.5-1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1S7 12.5 7.5 12 8.7 11 10 11s1.8.5 2.5 1 1.2 1 2.5 1 1.8-.5 2.5-1 1.2-1 2.5-1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1S7 18.5 7.5 18 8.7 17 10 17s1.8.5 2.5 1 1.2 1 2.5 1 1.8-.5 2.5-1 1.2-1 2.5-1" />
    </svg>
  );
}


function GardenFlower() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="50" cy="50" r="12" opacity="0.4" />
      <ellipse cx="50" cy="22" rx="14" ry="22" opacity="0.6" />
      <ellipse cx="50" cy="78" rx="14" ry="22" opacity="0.6" />
      <ellipse cx="22" cy="50" rx="22" ry="14" opacity="0.6" />
      <ellipse cx="78" cy="50" rx="22" ry="14" opacity="0.6" />
      <ellipse cx="32" cy="32" rx="18" ry="18" opacity="0.5" transform="rotate(45, 32, 32)" />
      <ellipse cx="68" cy="68" rx="18" ry="18" opacity="0.5" transform="rotate(45, 68, 68)" />
      <ellipse cx="32" cy="68" rx="18" ry="18" opacity="0.5" transform="rotate(-45, 32, 68)" />
      <ellipse cx="68" cy="32" rx="18" ry="18" opacity="0.5" transform="rotate(-45, 68, 32)" />
    </svg>
  );
}

function SageLeafSingle() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 100C30 100 50 70 50 50C50 30 70 0 100 0C70 20 50 50 50 70C50 90 30 100 0 100Z" opacity="0.8" />
    </svg>
  );
}

function TerracottaPetalSingle() {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 10C65 30 90 40 90 60C90 80 65 90 50 100C35 90 10 80 10 60C10 40 35 30 50 10Z" opacity="0.7" />
    </svg>
  );
}
