"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bloop } from "@/components/common/Bloop";
import { PhonePreviewShell } from "@/components/phone-preview-shell";
import {
  getAnswerLabel,
  getQuestionnaireConfig,
  normalizeSupportArea,
  type QuestionnaireQuestion,
} from "@/lib/onboarding-questionnaire";
import {
  type OnboardingAnswer,
  type OnboardingState,
} from "@/lib/onboarding-state";
import { useOnboardingFormState } from "@/lib/use-onboarding-form-state";

type ComfortGraphic = {
  Icon: React.FC<{ className?: string }>;
  color: string;
  size: string;
};

function getComfortGraphics(
  supportArea: string,
  isComplete: boolean,
): ComfortGraphic[] {
  if (isComplete) {
    return [
      { Icon: CrescentMoonSvg, color: "text-[#d96c4e]", size: "w-24 h-24" },
      { Icon: BotanicalPetal, color: "text-[#bc563a]", size: "w-32 h-32" },
      { Icon: BotanicalLeaf, color: "text-[#9caf88]", size: "w-36 h-36" },
      { Icon: SoftDropletSvg, color: "text-[#e47558]", size: "w-20 h-20" },
      { Icon: ReliefPillSvg, color: "text-[#e0b0af]", size: "w-24 h-24" },
    ];
  }
  switch (supportArea) {
    case "fertility":
    case "pregnancy":
      return [
        { Icon: SproutSvg, color: "text-[#bc563a]", size: "w-28 h-28" },
        { Icon: HotWaterBottleSvg, color: "text-[#e0b0af]", size: "w-28 h-28" },
        { Icon: BotanicalLeaf, color: "text-[#9caf88]", size: "w-32 h-32" },
        { Icon: CrescentMoonSvg, color: "text-[#d96c4e]", size: "w-24 h-24" },
        { Icon: SoftDropletSvg, color: "text-[#e47558]", size: "w-20 h-20" },
      ];
    case "menopause":
      return [
        { Icon: BotanicalLeaf, color: "text-[#9caf88]", size: "w-32 h-32" },
        { Icon: CrescentMoonSvg, color: "text-[#e0b0af]", size: "w-28 h-28" },
        { Icon: HotWaterBottleSvg, color: "text-[#d96c4e]", size: "w-32 h-32" },
        { Icon: MenstrualCupSvg, color: "text-[#bc563a]", size: "w-24 h-24" },
        { Icon: SoftDropletSvg, color: "text-[#e47558]", size: "w-20 h-20" },
      ];
    case "cycle_tracker":
    case "adolescence":
    default:
      return [
        { Icon: ComfortPadSvg, color: "text-[#e47558]", size: "w-32 h-32" },
        { Icon: MenstrualCupSvg, color: "text-[#bc563a]", size: "w-24 h-24" },
        { Icon: HotWaterBottleSvg, color: "text-[#d96c4e]", size: "w-28 h-28" },
        { Icon: SoftDropletSvg, color: "text-[#e0b0af]", size: "w-24 h-24" },
        { Icon: ReliefPillSvg, color: "text-[#9caf88]", size: "w-20 h-20" },
      ];
  }
}

