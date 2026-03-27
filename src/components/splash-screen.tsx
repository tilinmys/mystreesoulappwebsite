import { Bloop } from "@/components/common/Bloop";

type SplashScreenProps = {
  className?: string;
};

type IconProps = {
  className?: string;
};

const ambience = [
  { label: "Grounding", Icon: LeafIcon },
  { label: "Spark", Icon: SparkleIcon },
  { label: "Rest", Icon: MoonIcon },
];

export function SplashScreen({ className = "" }: SplashScreenProps) {
  return (
    <section
      className={`splash-gradient absolute inset-0 isolate flex overflow-hidden ${className}`}
      aria-label="Splash screen"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="float-drift absolute -left-24 top-[-8%] h-72 w-72 rounded-full bg-primary/10 blur-[110px]" />
        <div className="float-drift absolute -right-16 bottom-[10%] h-64 w-64 rounded-full bg-secondary/10 blur-[110px] [animation-delay:1.6s]" />
        <div className="absolute -right-20 top-[34%] h-64 w-64 rounded-full border border-primary/10 opacity-40" />
        <div className="absolute -left-28 bottom-[22%] h-80 w-80 rounded-full border border-secondary/10 opacity-30" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-8 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-[calc(env(safe-area-inset-top)+2.5rem)] text-center">
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <div className="relative mb-5 flex h-40 w-40 items-center justify-center md:h-48 md:w-48">
            <div className="halo-ring absolute inset-4 rounded-full border border-white/30 bg-white/15 backdrop-blur-sm" />
            <div className="halo-ring halo-ring-delayed absolute inset-2 rounded-full border border-primary/15" />
            <div className="absolute inset-6 rounded-full bg-white/55 blur-3xl" />
            <div className="bloop-beat relative z-10 rounded-[2rem] border border-white/70 bg-white/65 p-3 shadow-[0_20px_45px_rgba(156,62,36,0.12)] backdrop-blur-md">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[1.45rem] md:h-40 md:w-40">
                <Bloop
                  state="idle"
                  priority
                  animated
                  size="hero"
                  accessibilityLabel="Bloop, a soft and reassuring companion character for MyStree Soul."
                  sizes="(min-width: 768px) 10rem, 8rem"
                  className="h-full w-full rounded-[1.45rem] object-cover drop-shadow-[0_16px_40px_rgba(156,62,36,0.22)]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/45 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-primary shadow-[0_10px_30px_rgba(156,62,36,0.08)] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Soft Launch Flow
            </p>
            <div className="space-y-3">
              <h1 className="text-[2.3rem] font-extrabold tracking-[0.08em] text-primary md:text-[3rem]">
                MyStree Soul
              </h1>
              <p className="mx-auto max-w-[18rem] text-[0.66rem] font-medium uppercase leading-relaxed tracking-[0.32em] text-[#2d2a26]/80 md:max-w-sm md:text-xs">
                your cycle, with more clarity and care.
              </p>
            </div>
          </div>

          <div
            className="mt-16 flex flex-col items-center gap-4"
            role="status"
            aria-live="polite"
          >
            <div className="relative h-px w-16 overflow-hidden rounded-full bg-outline-variant/45">
              <div className="loading-bar absolute inset-y-0 left-0 w-8 rounded-full bg-primary/70" />
            </div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-on-surface/55">
              Preparing your private space
            </p>
            <span className="sr-only">Loading the MyStree Soul app.</span>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 opacity-[0.85]">
          <div className="flex items-center gap-7 rounded-full border border-white/55 bg-white/40 px-5 py-2.5 shadow-[0_12px_30px_rgba(82,100,66,0.08)] backdrop-blur-sm">
            {ambience.map(({ label, Icon }) => (
              <span key={label} className="text-primary/45" aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
            ))}
          </div>
          <p className="inline-flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-outline">
            <ShieldIcon className="h-3.5 w-3.5 text-secondary" />
            Private &amp; Secure
          </p>
        </div>
      </div>
    </section>
  );
}

function LeafIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 13c0-5.2 4.8-8 11-8 0 6.2-2.8 11-8 11" />
      <path d="M5 19c1.5-3.4 4.8-6.7 9-9" />
    </svg>
  );
}

function SparkleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
      <path d="m18 15 .8 1.9L21 18l-2.2.9L18 21l-.8-2.1L15 18l2.2-1.1L18 15Z" />
    </svg>
  );
}

function MoonIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3c2.7 2.1 5.6 3.1 8 3.4v5.1c0 5.3-3.4 8.5-8 9.5-4.6-1-8-4.2-8-9.5V6.4C6.4 6.1 9.3 5.1 12 3Z" />
      <path d="m9.4 12.3 1.7 1.7 3.6-3.8" />
    </svg>
  );
}
