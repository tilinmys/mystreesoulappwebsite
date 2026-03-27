import Link from "next/link";
import { PhonePreviewShell } from "@/components/phone-preview-shell";

const sections = [
  {
    title: "Using the prototype",
    body:
      "MyStree Soul is currently a product prototype. The information in this experience is for tracking and wellness support only and should not replace medical advice, diagnosis, or emergency care.",
  },
  {
    title: "Your responsibility",
    body:
      "Please use accurate information when logging cycle dates, symptoms, and health details. Predictions and reminders depend on the data you provide and may not reflect medical certainty.",
  },
  {
    title: "Account and local data",
    body:
      "This beta flow stores account and tracking data locally for demonstration purposes. Signing out may clear or reset the prototype experience depending on the flow being tested.",
  },
];

export default function TermsPage() {
  return (
    <PhonePreviewShell>
      <section className="welcome-gradient relative flex min-h-screen flex-col overflow-hidden px-8 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+2rem)] md:min-h-[860px] md:pt-[calc(env(safe-area-inset-top)+4.5rem)]">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-[110px]" />
          <div className="absolute bottom-16 right-[-18%] h-52 w-52 rounded-full bg-secondary/10 blur-[110px]" />
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
              Terms
            </p>
            <h1 className="mt-3 text-3xl font-light leading-tight text-on-surface">
              Clear terms for using the app.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-on-surface/70">
              These beta terms explain how this prototype should be used while we continue building the full product.
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