export function OnboardingStepFour() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const { formState, updateFormState } = useOnboardingFormState();

  const supportArea = normalizeSupportArea(formState.supportArea);
  const questionnaire = getQuestionnaireConfig(
    supportArea,
    formState.questionnaireAnswers,
  );
  const questions = questionnaire.questions;
  const safeIndex = Math.min(questionIndex, Math.max(questions.length - 1, 0));
  const currentQuestion = questions[safeIndex];
  const currentAnswer = currentQuestion
    ? formState.questionnaireAnswers[currentQuestion.id]
    : undefined;
  const hasCurrentAnswer = currentQuestion
    ? hasAnswer(formState, currentQuestion.id)
    : false;
  const isLastQuestion = safeIndex === questions.length - 1;
  const answeredCount = questions.filter((question) =>
    hasAnswer(formState, question.id),
  ).length;
  const progressWidth = isComplete
    ? 100
    : ((safeIndex + 1) / Math.max(questions.length, 1)) * 100;
  const bloopCopy = isComplete
    ? "I have what I need to personalize your care gently."
    : hasCurrentAnswer
      ? "Perfect. I will keep the next step just as focused."
      : currentQuestion?.guide ?? "This helps me understand you better.";
  const summaryItems = questions
    .map((question) => {
      return {
        id: question.id,
        label: question.prompt,
        value: getAnswerLabel(
          question,
          formState.questionnaireAnswers[question.id],
        ),
      };
    })
    .filter((item) => item.value)
    .slice(0, 4);

  const currentGraphics = getComfortGraphics(supportArea, isComplete);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setIsLoaded(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function updateAnswer(questionId: string, answer: OnboardingAnswer) {
    updateFormState({
      questionnaireAnswers: {
        ...formState.questionnaireAnswers,
        [questionId]: answer,
      },
    });
  }

  function handleBack() {
    if (isComplete) {
      setIsComplete(false);
      return;
    }

    if (safeIndex === 0) {
      startTransition(() => {
        router.push("/onboarding/goals");
      });
      return;
    }

    setQuestionIndex((current) => current - 1);
  }

  function handleNext() {
    if (!hasCurrentAnswer) {
      return;
    }

    if (isLastQuestion) {
      setIsComplete(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
  }

  function handleSkip() {
    if (isLastQuestion) {
      setIsComplete(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
  }

  function handleFinish() {
    startTransition(() => {
      router.push("/onboarding/summary");
    });
  }

  return (
    <PhonePreviewShell>
      <section className="relative grid h-[100dvh] w-full grid-rows-[auto_1fr_auto] overflow-hidden bg-background text-on-surface md:h-[860px]">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -left-24 top-18 h-80 w-80 rounded-full bg-primary-fixed/40 blur-[110px]" />
          <div className="absolute bottom-[-5rem] right-[-4rem] h-96 w-96 rounded-full bg-secondary-container/18 blur-[140px]" />
          <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_24%,rgba(156,62,36,0.06),transparent_28%),radial-gradient(circle_at_84%_72%,rgba(188,86,58,0.08),transparent_24%)]" />
        </div>

        <div
          key={isComplete ? "complete-overlay" : currentQuestion.id}
          className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flower-enter-left absolute -left-12 top-28 w-28 text-[#d96c4e]/18">
            <BotanicalPetal />
          </div>
          <div className="flower-enter-right absolute -right-8 bottom-44 w-36 text-[#9caf88]/18">
            <BotanicalLeaf />
          </div>
          
          {/* Contextual Vector Graphics Background layer */}
          {currentGraphics.map((graphic, idx) => {
            const layouts = [
              [
                "top-16 left-6 garden-blast-tl float-slow",
                "bottom-32 right-8 garden-blast-br sway-slow delay-[100ms]",
                "top-[40%] right-10 garden-blast-tr drift-slow delay-[200ms]",
                "bottom-[20%] left-10 garden-blast-bl float-slow delay-[300ms]",
                "top-10 right-1/4 flower-enter-right sway-slow delay-[400ms]",
              ],
              [
                "top-[35%] left-8 garden-blast-bl drift-slow",
                "bottom-24 right-1/4 garden-blast-br float-slow delay-[150ms]",
                "top-20 right-6 garden-blast-tr sway-slow delay-[300ms]",
                "top-8 left-1/3 flower-enter-left float-slow delay-[450ms]",
                "bottom-[35%] left-6 garden-blast-tl drift-slow delay-[600ms]",
              ],
              [
                "bottom-24 left-1/4 garden-blast-bl sway-slow",
                "top-20 right-1/4 flower-enter-right drift-slow delay-[100ms]",
                "bottom-[40%] right-6 garden-blast-br float-slow delay-[200ms]",
                "top-[28%] left-8 garden-blast-tl sway-slow delay-[300ms]",
                "top-12 right-8 garden-blast-tr float-slow delay-[400ms]",
              ],
              [
                "top-24 right-1/3 garden-blast-tr float-slow",
                "bottom-28 left-6 garden-blast-bl sway-slow delay-[100ms]",
                "top-12 left-10 garden-blast-tl drift-slow delay-[200ms]",
                "bottom-[30%] right-8 garden-blast-br float-slow delay-[300ms]",
                "top-[45%] left-1/4 flower-enter-left sway-slow delay-[400ms]",
              ],
            ];
            
            const currentLayout = layouts[safeIndex % layouts.length];
            const posClass = currentLayout[idx % currentLayout.length];
            
            return (
              <div 
                key={idx} 
                className={`absolute ${posClass}`}
                style={{ animationFillMode: 'both' }}
              >
                <div className={`${graphic.size} ${graphic.color} opacity-[0.25] drop-shadow-sm`}>
                  <graphic.Icon />
                </div>
              </div>
            );
          })}
        </div>

        <header className="relative z-20 flex items-center justify-between px-6 py-4 backdrop-blur-xl md:pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary transition hover:bg-surface-container-low active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary/85">
              Step 4 of 4
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-outline/80">
              Intelligent Questionnaire
            </p>
          </div>
          <div className="w-10" />
        </header>

        <main className="relative z-20 flex min-h-0 flex-col px-6 pb-6">
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
            <div className="mb-8 flex flex-col items-center gap-2 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline">
                {isComplete
                  ? `${answeredCount}/${questions.length} answered`
                  : `${safeIndex + 1}/${questions.length} questions`}
              </span>
              <div className="h-[3px] w-20 overflow-hidden rounded-full bg-outline-variant/30">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>

            <div className="mb-7 flex flex-col items-center text-center">
              <div
                className={`question-bloop-shell relative mb-4 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white/70 shadow-[0_18px_40px_rgba(156,62,36,0.12)] ring-1 ring-white/80 backdrop-blur-xl transition-all duration-500 ${
                  hasCurrentAnswer || isComplete
                    ? "scale-[1.04] shadow-[0_24px_48px_rgba(156,62,36,0.18)]"
                    : ""
                }`}
              >
                <div className="question-bloop-glow absolute inset-0 rounded-[2rem] bg-primary-fixed/45 blur-2xl" />
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-surface-container-low/85 shadow-inner">
                  <Bloop
                    state="guide"
                    animated
                    width={48}
                    priority
                    accessibilityLabel="Bloop guiding the onboarding questions"
                    className="h-auto w-auto object-contain"
                  />
                </div>
              </div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary/80">
                {questionnaire.pillarLabel}
              </p>
              <p className="max-w-[18rem] text-[12px] leading-relaxed text-on-surface-variant">
                {bloopCopy}
              </p>
            </div>

            {isComplete ? (
              <section
                key="questionnaire-complete"
                className="question-panel-enter rounded-[1.9rem] bg-[#fffdfc]/92 p-6 shadow-[0_30px_70px_rgba(45,42,38,0.08)] ring-1 ring-white/80 backdrop-blur-xl"
              >
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-primary/70">
                  Personalized and ready
                </p>
                <h2 className="text-[1.95rem] font-light leading-tight tracking-tight text-[#2d2a26]">
                  {questionnaire.completionTitle}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[#746b63]">
                  {questionnaire.completionDescription}
                </p>

                <div className="mt-6 space-y-3">
                  {summaryItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1.4rem] bg-surface-container-low/85 px-4 py-3"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-outline/85">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-on-surface">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.5rem] bg-primary-fixed/25 px-4 py-4">
                  <p className="text-[11px] leading-relaxed text-on-surface-variant">
                    {questionnaire.pillarSummary} Your answers stay private and
                    only shape the care that appears for you.
                  </p>
                </div>
              </section>
            ) : (
              <section
                key={currentQuestion.id}
                className="question-panel-enter rounded-[1.9rem] bg-[#fffdfc]/92 p-6 shadow-[0_30px_70px_rgba(45,42,38,0.08)] ring-1 ring-white/80 backdrop-blur-xl"
              >
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-primary/70">
                  {questionnaire.pillarLabel}
                </p>
                <h2 className="text-[1.95rem] font-light leading-tight tracking-tight text-[#2d2a26]">
                  {currentQuestion.prompt}
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-[#746b63]">
                  {currentQuestion.helper}
                </p>

                <div className="mt-6">
                  <QuestionInput
                    question={currentQuestion}
                    answer={currentAnswer}
                    onAnswer={updateAnswer}
                  />
                </div>
              </section>
            )}
          </div>
        </main>

        <footer className="footer-lift relative z-30 bg-gradient-to-t from-background via-background/95 to-transparent px-6 pb-[calc(env(safe-area-inset-bottom)+1.1rem)] pt-4">
          {isComplete ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsComplete(false)}
                className="inline-flex h-14 flex-1 items-center justify-center rounded-full bg-surface-container-low/85 px-6 text-[12px] font-bold uppercase tracking-[0.18em] text-on-surface shadow-sm backdrop-blur-md transition hover:brightness-105 active:scale-95"
              >
                Review
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="tactile-pill inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full px-6 text-[12px] font-bold uppercase tracking-[0.18em] text-white"
              >
                Secure My Space
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="inline-flex h-14 items-center justify-center rounded-full px-5 text-[12px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant transition hover:text-primary active:scale-95"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasCurrentAnswer}
                className="tactile-pill inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full px-6 text-[12px] font-bold uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLastQuestion ? "Finish" : "Next"}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </footer>
      </section>
    </PhonePreviewShell>
  );
}

type QuestionInputProps = {
  question: QuestionnaireQuestion;
  answer: OnboardingAnswer | undefined;
  onAnswer: (questionId: string, answer: OnboardingAnswer) => void;
};

function QuestionInput({ question, answer, onAnswer }: QuestionInputProps) {
  if (question.type === "cards") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {question.options?.map((option) => {
          const active = answer === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onAnswer(question.id, option.value)}
              className={`rounded-[1.45rem] px-4 py-4 text-left transition-all duration-300 active:scale-[0.98] ${
                active
                  ? "scale-[1.01] bg-primary/10 ring-2 ring-primary shadow-[0_14px_26px_rgba(156,62,36,0.12)]"
                  : "bg-surface-container-low/80 ring-1 ring-outline-variant/25 hover:bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-on-surface">
                {option.label}
              </p>
              {option.description ? (
                <p className="mt-2 text-[11px] leading-relaxed text-on-surface-variant">
                  {option.description}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "slider") {
    const numericAnswer =
      typeof answer === "number"
        ? answer
        : question.defaultValue ?? question.min ?? 0;

    return (
      <div className="rounded-[1.5rem] bg-surface-container-low/75 px-4 py-5">
        <div className="mb-5 text-center">
          <div className="text-5xl font-light tracking-tight text-primary">
            {numericAnswer}
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-outline/85">
            {question.unit}
          </p>
        </div>
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={question.step ?? 1}
          value={numericAnswer}
          onChange={(event) =>
            onAnswer(question.id, Number(event.target.value))
          }
          className="cycle-slider w-full"
        />
        <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-outline/80">
          <span>{question.minLabel}</span>
          <span>{question.maxLabel}</span>
        </div>
      </div>
    );
  }

  if (question.type === "toggle") {
    const isDefined = typeof answer === "boolean";
    const enabled = answer === true;

    return (
      <button
        type="button"
        onClick={() => onAnswer(question.id, !enabled)}
        className={`flex w-full items-center justify-between rounded-[1.5rem] px-4 py-4 text-left transition-all duration-300 active:scale-[0.99] ${
          isDefined
            ? "bg-primary/10 ring-2 ring-primary"
            : "bg-surface-container-low/80 ring-1 ring-outline-variant/25"
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-on-surface">
            {enabled ? "Yes, keep this on" : "Not for now"}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
            Tap again anytime to switch the preference.
          </p>
        </div>
        <span
          className={`relative ml-4 h-8 w-14 shrink-0 rounded-full transition-colors duration-300 ${
            enabled ? "bg-primary" : "bg-outline-variant/70"
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ${
              enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {question.options?.map((option) => {
        const active = answer === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onAnswer(question.id, option.value)}
            className={`flex w-full items-center justify-between rounded-full px-5 py-4 text-left transition-all duration-300 active:scale-[0.99] ${
              active
                ? "scale-[1.01] bg-primary/10 ring-2 ring-primary shadow-[0_14px_24px_rgba(156,62,36,0.12)]"
                : "bg-surface-container-low/80 ring-1 ring-outline-variant/25 hover:bg-white"
            }`}
          >
            <span className="text-[15px] font-medium text-on-surface">
              {option.label}
            </span>
            <span
              className={`h-5 w-5 rounded-full border transition-all duration-300 ${
                active
                  ? "border-primary bg-primary shadow-[0_0_0_4px_rgba(156,62,36,0.12)]"
                  : "border-outline-variant"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function hasAnswer(formState: OnboardingState, questionId: string): boolean {
  return Object.prototype.hasOwnProperty.call(
    formState.questionnaireAnswers,
    questionId,
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 18 9 12l6-6" />
    </svg>
  );
}

function ArrowRightIcon({ className }: IconProps) {
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
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function BotanicalLeaf() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0 100C30 100 50 70 50 50C50 30 70 0 100 0C70 20 50 50 50 70C50 90 30 100 0 100Z" opacity="0.85" />
    </svg>
  );
}

function BotanicalPetal() {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M50 10C65 30 90 40 90 60C90 80 65 90 50 100C35 90 10 80 10 60C10 40 35 30 50 10Z" opacity="0.78" />
    </svg>
  );
}

function ComfortPadSvg({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="35" y="10" width="30" height="80" rx="15" fill="currentColor" fillOpacity="0.8"/>
      <path d="M35 30C20 30 15 40 15 50C15 60 20 70 35 70V30Z" fill="currentColor" fillOpacity="0.4"/>
      <path d="M65 30C80 30 85 40 85 50C85 60 80 70 65 70V30Z" fill="currentColor" fillOpacity="0.4"/>
      <rect x="42" y="20" width="16" height="60" rx="8" fill="white" fillOpacity="0.3"/>
    </svg>
  );
}

function MenstrualCupSvg({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <ellipse cx="50" cy="30" rx="25" ry="8" stroke="currentColor" strokeWidth="6" fill="transparent"/>
      <path d="M25 30C25 60 40 80 50 85C60 80 75 60 75 30" fill="currentColor" fillOpacity="0.7"/>
      <path d="M50 85V95" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      <path d="M35 45C35 55 42 65 50 70" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4"/>
    </svg>
  );
}

function SoftDropletSvg({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M50 15C50 15 20 50 20 70C20 86.5 33.5 100 50 100C66.5 100 80 86.5 80 70C80 50 50 15 50 15Z" fill="currentColor" fillOpacity="0.85"/>
      <path d="M50 35C50 35 30 60 30 75C30 86 39 95 50 95C61 95 70 86 70 75C70 60 50 35 50 35Z" fill="white" fillOpacity="0.2"/>
      <path d="M35 70A15 15 0 0 1 50 55" stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.5"/>
    </svg>
  );
}

function HotWaterBottleSvg({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <rect x="42" y="10" width="16" height="15" rx="2" fill="currentColor" fillOpacity="0.9"/>
      <rect x="25" y="25" width="50" height="65" rx="15" fill="currentColor" fillOpacity="0.75"/>
      <line x1="35" y1="35" x2="35" y2="80" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="45" y1="35" x2="45" y2="80" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="55" y1="35" x2="55" y2="80" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.3"/>
      <line x1="65" y1="35" x2="65" y2="80" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.3"/>
    </svg>
  );
}

function ReliefPillSvg({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <g transform="rotate(45 50 50)">
        <rect x="30" y="20" width="40" height="30" fill="currentColor" fillOpacity="0.9" rx="15" stroke="currentColor" strokeWidth="2"/>
        <rect x="30" y="50" width="40" height="30" fill="transparent" stroke="currentColor" strokeWidth="6" rx="15"/>
        <path d="M40 30L60 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.4"/>
      </g>
    </svg>
  );
}

function CrescentMoonSvg({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C67.6 90 82.6 78.6 88 62.9C83.4 67 77.1 69.5 70 69.5C51.6 69.5 36.6 54.5 36.6 36.1C36.6 24.5 42.6 14.4 51.7 8.5C51.1 8.5 50.6 8.4 50 8.4V10Z" fill="currentColor" fillOpacity="0.8"/>
      <circle cx="75" cy="30" r="4" fill="currentColor" fillOpacity="0.5"/>
      <circle cx="85" cy="45" r="2" fill="currentColor" fillOpacity="0.4"/>
    </svg>
  );
}

function SproutSvg({ className }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M50 90V50" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      <path d="M50 60C30 60 20 40 20 20C40 20 50 40 50 60Z" fill="currentColor" fillOpacity="0.8"/>
      <path d="M50 70C75 70 90 55 90 30C65 30 50 50 50 70Z" fill="currentColor" fillOpacity="0.6"/>
    </svg>
  );
}
