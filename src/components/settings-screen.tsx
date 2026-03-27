"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { clearAuthSession } from "@/lib/auth-session";
import {
  ONBOARDING_STORAGE_KEY,
  type OnboardingState,
} from "@/lib/onboarding-state";
import { normalizeSupportArea } from "@/lib/onboarding-questionnaire";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import {
  APP_SETTINGS_STORAGE_KEY,
  type AppearanceMode,
  useAppSettingsState,
} from "@/lib/use-app-settings-state";
import { ADOLESCENCE_SUPPORT_STORAGE_KEY } from "@/lib/use-adolescence-support-state";
import { DAILY_ENTRY_STORAGE_KEY } from "@/lib/use-daily-entry-state";
import { FERTILITY_LOG_STORAGE_KEY } from "@/lib/use-fertility-log-state";
import { MENOPAUSE_SUPPORT_STORAGE_KEY } from "@/lib/use-menopause-support-state";
import { PREGNANCY_SUPPORT_STORAGE_KEY } from "@/lib/use-pregnancy-support-state";

type ActiveSheet =
  | "appearance"
  | "integration"
  | "data"
  | "support"
  | null;

export function SettingsScreen() {
  const router = useRouter();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { formState } = useOnboardingFormState();
  const { settingsState, updateSettingsState } = useAppSettingsState();

  const displayName = formState.name?.trim() || "Your Profile";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
  const supportArea = normalizeSupportArea(formState.supportArea);
  const cycleDay = getCycleDay(formState);

  const supportLabel = useMemo(() => {
    switch (supportArea) {
      case "fertility":
        return "Fertility focus";
      case "pregnancy":
        return "Pregnancy care";
      case "menopause":
        return "Menopause support";
      case "adolescence":
        return "Adolescence support";
      default:
        return "Cycle guidance";
    }
  }, [supportArea]);
  const statusMessage = useMemo(() => {
    if (supportArea === "pregnancy") {
      return "Pregnancy care preferences, synced health data, and device security are all stored safely on this device.";
    }

    if (supportArea === "menopause") {
      return "Your symptom support settings, synced health data, and privacy controls are all stored safely on this device.";
    }

    if (supportArea === "adolescence") {
      return "Your support space, synced health data, and calmer reminder settings are all stored safely on this device.";
    }

    return `Cycle day ${cycleDay}, biometrics protected, and your app preferences are saved on this device.`;
  }, [cycleDay, supportArea]);

  function showToast(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2200);
  }

  function handleMindfulReminderToggle() {
    const nextValue = !settingsState.mindfulReminders;
    updateSettingsState({
      mindfulReminders: nextValue,
    });
    showToast(nextValue ? "Mindful reminders active" : "Mindful reminders paused");
  }

  function handleAppearanceChange(mode: AppearanceMode) {
    updateSettingsState({ appearanceMode: mode });
    showToast(mode === "soft_light" ? "Soft light mode active" : "Following device theme");
    setActiveSheet(null);
  }

  function handleHealthSyncToggle() {
    const nextValue = !settingsState.healthSyncEnabled;
    updateSettingsState({
      healthSyncEnabled: nextValue,
    });
    showToast(nextValue ? "Health sync connected" : "Health sync paused");
  }

  function handleDownloadSnapshot() {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      onboarding: readStorageJson<OnboardingState>(ONBOARDING_STORAGE_KEY),
      dailyEntry: readStorageJson(DAILY_ENTRY_STORAGE_KEY),
      fertilityLog: readStorageJson(FERTILITY_LOG_STORAGE_KEY),
      pregnancySupport: readStorageJson(PREGNANCY_SUPPORT_STORAGE_KEY),
      adolescenceSupport: readStorageJson(ADOLESCENCE_SUPPORT_STORAGE_KEY),
      menopauseSupport: readStorageJson(MENOPAUSE_SUPPORT_STORAGE_KEY),
      settings: readStorageJson(APP_SETTINGS_STORAGE_KEY),
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mystree-health-snapshot.json";
    anchor.click();
    window.URL.revokeObjectURL(url);
    showToast("Health snapshot exported");
    setActiveSheet(null);
  }

  function handleClearHealthLogs() {
    clearStorageKey(DAILY_ENTRY_STORAGE_KEY);
    clearStorageKey(FERTILITY_LOG_STORAGE_KEY);
    clearStorageKey(PREGNANCY_SUPPORT_STORAGE_KEY);
    clearStorageKey(ADOLESCENCE_SUPPORT_STORAGE_KEY);
    clearStorageKey(MENOPAUSE_SUPPORT_STORAGE_KEY);
    showToast("Health logs cleared");
    setActiveSheet(null);
  }

  function handleSignOut() {
    clearAuthSession();
    showToast("Signed out");
    window.setTimeout(() => {
      router.replace("/sign-in");
    }, 120);
  }

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#fffdf9] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="soft-glow absolute -left-[14%] top-[4%] h-[22rem] w-[22rem] rounded-full bg-primary/5 blur-[100px]" />
          <div className="float-drift absolute -right-[16%] top-[22%] h-[18rem] w-[18rem] rounded-full bg-[#f5ded7]/60 blur-[96px]" />
          <div className="drift-slow absolute bottom-[10%] left-[10%] h-[18rem] w-[18rem] rounded-full bg-secondary/8 blur-[100px]" />
          <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_18%_26%,rgba(156,62,36,0.06),transparent_18%),radial-gradient(circle_at_82%_18%,rgba(82,100,66,0.05),transparent_16%),radial-gradient(circle_at_26%_84%,rgba(188,86,58,0.04),transparent_16%)]" />
        </div>

        {notice ? (
          <div className="pointer-events-none absolute left-1/2 top-24 z-[75] -translate-x-1/2 md:top-28">
            <div className="rounded-full border border-white/85 bg-white/92 px-4 py-2 text-[11px] font-semibold tracking-wide text-primary shadow-[0_10px_24px_rgba(156,62,36,0.14)] backdrop-blur-md">
              {notice}
            </div>
          </div>
        ) : null}

        <header className="relative z-30 flex items-center justify-between bg-white/78 px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <Link
            href="/dashboard"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Back to home"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-primary/65">
              Home
            </p>
            <h1 className="mt-1 text-sm font-semibold tracking-[0.14em] text-on-surface">
              Settings
            </h1>
          </div>
          <div className="h-10 w-10" />
        </header>

        <main className="relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+8.75rem)] pt-5">
          <section className="mb-6 overflow-hidden rounded-[2.35rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,244,238,0.92))] p-6 shadow-[0_18px_45px_rgba(44,28,17,0.06)]">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/85 bg-[linear-gradient(145deg,#f5ded7,#fff8f4)] text-[1.35rem] font-bold tracking-[0.12em] text-primary shadow-[0_12px_24px_rgba(44,28,17,0.06)]">
                  {initials || "MS"}
                </div>
                <Link
                  href="/onboarding/summary"
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#fff7f2] bg-primary text-white shadow-sm transition hover:brightness-105 active:scale-[0.96]"
                  aria-label="Edit wellness profile"
                >
                  <EditIcon className="h-4 w-4" />
                </Link>
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-[1.45rem] font-semibold tracking-tight text-on-surface">
                  {displayName}
                </h2>
                <p className="mt-1 text-[12px] font-medium uppercase tracking-[0.16em] text-on-surface-variant/65">
                  Profile &amp; vitals
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-secondary-container/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-on-secondary-container">
                    Premium member
                  </span>
                  <span className="rounded-full bg-[#f8efe9] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    {supportLabel}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8 overflow-hidden rounded-[2.15rem] border border-white/85 bg-[linear-gradient(135deg,rgba(245,222,215,0.42),rgba(255,255,255,0.92))] p-6 shadow-[0_16px_38px_rgba(44,28,17,0.05)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/65">
              Status
            </p>
            <h3 className="mt-3 text-[1.6rem] font-semibold tracking-tight text-on-surface">
              Your health data is synchronized and secure.
            </h3>
            <p className="mt-3 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
              {statusMessage}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/history"
                className="rounded-full bg-primary px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_12px_26px_rgba(156,62,36,0.18)] transition hover:brightness-105 active:scale-[0.98]"
              >
                View insights
              </Link>
              <Link
                href="/onboarding/summary"
                className="rounded-full bg-white/90 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface shadow-sm transition hover:bg-white active:scale-[0.98]"
              >
                Manage plan
              </Link>
            </div>
          </section>

          <SettingsGroup title="Personal Settings">
            <SettingsRow
              icon={<ProfileIcon className="h-5 w-5" />}
              iconTone="warm"
              title="Wellness Profile"
              description="Biometrics, goals, and your care summary."
              href="/onboarding/summary"
            />
            <SettingsToggleRow
              icon={<BellIcon className="h-5 w-5" />}
              iconTone="warm"
              title="Mindful Reminders"
              description="Gentle prompts for reflection and daily flow."
              checked={settingsState.mindfulReminders}
              onToggle={handleMindfulReminderToggle}
            />
            <SettingsRow
              icon={<PaletteIcon className="h-5 w-5" />}
              iconTone="neutral"
              title="Appearance"
              description={
                settingsState.appearanceMode === "soft_light"
                  ? "Soft light mode active."
                  : "Following your device appearance."
              }
              onClick={() => setActiveSheet("appearance")}
            />
          </SettingsGroup>

          <SettingsGroup title="Health & Data">
            <SettingsRow
              icon={<HeartSyncIcon className="h-5 w-5" />}
              iconTone="sage"
              title="Health Integration"
              description={
                settingsState.healthSyncEnabled
                  ? "Apple Health and wearable sync connected."
                  : "Health sync is currently paused."
              }
              onClick={() => setActiveSheet("integration")}
            />
            <SettingsRow
              icon={<DatabaseIcon className="h-5 w-5" />}
              iconTone="sage"
              title="Data Management"
              description="Export your snapshot or clear saved health logs."
              onClick={() => setActiveSheet("data")}
            />
          </SettingsGroup>

          <SettingsGroup title="Account & Privacy">
            <SettingsRow
              icon={<ShieldIcon className="h-5 w-5" />}
              iconTone="neutral"
              title="Privacy & Security"
              description={
                settingsState.biometricLockEnabled
                  ? "Biometric lock and privacy controls are active."
                  : "Review biometrics and protection settings."
              }
              href="/privacy"
              badge={
                settingsState.biometricLockEnabled ? (
                  <span className="rounded-full bg-secondary-container px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-secondary">
                    Active
                  </span>
                ) : undefined
              }
            />
            <SettingsRow
              icon={<HelpIcon className="h-5 w-5" />}
              iconTone="neutral"
              title="Support Center"
              description="Help docs, privacy standards, and support access."
              onClick={() => setActiveSheet("support")}
            />
          </SettingsGroup>

          <section className="pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-3 rounded-[1.6rem] bg-error-container px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-on-error-container shadow-[0_12px_24px_rgba(186,26,26,0.09)] transition hover:brightness-[0.99] active:scale-[0.99]"
            >
              <LogoutIcon className="h-4 w-4" />
              Sign out
            </button>
            <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-outline/75">
              Version 2.4.0 (Soul)
            </p>
          </section>
        </main>

        <SanctuaryBottomNav />

        {activeSheet ? (
          <div className="absolute inset-0 z-[80] overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveSheet(null)}
              className="absolute inset-0 bg-[#1c1c19]/12 backdrop-blur-[4px]"
              aria-label="Close settings sheet"
            />
            <div className="absolute inset-x-0 bottom-0 rounded-t-[2.3rem] border-t border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(250,245,240,0.96))] px-6 pb-[calc(env(safe-area-inset-bottom)+1.4rem)] pt-4 shadow-[0_-18px_40px_rgba(28,19,16,0.14)]">
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-outline-variant/45" />
              {activeSheet === "appearance" ? (
                <SheetPanel
                  title="Appearance"
                  description="Keep the app soft and easy on the eyes."
                >
                  <SheetOptionButton
                    title="Soft Light"
                    description="The app's warm signature look."
                    active={settingsState.appearanceMode === "soft_light"}
                    onClick={() => handleAppearanceChange("soft_light")}
                  />
                  <SheetOptionButton
                    title="Follow Device"
                    description="Match the system appearance automatically."
                    active={settingsState.appearanceMode === "system"}
                    onClick={() => handleAppearanceChange("system")}
                  />
                </SheetPanel>
              ) : null}

              {activeSheet === "integration" ? (
                <SheetPanel
                  title="Health Integration"
                  description="Connect or pause device-based health sync."
                >
                  <SheetInfoCard
                    title="Apple Health & Devices"
                    body="Your cycle and wellness summaries can stay aligned with connected health sources on this device."
                  />
                  <button
                    type="button"
                    onClick={handleHealthSyncToggle}
                    className="flex w-full items-center justify-between rounded-[1.55rem] border border-white/70 bg-white/82 px-4 py-4 text-left shadow-sm transition hover:bg-white"
                  >
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        Health sync
                      </p>
                      <p className="mt-1 text-[12px] font-medium leading-relaxed text-on-surface-variant">
                        {settingsState.healthSyncEnabled
                          ? "Connected and updating in the background."
                          : "Paused until you reconnect it."}
                      </p>
                    </div>
                    <ToggleVisual checked={settingsState.healthSyncEnabled} />
                  </button>
                </SheetPanel>
              ) : null}

              {activeSheet === "data" ? (
                <SheetPanel
                  title="Data Management"
                  description="Take your records with you or reset saved logs."
                >
                  <button
                    type="button"
                    onClick={handleDownloadSnapshot}
                    className="flex w-full items-center justify-between rounded-[1.55rem] border border-white/70 bg-white/82 px-4 py-4 text-left shadow-sm transition hover:bg-white"
                  >
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        Export health snapshot
                      </p>
                      <p className="mt-1 text-[12px] font-medium leading-relaxed text-on-surface-variant">
                        Download your onboarding, daily entry, and support logs as JSON.
                      </p>
                    </div>
                    <DownloadIcon className="h-5 w-5 text-primary" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearHealthLogs}
                    className="flex w-full items-center justify-between rounded-[1.55rem] border border-[#f2c9c3] bg-[#fff5f3] px-4 py-4 text-left shadow-sm transition hover:bg-[#fff1ed]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-on-error-container">
                        Clear health logs
                      </p>
                      <p className="mt-1 text-[12px] font-medium leading-relaxed text-on-error-container/75">
                        Remove saved daily, fertility, pregnancy, and adolescence logs from this device.
                      </p>
                    </div>
                    <TrashIcon className="h-5 w-5 text-on-error-container" />
                  </button>
                </SheetPanel>
              ) : null}

              {activeSheet === "support" ? (
                <SheetPanel
                  title="Support Center"
                  description="Open the pages already available in your app."
                >
                  <SheetLink href="/privacy" onClick={() => setActiveSheet(null)}>
                    Privacy &amp; Security
                  </SheetLink>
                  <SheetLink
                    href="/legal/privacy-standards"
                    onClick={() => setActiveSheet(null)}
                  >
                    Privacy Standards
                  </SheetLink>
                  <SheetLink href="/legal/terms" onClick={() => setActiveSheet(null)}>
                    Terms &amp; Guidelines
                  </SheetLink>
                </SheetPanel>
              ) : null}

            </div>
          </div>
        ) : null}
      </div>
    </PhonePreviewShell>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <h3 className="mb-4 px-2 text-[10px] font-bold uppercase tracking-[0.24em] text-outline/85">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SettingsRow({
  icon,
  iconTone,
  title,
  description,
  href,
  onClick,
  badge,
}: {
  icon: ReactNode;
  iconTone: "warm" | "sage" | "neutral";
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  badge?: ReactNode;
}) {
  const content = (
    <>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] ${
            iconTone === "warm"
              ? "bg-[#f8ece6] text-primary"
              : iconTone === "sage"
                ? "bg-secondary-container/45 text-secondary"
                : "bg-surface-container-low text-on-surface-variant"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-on-surface">{title}</p>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-on-surface-variant">
            {description}
          </p>
        </div>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        {badge}
        <ChevronRightIcon className="h-5 w-5 text-outline/70" />
      </div>
    </>
  );

  const className =
    "flex w-full items-center justify-between rounded-[1.6rem] border border-white/80 bg-white/78 px-4 py-4 text-left shadow-[0_10px_24px_rgba(44,28,17,0.04)] backdrop-blur-md transition hover:bg-white active:scale-[0.99]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function SettingsToggleRow({
  icon,
  iconTone,
  title,
  description,
  checked,
  onToggle,
}: {
  icon: ReactNode;
  iconTone: "warm" | "sage" | "neutral";
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-[1.6rem] border border-white/80 bg-white/78 px-4 py-4 text-left shadow-[0_10px_24px_rgba(44,28,17,0.04)] backdrop-blur-md transition hover:bg-white active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] ${
            iconTone === "warm"
              ? "bg-[#f8ece6] text-primary"
              : iconTone === "sage"
                ? "bg-secondary-container/45 text-secondary"
                : "bg-surface-container-low text-on-surface-variant"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">{title}</p>
          <p className="mt-1 text-[12px] font-medium leading-relaxed text-on-surface-variant">
            {description}
          </p>
        </div>
      </div>
      <ToggleVisual checked={checked} />
    </button>
  );
}

