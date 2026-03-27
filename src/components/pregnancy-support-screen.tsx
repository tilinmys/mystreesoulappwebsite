"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import { SanctuaryBottomNav } from "@/components/sanctuary-bottom-nav";
import { SanctuaryMenuSheet } from "@/components/sanctuary-menu-sheet";
import {
  PregnancySupportSheet,
  type PregnancySheetMode,
} from "@/components/pregnancy-support-sheet";
import { buildPregnancySupportModel } from "@/lib/pregnancy-support";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";
import { usePregnancySupportState } from "@/lib/use-pregnancy-support-state";

export function PregnancySupportScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSheet, setActiveSheet] = useState<PregnancySheetMode | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const carePlanRef = useRef<HTMLElement | null>(null);
  const { formState } = useOnboardingFormState();
  const { pregnancyState, updatePregnancyState } = usePregnancySupportState();

  const model = useMemo(
    () =>
      buildPregnancySupportModel({
        anchorDate: getTodayAtNoon(),
        questionnaireAnswers: formState.questionnaireAnswers,
        pregnancyState,
      }),
    [formState.questionnaireAnswers, pregnancyState],
  );

  const chart = useMemo(() => buildWeightChartModel(model.weightPoints), [model.weightPoints]);
  const waterProgress = Math.min(
    100,
    (pregnancyState.waterCups / model.hydrationGoal) * 100,
  );
  const activeResourceId =
    selectedResourceId && model.resources.some((item) => item.id === selectedResourceId)
      ? selectedResourceId
      : (model.resources[0]?.id ?? null);
  const selectedResource =
    model.resources.find((item) => item.id === activeResourceId) ?? model.resources[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsLoaded(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function handleSheetSave(patch: Partial<typeof pregnancyState>) {
    updatePregnancyState(patch);
    setActiveSheet(null);

    if ("kickCount" in patch) {
      setNotice("Kick session saved");
      return;
    }

    if ("consultMode" in patch || "consultBooked" in patch) {
      setNotice("Consult preference saved");
      return;
    }

    setNotice("Pregnancy vitals updated");
  }

  function handleAddWater() {
    updatePregnancyState({
      waterCups: Math.min(16, pregnancyState.waterCups + 1),
    });
    setNotice("Hydration added");
  }

  function handleViewCarePlan() {
    updatePregnancyState({ carePlanViewedAt: new Date().toISOString() });
    setSelectedResourceId(selectedResource?.id ?? model.resources[0]?.id ?? null);
    carePlanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setNotice("Care plan opened");
  }

  return (
    <PhonePreviewShell>
      <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#fffdfa] text-on-surface md:min-h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-[14%] top-[4%] h-[22rem] w-[22rem] rounded-full bg-primary/5 blur-[96px]" />
          <div className="absolute -right-[16%] top-[22%] h-[20rem] w-[20rem] rounded-full bg-secondary/7 blur-[110px]" />
          <div className="absolute bottom-[8%] left-[16%] h-[18rem] w-[18rem] rounded-full bg-[#f5ded7]/65 blur-[100px]" />
          <div className="absolute left-[10%] top-[12%] h-28 w-28 text-primary/7 pregnancy-orb-drift">
            <PregnancyBloom className="h-full w-full" />
          </div>
          <div className="absolute right-[10%] top-[34%] h-32 w-32 text-secondary/12 pregnancy-orb-drift [animation-delay:-2s]">
            <PregnancyLeaf className="h-full w-full" />
          </div>
          <div className="absolute bottom-[18%] right-[8%] h-24 w-24 text-primary/9 pregnancy-orb-drift [animation-delay:-4.5s]">
            <PregnancyPetal className="h-full w-full" />
          </div>
        </div>

        {notice ? (
          <div className="pointer-events-none absolute left-1/2 top-24 z-[75] -translate-x-1/2 md:top-28">
            <div className="rounded-full border border-white/85 bg-white/92 px-4 py-2 text-[11px] font-semibold tracking-wide text-primary shadow-[0_10px_24px_rgba(156,62,36,0.14)] backdrop-blur-md">
              {notice}
            </div>
          </div>
        ) : null}

        <header className="relative z-30 flex items-center justify-between bg-white/78 px-4 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <button
            type="button"
            className="group flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-md transition hover:bg-white active:scale-95"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon className="h-5 w-5 text-on-surface-variant transition-colors group-hover:text-primary" />
          </button>
          <div className="min-w-0 flex-1 px-3 text-center">
            <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.24em] text-primary/65">
              Support
            </p>
            <h1 className="mt-1 truncate text-sm font-semibold tracking-[0.12em] text-on-surface">
              Pregnancy Support
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setActiveSheet("vitals")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary active:scale-95"
            aria-label="Log pregnancy vitals"
          >
            <VitalsIcon className="h-5 w-5" />
          </button>
        </header>

        <main className="relative z-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+12rem)] pt-6">
          <section className={`cycle-enter mb-8 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
            <div className="overflow-hidden rounded-[2.5rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,243,238,0.92))] p-7 shadow-[0_18px_46px_rgba(44,28,17,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/60">
                    Current progress
                  </p>
                  <h2 className="mt-2 text-[2.55rem] font-extralight tracking-tight text-primary">
                    Week {model.week}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-on-surface-variant">
                    Due around {model.dueDateLabel}
                  </p>
                </div>
                <span className="rounded-full bg-secondary-container/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-on-secondary-container">
                  {model.trimesterLabel}
                </span>
              </div>

              <div className="mt-8 flex items-center justify-center">
                <div className="relative flex h-56 w-56 items-center justify-center">
                  <div className="pregnancy-glow-breathe absolute inset-0 rounded-full bg-primary/8 blur-3xl" />
                  <div className="pregnancy-orb-drift relative flex h-40 w-32 items-center justify-center rounded-[56%_44%_60%_40%/48%_58%_42%_52%] bg-gradient-to-br from-secondary/55 via-secondary-container/55 to-[#f8efe9] shadow-[0_18px_34px_rgba(82,100,66,0.12)]">
                    <div className="absolute inset-[16%] rounded-[58%_42%_60%_40%/50%_55%_45%_50%] border border-white/55" />
                    <span className="relative z-10 text-4xl text-secondary/55">
                      <LotusIcon className="h-10 w-10" />
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="mt-1 text-center text-[1.65rem] font-semibold tracking-tight text-on-surface">
                {model.focusTitle}
              </h3>
              <p className="mx-auto mt-3 max-w-[19rem] text-center text-[14px] font-medium leading-[1.7] text-on-surface-variant">
                {model.heroMessage}
              </p>

              <div className="mt-6 grid gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2 flex-1 rounded-full bg-primary" />
                  <div className="h-2 flex-1 rounded-full bg-primary" />
                  <div className="h-2 flex-1 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-700"
                      style={{ width: `${Math.min(100, model.trimesterProgressPercent)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/55">
                  <span>Trimester 1</span>
                  <span className="text-primary">{model.trimesterLabel}</span>
                  <span>Trimester 3</span>
                </div>
                <p className="pt-1 text-center text-[12px] font-medium text-on-surface-variant">
                  {model.daysRemaining} days remaining in your journey
                </p>
              </div>
            </div>
          </section>

          <section className={`cycle-card-rise mb-8 grid grid-cols-2 gap-3 ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "120ms" }}>
            <StatTile
              icon={<WaterIcon className="h-5 w-5" />}
              label="Hydration"
              value={
                pregnancyState.waterCups > 0
                  ? `${pregnancyState.waterCups}/${model.hydrationGoal} cups`
                  : "Start today"
              }
              detail={
                pregnancyState.waterCups > 0
                  ? "Daily water rhythm"
                  : "Add your first water check-in"
              }
              tint="bg-[#f5ded7]"
            />
            <StatTile
              icon={<BabyKickIcon className="h-5 w-5" />}
              label="Kick count"
              value={
                pregnancyState.kickCount > 0
                  ? `${pregnancyState.kickCount} today`
                  : "No kicks logged"
              }
              detail={
                pregnancyState.kickCount > 0
                  ? "Movement tracker"
                  : "Track movement gently when ready"
              }
              tint="bg-[#f6f3ee]"
            />
            <StatTile
              icon={<ScaleIcon className="h-5 w-5" />}
              label="Weight"
              value={
                model.hasWeightLog
                  ? `${model.currentWeight.toFixed(1)} kg`
                  : "Add first weight"
              }
              detail={
                model.hasWeightLog
                  ? `${model.totalGain >= 0 ? "+" : ""}${model.totalGain.toFixed(1)} kg total`
                  : "Used for clearer weekly trends"
              }
              tint="bg-[#f6f3ee]"
            />
            <StatTile
              icon={<CarePulseIcon className="h-5 w-5" />}
              label="Consult"
              value={pregnancyState.consultBooked ? "Booked" : "Open"}
              detail={getConsultModeLabel(pregnancyState.consultMode)}
              tint="bg-[#d5e9bf]"
            />
          </section>

          <section className={`cycle-card-rise mb-8 grid grid-cols-[1.1fr_0.9fr] gap-4 ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "180ms" }}>
            <article className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-[0_14px_34px_rgba(44,28,17,0.05)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/65">
                Growth milestone
              </p>
              <h3 className="mt-3 text-[1.5rem] font-semibold tracking-tight text-on-surface">
                Size of a {model.sizeLabel}
              </h3>
              <p className="mt-3 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                {model.growthSummary}
              </p>
              <p className="mt-4 rounded-[1.4rem] bg-[#faf4ef] p-4 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                {model.weightSummary}
              </p>
            </article>

            <article className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(246,243,238,0.98),rgba(255,255,255,0.92))] p-5 shadow-[0_14px_34px_rgba(44,28,17,0.05)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white shadow-sm">
                  <Bloop
                    state="pregnancy"
                    animated
                    size="small"
                    accessibilityLabel="Bloop pregnancy guide"
                    className="h-9 w-9 object-contain"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/65">
                    Bloop insight
                  </p>
                  <span className="mt-1 inline-flex rounded-full bg-primary/8 px-3 py-1 text-[10px] font-semibold text-primary">
                    {model.focusChip}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-[13px] font-medium leading-[1.7] text-on-surface-variant">
                {model.bloopMessage}
              </p>
            </article>
          </section>

          <section className={`cycle-card-rise mb-8 rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-[0_16px_38px_rgba(44,28,17,0.05)] ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "240ms" }}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Action center
                </p>
                <h3 className="mt-2 text-[1.3rem] font-semibold tracking-tight text-on-surface">
                  Support this week with simple check-ins
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/65">
                All actions live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton icon={<BabyKickIcon className="h-5 w-5" />} label="Start Kick Counter" detail="Track movement gently" tone="primary" onClick={() => setActiveSheet("kick")} />
              <ActionButton icon={<WaterIcon className="h-5 w-5" />} label="Add Water" detail={`Progress ${Math.round(waterProgress)}%`} tone="soft" onClick={handleAddWater} />
              <ActionButton icon={<ScaleIcon className="h-5 w-5" />} label="Log Daily Vitals" detail="Weight and energy" tone="soft" onClick={() => setActiveSheet("vitals")} />
              <ActionButton icon={<CalendarIcon className="h-5 w-5" />} label="Book Wellness Consult" detail="Choose care support" tone="soft" onClick={() => setActiveSheet("consult")} />
            </div>
            <button
              type="button"
              onClick={handleViewCarePlan}
              className="mt-4 w-full rounded-full border border-primary/12 bg-[#faf4ef] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-sm transition hover:bg-[#f8eee8] active:scale-[0.99]"
            >
              View care plan
            </button>
          </section>

          <section className={`cycle-card-rise mb-8 rounded-[2rem] border border-white/80 bg-surface-container-low/80 p-6 shadow-[0_16px_38px_rgba(44,28,17,0.05)] ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Weight journey
                </p>
                <h3 className="mt-1 text-[1.3rem] font-semibold tracking-tight text-on-surface">
                  Tracking your healthy range
                </h3>
              </div>
              <div className="text-right">
                <p className="text-[1.9rem] font-extralight tracking-tight text-primary">
                  {model.hasWeightLog ? model.currentWeight.toFixed(1) : "--"}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary">
                  {model.hasWeightLog
                    ? `${model.totalGain >= 0 ? "+" : ""}${model.totalGain.toFixed(1)} kg total`
                    : "No weight logged yet"}
                </p>
              </div>
            </div>
            {model.hasWeightLog ? (
              <div className="rounded-[1.75rem] bg-white/80 p-4">
                <div className="relative h-40 rounded-[1.5rem] bg-white/70 px-3 pb-10 pt-4">
                  <div className="absolute inset-x-3 bottom-10 top-4 rounded-[1.4rem] bg-secondary/6" />
                  <svg className="relative z-10 h-full w-full" viewBox="0 0 360 180" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="pregnancy-weight-area" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(82,100,66,0.22)" />
                        <stop offset="100%" stopColor="rgba(82,100,66,0)" />
                      </linearGradient>
                    </defs>
                    <path d={chart.areaPath} fill="url(#pregnancy-weight-area)" />
                    <path d={chart.linePath} fill="none" stroke="#526442" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {chart.points.map((point, index) => (
                      <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={index === chart.points.length - 1 ? 5 : 3.5} fill={index === chart.points.length - 1 ? "#9c3e24" : "#526442"} />
                    ))}
                  </svg>
                  <div className="absolute inset-x-4 bottom-3 z-10 flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/55">
                    {model.weightPoints.map((point, index) => (
                      <span key={`${point.label}-${index}`} className={index === model.weightPoints.length - 1 ? "text-primary" : ""}>
                        {point.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="relative z-10 mt-3 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/45">
                  <span>Healthy range</span>
                  <span>Recent trend</span>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-white/85 bg-white/86 p-6 text-center shadow-[0_10px_22px_rgba(44,28,17,0.04)]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/8 text-primary">
                  <ScaleIcon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 text-[1.05rem] font-semibold tracking-tight text-on-surface">
                  No weight trend yet
                </h4>
                <p className="mt-2 text-[13px] font-medium leading-[1.65] text-on-surface-variant">
                  Log your first weight when you feel ready. This chart will stay calm and empty until there is enough data to show something useful.
                </p>
              </div>
            )}
          </section>

          <section ref={carePlanRef} className={`cycle-card-rise mb-6 ${isLoaded ? "opacity-100" : "opacity-0"}`} style={{ animationDelay: "360ms" }}>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/60">
                  Care resources
                </p>
                <h3 className="mt-1 text-[1.35rem] font-semibold tracking-tight text-on-surface">
                  Support for this stage
                </h3>
              </div>
            </div>
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 hide-scrollbar">
              {model.resources.map((resource) => {
                return (
                  <button
                    key={resource.id}
                    type="button"
                    onClick={() => setSelectedResourceId(resource.id)}
                    className={`min-h-[10.5rem] min-w-[14.5rem] rounded-[1.8rem] border p-5 text-left shadow-[0_12px_28px_rgba(44,28,17,0.04)] transition-all ${
                      activeResourceId === resource.id
                        ? `${resource.tint} border-primary/18`
                        : "border-white/80 bg-white/88 hover:bg-[#fff8f5]"
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/65">{resource.meta}</p>
                    <h4 className="mt-4 text-[1.1rem] font-semibold tracking-tight text-on-surface">{resource.title}</h4>
                    <p className="mt-3 text-[13px] font-medium leading-[1.65] text-on-surface-variant">{resource.description}</p>
                  </button>
                );
              })}
            </div>
            {selectedResource ? (
              <div className="mt-4 rounded-[2rem] border border-white/80 bg-white/88 p-5 shadow-[0_14px_30px_rgba(44,28,17,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/65">
                      Selected guide
                    </p>
                    <h4 className="mt-2 text-[1.15rem] font-semibold tracking-tight text-on-surface">
                      {selectedResource.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleViewCarePlan}
                    className="rounded-full bg-primary px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:brightness-105 active:scale-[0.98]"
                  >
                    Keep in plan
                  </button>
                </div>
                <p className="mt-3 text-[13px] font-medium leading-[1.7] text-on-surface-variant">
                  {selectedResource.description}
                </p>
              </div>
            ) : null}
          </section>
        </main>

        <SanctuaryBottomNav />

        {activeSheet ? (
          <PregnancySupportSheet
            mode={activeSheet}
            week={model.week}
            initialState={pregnancyState}
            onClose={() => setActiveSheet(null)}
            onSave={handleSheetSave}
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

function StatTile({
  icon,
  label,
  value,
  detail,
  tint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tint: string;
}) {
  return (
    <article className={`rounded-[1.7rem] border border-white/80 p-4 shadow-[0_12px_28px_rgba(44,28,17,0.04)] ${tint}`}>
      <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/78 text-primary shadow-sm">
        {icon}
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/60">{label}</p>
      <h3 className="mt-2 text-[1.02rem] font-semibold tracking-tight text-on-surface">{value}</h3>
      <p className="mt-2 text-[12px] font-medium leading-[1.55] text-on-surface-variant">{detail}</p>
    </article>
  );
}

function ActionButton({
  icon,
  label,
  detail,
  tone,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  detail: string;
  tone: "primary" | "soft";
  onClick: () => void;
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary text-white shadow-[0_14px_28px_rgba(156,62,36,0.2)]"
      : "bg-[#faf4ef] text-on-surface border border-white/80";

  return (
    <button type="button" onClick={onClick} className={`flex min-h-[8.75rem] flex-col items-start justify-between rounded-[1.7rem] p-5 text-left transition hover:brightness-105 active:scale-[0.98] ${toneClass}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${tone === "primary" ? "bg-white/18" : "bg-white text-primary shadow-sm"}`}>{icon}</div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${tone === "primary" ? "text-white/75" : "text-on-surface-variant/60"}`}>{label}</p>
        <p className={`mt-2 text-[13px] font-semibold leading-[1.55] ${tone === "primary" ? "text-white" : "text-on-surface"}`}>{detail}</p>
      </div>
    </button>
  );
}

function getConsultModeLabel(mode: "virtual" | "clinic" | "midwife") {
  if (mode === "clinic") {
    return "Clinic visit";
  }

  if (mode === "midwife") {
    return "Midwife call";
  }

  return "Virtual consult";
}

function buildWeightChartModel(points: Array<{ label: string; value: number }>) {
  if (points.length === 0) {
    return {
      points: [],
      linePath: "",
      areaPath: "",
    };
  }

  const width = 360;
  const height = 180;
  const left = 12;
  const right = width - 12;
  const top = 22;
  const bottom = 122;
  const values = points.map((point) => point.value);
  const min = Math.max(0, Math.min(...values) - 0.6);
  const max = Math.max(...values) + 0.8;

  const chartPoints = points.map((point, index) => {
    const x = left + (index * (right - left)) / Math.max(points.length - 1, 1);
    const y = bottom - ((point.value - min) / Math.max(max - min, 0.001)) * (bottom - top);
    return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
  });

  const linePath = chartPoints.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = chartPoints[index - 1];
    const controlX = Number(((previous.x + point.x) / 2).toFixed(2));
    return `${path} Q ${controlX} ${previous.y} ${point.x} ${point.y}`;
  }, "");

  return {
    points: chartPoints,
    linePath,
    areaPath: `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${height} L ${chartPoints[0].x} ${height} Z`,
  };
}

function getTodayAtNoon() {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today;
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h8" />
    </svg>
  );
}

function VitalsIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M4 12h4l2 5 4-10 2 5h4" /><circle cx="12" cy="12" r="10" strokeOpacity="0.1" /></svg>; }
function WaterIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M12 2s6 6.36 6 11a6 6 0 1 1-12 0C6 8.36 12 2 12 2Z" /></svg>; }
function BabyKickIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M12 3c3.8 0 7 3.13 7 7 0 5-4.1 8.43-7 10-2.9-1.57-7-5-7-10 0-3.87 3.2-7 7-7Z" /><path d="M10 12c1.5-1 2.5-1.1 4 0" /></svg>; }
function ScaleIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M5 7h14" /><path d="M7 7 4 12a4 4 0 0 0 8 0L9 7" /><path d="m17 7-3 5a4 4 0 0 0 8 0l-3-5" /><path d="M12 7V3" /><path d="M8 21h8" /></svg>; }
function CarePulseIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M4 12h4l2.2-5 3.6 10 2.2-5H20" /><path d="M12 3v2" /></svg>; }
function CalendarIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>; }
function LotusIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 2s3 5 3 9c0 2-1.5 4-3 4s-3-2-3-4c0-4 3-9 3-9Zm-6 6s2.5 3 2.5 5c0 1.5-1 2.5-2.5 2.5S3 14 3 12.5C3 10.5 6 8 6 8Zm12 0s-2.5 3-2.5 5c0 1.5 1 2.5 2.5 2.5s3-1.5 3-3C21 10.5 18 8 18 8Zm-6 8.5c-2 0-4 2-4 4.5 0 0 2 0 4-2 2 2 4 2 4 2 0-2.5-2-4.5-4-4.5Z" /></svg>; }
function CycleIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>; }
function ProfileUserIcon({ className }: { className?: string }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" /></svg>; }
function PregnancyBloom({ className }: { className?: string }) { return <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true"><path d="M50 16C58 30 78 34 82 50C78 66 58 70 50 84C42 70 22 66 18 50C22 34 42 30 50 16Z" /><circle cx="50" cy="50" r="9" fill="currentColor" /></svg>; }
function PregnancyLeaf({ className }: { className?: string }) { return <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true"><path d="M20 84C50 84 72 62 72 34C72 24 78 14 88 8C84 22 86 40 76 58C66 76 48 88 20 84Z" /></svg>; }
function PregnancyPetal({ className }: { className?: string }) { return <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true"><path d="M50 10C65 30 90 40 90 60C90 80 65 90 50 100C35 90 10 80 10 60C10 40 35 30 50 10Z" /></svg>; }
