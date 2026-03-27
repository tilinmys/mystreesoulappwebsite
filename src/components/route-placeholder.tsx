import Link from "next/link";
import type { ReactNode } from "react";
import { PhonePreviewShell } from "@/components/phone-preview-shell";

type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  backHref: string;
  icon: ReactNode;
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  primaryLabel,
  backHref,
  icon,
}: RoutePlaceholderProps) {
  return (
    <PhonePreviewShell>
      <section className="welcome-gradient relative flex min-h-screen flex-col overflow-hidden px-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+2rem)] md:min-h-[860px] md:pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />
          <div className="absolute bottom-16 right-[-18%] h-52 w-52 rounded-full bg-secondary/10 blur-[110px]" />
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div className="space-y-6">
            <Link
              href={backHref}
              className="inline-flex h-11 items-center rounded-full border border-white/60 bg-white/55 px-4 text-sm font-medium text-on-surface/70 backdrop-blur-md transition hover:text-primary"
            >
              Back
            </Link>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/70 text-primary shadow-[0_18px_35px_rgba(156,62,36,0.12)] backdrop-blur-md">
              {icon}
            </div>
          </div>

          <div className="space-y-5 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/70">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-light leading-tight text-on-surface">
              {title}
            </h1>
            <p className="max-w-xs text-base leading-relaxed text-on-surface/70">
              {description}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href={backHref}
              className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-container px-6 text-base font-semibold text-white shadow-[0_16px_40px_rgba(156,62,36,0.2)]"
            >
              {primaryLabel}
            </Link>
            <p className="text-center text-[11px] uppercase tracking-[0.3em] text-outline/70">
              Phase 3 placeholder wired and ready
            </p>
          </div>
        </div>
      </section>
    </PhonePreviewShell>
  );
}