function ToggleVisual({ checked }: { checked: boolean }) {
  return (
    <span
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
        checked
          ? "border-secondary/25 bg-secondary-container"
          : "border-outline-variant/40 bg-surface-container"
      }`}
    >
      <span
        className={`absolute h-5 w-5 rounded-full shadow-sm transition ${
          checked ? "right-1 bg-secondary" : "left-1 bg-white"
        }`}
      />
    </span>
  );
}

function SheetPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="pb-1">
        <h2 className="text-[1.2rem] font-semibold tracking-tight text-on-surface">
          {title}
        </h2>
        <p className="mt-1 text-[12px] font-medium leading-relaxed text-on-surface-variant">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function SheetInfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.55rem] border border-white/75 bg-[#fff8f4] px-4 py-4 shadow-sm">
      <p className="text-sm font-semibold text-on-surface">{title}</p>
      <p className="mt-1 text-[12px] font-medium leading-relaxed text-on-surface-variant">
        {body}
      </p>
    </div>
  );
}

function SheetOptionButton({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[1.55rem] border px-4 py-4 text-left shadow-sm transition ${
        active
          ? "border-primary/18 bg-[#fff6f1]"
          : "border-white/70 bg-white/82 hover:bg-white"
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-on-surface">{title}</p>
        <p className="mt-1 text-[12px] font-medium leading-relaxed text-on-surface-variant">
          {description}
        </p>
      </div>
      {active ? (
        <span className="rounded-full bg-primary px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
          Active
        </span>
      ) : (
        <ChevronRightIcon className="h-5 w-5 text-outline/70" />
      )}
    </button>
  );
}

function SheetLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center justify-between rounded-[1.55rem] border border-white/70 bg-white/82 px-4 py-4 text-sm font-semibold text-on-surface shadow-sm transition hover:bg-white"
    >
      <span>{children}</span>
      <ChevronRightIcon className="h-5 w-5 text-outline/70" />
    </Link>
  );
}

function getCycleDay(formState: OnboardingState) {
  if (!formState.lastCycleDate) {
    return 14;
  }

  const cycleStart = parseDateValue(formState.lastCycleDate);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const cycleLength = Math.max(1, formState.cycleLength || 28);
  const elapsed = Math.max(
    0,
    Math.round((today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)),
  );
  return (elapsed % cycleLength) + 1;
}

function parseDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function readStorageJson<T = unknown>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function clearStorageKey(key: string) {
  window.localStorage.removeItem(key);
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
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

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
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
      <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
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
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.6 1.5-1.5 0-.4-.1-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-5.2-4.5-9.3-10-8.8Z" />
    </svg>
  );
}

function HeartSyncIcon({ className }: { className?: string }) {
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
      <path d="M4 12h4l2.2-4.8 3.6 9.6 2.2-4.8H20" />
      <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
    </svg>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
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
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
      <path d="M5 11v8c0 1.66 3.13 3 7 3s7-1.34 7-3v-8" />
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

function HelpIcon({ className }: { className?: string }) {
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
      <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2.5-3 4" />
      <circle cx="12" cy="17.25" r=".75" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
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
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
