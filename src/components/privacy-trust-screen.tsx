"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";

const trustCards = [
  {
    title: "Private by default",
    copy: "Your data lives on your device.",
    Icon: ShieldHeartIcon,
  },
  {
    title: "Guided by science",
    copy: "Clinical research at the core.",
    Icon: ScienceIcon,
  },
  {
    title: "Total control",
    copy: "You decide what stays or goes.",
    Icon: FingerprintIcon,
  },
];

export function PrivacyTrustScreen() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(true);

  const handleBeginJourney = () => {
    if (!agreed) {
      console.warn("[privacy] Attempted to continue without agreement");
      return;
    }

    console.info("[privacy] Agreement accepted, routing to onboarding");
    startTransition(() => {
      router.push("/onboarding");
    });
  };

  return (
    <PhonePreviewShell>
      <section className="privacy-surface privacy-enter relative grid h-[100dvh] w-full grid-rows-[auto_1fr_auto] overflow-hidden md:h-[860px]">
        <div className="bg-bloom-spot soft-glow absolute -left-20 -top-20 h-80 w-80 bg-[#fce7e4]" />
        <div className="bg-bloom-spot soft-glow absolute right-[-5rem] top-1/2 h-72 w-72 bg-[#fff1f0] [animation-delay:-2s]" />
        <div className="bg-bloom-spot soft-glow absolute -bottom-20 -left-10 h-96 w-96 bg-[#f4ddd6] [animation-delay:-4s]" />

        <header className="relative z-20 flex shrink-0 items-center justify-between px-6 py-4 md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-50/90 hover:text-stone-600"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">
            Privacy &amp; Trust
          </h1>
          <div className="w-10" />
        </header>

        <main className="relative z-10 flex min-h-0 flex-col justify-between px-8 pb-3">
          <div>
            <div className="mb-2 flex justify-center">
              <div className="relative flex h-48 w-48 items-center justify-center md:h-52 md:w-52">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#fce7e4]/40 to-transparent blur-3xl soft-glow" />
                <svg
                  className="lotus-shell bloom-slow absolute z-0 h-36 w-36 md:h-40 md:w-40"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="lotusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FCE7E4" stopOpacity="1" />
                      <stop offset="100%" stopColor="#D96C4E" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>

                  <circle className="lotus-core" cx="100" cy="110" r="8" fill="#D96C4E" opacity="0.6" />

                  {Array.from({ length: 8 }).map((_, index) => (
                    <g
                      key={index}
                      className="lotus-petal petal-float"
                      style={{
                        transformOrigin: "100px 120px",
                        animationDelay: `${index * -1}s`,
                      }}
                    >
                      <ellipse
                        cx="100"
                        cy="85"
                        rx="18"
                        ry="38"
                        fill="url(#lotusGrad)"
                        transform={`rotate(${index * 45}, 100, 110)`}
                      />
                    </g>
                  ))}
                </svg>
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/70 shadow-[0_16px_36px_rgba(156,62,36,0.08)] backdrop-blur-sm md:h-28 md:w-28">
                  <Bloop
                    state="reassure"
                    animated
                    width={80}
                    priority
                    accessibilityLabel="Bloop supportive companion"
                    className="relative z-10 h-auto w-auto max-h-[5rem] max-w-[5rem] object-contain md:max-h-[5.5rem] md:max-w-[5.5rem]"
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="mb-2 text-[26px] font-extrabold leading-tight tracking-tight text-stone-900 md:text-[28px]">
                Your path, protected.
              </h2>
              <p className="mx-auto mb-5 max-w-[280px] text-[13px] font-medium leading-relaxed text-stone-500">
                Keep your intimate health data where it belongs: with you.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pb-1">
            {trustCards.map(({ title, copy, Icon }, index) => (
              <div
                key={title}
                className="glass-card trust-card-up flex items-center gap-3 rounded-[1.5rem] px-3.5 py-3"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                  <Icon className="h-[18px] w-[18px] text-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-stone-900">{title}</h3>
                  <p className="text-[12px] text-stone-500">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="footer-lift relative z-30 shrink-0 bg-gradient-to-t from-white via-white/95 to-transparent px-8 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3">
          <div className="mb-3 w-full">
            <div className="glass-card flex items-center gap-3 rounded-[1.35rem] border-white/60 px-4 py-2.5">
              <input
                id="agreement"
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="squishy-check shrink-0"
              />
              <label
                htmlFor="agreement"
                className="cursor-pointer select-none text-[10px] font-medium leading-snug text-stone-600"
              >
                I agree to the{" "}
                <Link
                  href="/legal/terms"
                  className="font-bold text-primary hover:underline"
                >
                  Terms
                </Link>{" "}
                &{" "}
                <Link
                  href="/legal/privacy-standards"
                  className="font-bold text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBeginJourney}
            disabled={!agreed}
            className="tactile-pill w-full rounded-full py-3 text-[15px] font-bold tracking-[0.05em] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Begin Your Journey
          </button>
          <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-[0.22em] text-primary/70">
            Period data stays private. Never sold.
          </p>
        </footer>
      </section>
    </PhonePreviewShell>
  );
}

type IconProps = {
  className?: string;
};

function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

function ShieldHeartIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3c2.7 2.1 5.6 3.1 8 3.4v5.1c0 5.3-3.4 8.5-8 9.5-4.6-1-8-4.2-8-9.5V6.4C6.4 6.1 9.3 5.1 12 3Z" />
      <path d="m9.2 11.1 1.3 1.3 1.5-1.6" />
      <path d="M14.6 11.9c0-.9.7-1.5 1.5-1.5.5 0 1 .3 1.3.8.3-.5.8-.8 1.3-.8.8 0 1.5.6 1.5 1.5 0 1.5-1.9 2.8-2.8 3.4-.9-.6-2.8-1.9-2.8-3.4Z" />
    </svg>
  );
}

function ScienceIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v20" />
      <path d="M2 12h20" />
      <path d="M12 12c4 0 7-3 7-7" />
      <path d="M12 12c-4 0-7 3-7 7" />
    </svg>
  );
}

function FingerprintIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 4a5 5 0 0 0-5 5" />
      <path d="M9 18c.8-.8 1.2-1.8 1.2-3V9.5A1.8 1.8 0 0 1 12 7.7a1.8 1.8 0 0 1 1.8 1.8v3.3" />
      <path d="M6 14a6 6 0 0 1 12 0c0 3.2-1.1 5.3-3.3 7" />
      <path d="M12.2 20.8c2.6-1.7 3.8-4 3.8-7.3v-2" />
      <path d="M8 10.5V14c0 1.5-.4 2.8-1.3 4" />
    </svg>
  );
}
