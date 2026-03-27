"use client";

import { startTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bloop } from "@/components/common/Bloop";
import {
  seedPrototypeOnboardingForNewUser,
  startPrototypeSignup,
} from "@/lib/auth-session";

type WelcomeScreenProps = {
  className?: string;
};

export function WelcomeScreen({ className = "" }: WelcomeScreenProps) {
  const router = useRouter();
  const [isRoutingToPrivacy, setIsRoutingToPrivacy] = useState(false);

  const handleBegin = () => {
    if (isRoutingToPrivacy) {
      return;
    }

    setIsRoutingToPrivacy(true);
    startPrototypeSignup({
      name: "New Soul",
      email: "",
    });
    seedPrototypeOnboardingForNewUser("New Soul");

    window.setTimeout(() => {
      startTransition(() => {
        router.push("/privacy");
      });
    }, 420);
  };

  return (
    <section
      className={`welcome-gradient absolute inset-0 overflow-hidden ${className} ${
        isRoutingToPrivacy ? "welcome-routing" : ""
      }`}
      aria-label="Welcome screen"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="tonal-glow absolute left-1/2 top-1/4 aspect-square w-[140%] -translate-x-1/2 opacity-60" />
        <div className="botanical-element drift-slow absolute -right-16 -top-10 h-48 w-48 opacity-20">
          <TerracottaFlower />
        </div>
        <div className="botanical-element sway-slow absolute -left-12 top-1/3 h-40 w-40 opacity-20 [animation-delay:-2s]">
          <SageOutlineFlower />
        </div>
        <div className="botanical-element float-slow absolute -left-8 bottom-1/4 h-32 w-32 opacity-30">
          <SoftPetalWash />
        </div>
        <div className="botanical-element drift-slow absolute -bottom-8 -right-8 h-56 w-56 opacity-15 [animation-delay:-5s]">
          <TerracottaPetal />
        </div>
        <div className="botanical-element float-slow absolute -left-10 top-10 h-24 w-24 opacity-25 [animation-delay:-3s]">
          <SageLeaves />
        </div>
      </div>

      {isRoutingToPrivacy ? (
        <div className="pointer-events-none absolute inset-0 z-30">
          <div className="privacy-route-overlay absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(252,231,228,0.75)_0%,_rgba(255,255,255,0.95)_62%)]" />
          <div className="privacy-route-bloom absolute -left-12 top-20 h-40 w-40 text-[#d96c4e]/24">
            <TerracottaFlower />
          </div>
          <div className="privacy-route-bloom absolute -right-16 top-32 h-56 w-56 text-[#d96c4e]/18 [animation-delay:120ms]">
            <TerracottaPetal />
          </div>
          <div className="privacy-route-bloom absolute -left-10 bottom-36 h-28 w-28 text-[#9caf88]/20 [animation-delay:210ms]">
            <SageLeaves />
          </div>
          <div className="privacy-route-bloom absolute -right-10 bottom-24 h-32 w-32 text-[#9caf88]/18 [animation-delay:280ms]">
            <SageOutlineFlower />
          </div>
        </div>
      ) : null}

      <div className="relative flex min-h-full flex-col items-center justify-between px-8 pb-[calc(env(safe-area-inset-bottom)+1.75rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)] text-center md:pt-[calc(env(safe-area-inset-top)+4.25rem)]">
        <header className="w-full text-center md:pb-2">
          <p className="text-xl font-bold tracking-[0.05em] text-primary">
            MyStree Soul
          </p>
        </header>

        <div className="relative flex w-full flex-1 items-center justify-center">
          <div className="relative flex w-full max-w-[280px] items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-surface/70 blur-3xl opacity-50" />
            <div className="welcome-bloop-float relative z-10">
              <Bloop
                state="guide"
                animated
                priority
                width={280}
                accessibilityLabel="Bloop guide"
                sizes="280px"
                className="h-auto w-full drop-shadow-[0_20px_50px_rgba(156,62,36,0.12)]"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-sm space-y-8 pb-2">
          <div className="space-y-4">
            <h1 className="text-3xl font-light leading-tight tracking-[0.03em] text-on-surface md:text-4xl">
              Understand your body,
              <br />
              <span className="font-light italic">
                with more calm and clarity.
              </span>
            </h1>
            <p className="px-4 text-base leading-relaxed text-on-surface/70 md:text-lg">
              Track your cycle and get guidance that adapts to you.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <button
              type="button"
              onClick={handleBegin}
              disabled={isRoutingToPrivacy}
              className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-container px-6 text-base font-bold tracking-[0.01em] text-white shadow-[0_18px_40px_rgba(156,62,36,0.22)] transition duration-300 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background active:scale-[0.985] disabled:cursor-progress disabled:opacity-90"
            >
              Get Started
            </button>
            <Link
              href="/sign-in"
              className="inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-medium text-on-surface/65 transition duration-200 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background"
            >
              I already have an account
            </Link>
          </div>
        </div>

        <footer className="relative z-10 mt-10 w-full text-center">
          <p className="text-[10px] uppercase tracking-[0.34em] text-outline/65">
            Your data is secure and private
          </p>
        </footer>
      </div>
    </section>
  );
}

function TerracottaFlower() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 50C50 30 70 10 90 10C90 30 70 50 50 50Z" fill="currentColor" />
      <path d="M50 50C70 50 90 70 90 90C70 90 50 70 50 50Z" fill="currentColor" />
      <path d="M50 50C50 70 30 90 10 90C10 70 30 50 50 50Z" fill="currentColor" />
      <path d="M50 50C30 50 10 30 10 10C30 10 50 30 50 50Z" fill="currentColor" />
    </svg>
  );
}

function SageOutlineFlower() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 50C10 20 40 10 50 40C60 10 90 20 90 50C90 80 60 90 50 60C40 90 10 80 10 50Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="50" cy="50" r="4" fill="currentColor" />
    </svg>
  );
}

function SoftPetalWash() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 90C10 90 20 40 50 40C80 40 90 90 90 90"
        stroke="#F4DDD6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M50 10V40" stroke="#F4DDD6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TerracottaPetal() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 0C60 20 100 30 100 50C100 70 60 80 50 100C40 80 0 70 0 50C0 30 40 20 50 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SageLeaves() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 100C30 100 50 70 50 50C50 30 70 0 100 0" stroke="currentColor" strokeWidth="2" />
      <ellipse
        cx="30"
        cy="70"
        rx="10"
        ry="15"
        transform="rotate(-45 30 70)"
        fill="currentColor"
        fillOpacity="0.4"
      />
      <ellipse
        cx="70"
        cy="30"
        rx="10"
        ry="15"
        transform="rotate(-45 70 30)"
        fill="currentColor"
        fillOpacity="0.4"
      />
    </svg>
  );
}
