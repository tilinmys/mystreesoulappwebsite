"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import {
  seedPrototypeOnboardingForNewUser,
  seedPrototypeOnboardingForReturningUser,
  startPrototypeSignIn,
  startPrototypeSignup,
} from "@/lib/auth-session";
import { hasCompletedOnboarding } from "@/lib/onboarding-state";
import { useAuthSessionState } from "@/lib/use-auth-session-state";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";

type AuthMode = "sign_in" | "sign_up";

export function SignInScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign_in");
  const [isPending, startTransition] = useTransition();
  const [signInEmail, setSignInEmail] = useState("merin@mystreesoul.app");
  const [signInName, setSignInName] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const { session } = useAuthSessionState();
  const { formState } = useOnboardingFormState();

  useEffect(() => {
    if (!session) {
      return;
    }

    router.replace(
      hasCompletedOnboarding(formState) ? "/dashboard" : "/privacy",
    );
  }, [formState, router, session]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  }

  function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) {
      return;
    }

    const resolvedName = signInName.trim() || formState.name || "Merin";
    startPrototypeSignIn({
      name: resolvedName,
      email: signInEmail.trim() || "merin@mystreesoul.app",
    });

    if (!hasCompletedOnboarding(formState)) {
      seedPrototypeOnboardingForReturningUser(resolvedName);
    }

    showNotice("Welcome back. Opening your dashboard.");
    startTransition(() => {
      router.push("/dashboard");
    });
  }

  function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) {
      return;
    }

    const resolvedName = signUpName.trim() || "New Soul";
    startPrototypeSignup({
      name: resolvedName,
      email: signUpEmail.trim(),
    });
    seedPrototypeOnboardingForNewUser(resolvedName);
    showNotice("Your prototype account is ready.");
    startTransition(() => {
      router.push("/privacy");
    });
  }

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#fffdf9] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-[14%] right-[-22%] h-[22rem] w-[22rem] rounded-full bg-primary/7 blur-[110px]" />
          <div className="absolute bottom-[4%] left-[-18%] h-[18rem] w-[18rem] rounded-full bg-secondary/10 blur-[100px]" />
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_18%_18%,rgba(156,62,36,0.08),transparent_18%),radial-gradient(circle_at_82%_22%,rgba(82,100,66,0.08),transparent_16%),radial-gradient(circle_at_42%_86%,rgba(245,222,215,0.55),transparent_18%)]" />
        </div>

        {notice ? (
          <div className="pointer-events-none absolute left-1/2 top-20 z-30 -translate-x-1/2">
            <div className="rounded-full border border-white/85 bg-white/92 px-4 py-2 text-[11px] font-semibold tracking-wide text-primary shadow-[0_10px_24px_rgba(156,62,36,0.14)] backdrop-blur-md">
              {notice}
            </div>
          </div>
        ) : null}

        <header className="relative z-20 flex items-center justify-between px-6 pb-3 pt-[calc(env(safe-area-inset-top)+1.25rem)]">
          <Link
            href="/"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-white/70 hover:text-primary active:scale-95"
            aria-label="Back to welcome"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-primary/70">
            MyStree Soul
          </p>
          <div className="h-10 w-10" />
        </header>

        <main className="relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          <section className="pt-2 text-center">
            <div className="mx-auto mb-5 flex h-36 w-36 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(244,221,214,0.75),rgba(255,255,255,0.3))]">
              <Bloop
                state={mode === "sign_up" ? "guide" : "idle"}
                animated
                priority
                width={112}
                accessibilityLabel={
                  mode === "sign_up" ? "Bloop guide" : "Bloop companion"
                }
                className="h-auto w-auto object-contain drop-shadow-[0_18px_40px_rgba(156,62,36,0.14)]"
                sizes="112px"
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/60">
              {mode === "sign_up" ? "Create your calm start" : "Welcome back"}
            </p>
            <h1 className="mt-3 text-[2rem] font-light tracking-tight text-on-surface">
              {mode === "sign_up"
                ? "Set up your prototype care space."
                : "Return to your daily flow."}
            </h1>
            <p className="mt-3 text-[14px] font-medium leading-relaxed text-on-surface-variant">
              {mode === "sign_up"
                ? "We will create a simple local account for now, then take you into privacy and onboarding."
                : "This prototype signs you in locally and opens your saved dashboard right away."}
            </p>
          </section>

          <section className="mt-7 rounded-[2rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,244,239,0.95))] p-3 shadow-[0_18px_40px_rgba(44,28,17,0.06)]">
            <div className="grid grid-cols-2 gap-2 rounded-[1.25rem] bg-[#f7efe9] p-1.5">
              <button
                type="button"
                onClick={() => setMode("sign_in")}
                className={`h-11 rounded-[1rem] text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                  mode === "sign_in"
                    ? "bg-white text-primary shadow-sm"
                    : "text-on-surface-variant/70"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("sign_up")}
                className={`h-11 rounded-[1rem] text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                  mode === "sign_up"
                    ? "bg-white text-primary shadow-sm"
                    : "text-on-surface-variant/70"
                }`}
              >
                Sign up
              </button>
            </div>

            {mode === "sign_in" ? (
              <form className="space-y-4 px-2 pb-2 pt-5" onSubmit={handleSignIn}>
                <Field
                  label="Email"
                  value={signInEmail}
                  onChange={setSignInEmail}
                  placeholder="merin@mystreesoul.app"
                  type="email"
                />
                <Field
                  label="Name"
                  value={signInName}
                  onChange={setSignInName}
                  placeholder="Merin"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-container px-6 text-[13px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_16px_34px_rgba(156,62,36,0.22)] transition hover:brightness-105 active:scale-[0.985] disabled:cursor-progress disabled:opacity-85"
                >
                  {isPending ? "Opening..." : "Open dashboard"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignInName("Merin");
                    setSignInEmail("merin@mystreesoul.app");
                  }}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-primary/12 bg-[#fff8f4] px-6 text-[11px] font-bold uppercase tracking-[0.14em] text-primary transition hover:bg-white active:scale-[0.985]"
                >
                  Use sample details
                </button>
              </form>
            ) : (
              <form className="space-y-4 px-2 pb-2 pt-5" onSubmit={handleSignUp}>
                <Field
                  label="Name"
                  value={signUpName}
                  onChange={setSignUpName}
                  placeholder="Your name"
                />
                <Field
                  label="Email"
                  value={signUpEmail}
                  onChange={setSignUpEmail}
                  placeholder="you@example.com"
                  type="email"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-container px-6 text-[13px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_16px_34px_rgba(156,62,36,0.22)] transition hover:brightness-105 active:scale-[0.985] disabled:cursor-progress disabled:opacity-85"
                >
                  {isPending ? "Creating..." : "Create prototype account"}
                </button>
              </form>
            )}
          </section>

          <section className="mt-5 rounded-[1.8rem] border border-white/85 bg-white/78 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#f5ded7]/60">
                <Bloop
                  state="reassure"
                  size="small"
                  animated
                  decorative
                  className="h-8 w-8 object-contain"
                  sizes="32px"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
                  Prototype note
                </p>
                <p className="mt-2 text-[13px] font-medium leading-relaxed text-on-surface-variant">
                  Sign in keeps your local data. Sign up starts a fresh local profile and
                  takes you through privacy and onboarding before the dashboard.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </PhonePreviewShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/65">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        className="h-12 w-full rounded-[1.1rem] border border-primary/10 bg-white/92 px-4 text-sm font-medium text-on-surface outline-none transition placeholder:text-on-surface-variant/40 focus:border-primary/25 focus:ring-2 focus:ring-primary/10"
      />
    </label>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}
