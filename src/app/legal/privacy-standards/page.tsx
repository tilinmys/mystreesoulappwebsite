import Link from "next/link";
import { PhonePreviewShell } from "@/components/phone-preview-shell";

const sections = [
  {
    title: "What we collect",
    body:
      "In this prototype, we only collect the information you enter into onboarding and logging screens, such as your name, cycle dates, symptoms, and preferences.",
  },
  {
    title: "How data is stored",
    body:
      "Your current beta data is stored locally in your browser for testing. We do not sell period data, and this prototype does not connect to third-party advertising systems.",
  },
  {
    title: "Your control",
    body:
      "You can clear local health logs and session data from Settings. Privacy and control should stay visible and understandable at every stage of the product.",
  },
];

export default function PrivacyStandardsPage() {
  return (
    <PhonePreviewShell>
      <section className="welcome-gradient relative flex min-h-screen flex-col overflow-hidden px-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+2rem)] md:min-h-[860px] md:pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />
          <div className="absolute bottom-16 left-[-18%] h-52 w-52 rounded-full bg-secondary/10 blur-[110px]" />
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <Link
            href="/privacy"
            className="inline-flex h-11 w-fit items-center rounded-full border border-white/60 bg-white/55 px-4 text-sm font-medium text-on-surface/70 backdrop-blur-md transition hover:text-primary"
          >
            Back
          </Link>

          <div className="rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-[0_18px_40px_rgba(156,62,36,0.08)] backdrop-blur-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary/70">
              Privacy Policy
            </p>
            <h1 className="mt-3 text-3xl font-light leading-tight text-on-surface">
              Your cycle data stays in your control.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-on-surface/70">
              This beta privacy page explains what data the prototype uses and how it is handled right now.
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[1.6rem] border border-white/70 bg-white/76 p-5 shadow-sm backdrop-blur-md"
              >
                <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-on-surface/75">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PhonePreviewShell>
  );
}
