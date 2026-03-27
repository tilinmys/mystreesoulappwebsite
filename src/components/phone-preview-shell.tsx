import type { ReactNode } from "react";

type PhonePreviewShellProps = {
  children: ReactNode;
};

export function PhonePreviewShell({ children }: PhonePreviewShellProps) {
  return (
    <main className="app-stage relative min-h-screen overflow-hidden px-0 py-0 md:px-6 md:py-8">
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-[150%] rounded-full bg-primary/8 blur-[130px]" />
        <div className="absolute right-1/2 bottom-20 h-72 w-72 translate-x-[155%] rounded-full bg-secondary/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] items-stretch justify-center md:min-h-0 md:max-w-[460px]">
        <div className="phone-shell relative flex w-full flex-1 overflow-hidden bg-background md:min-h-[860px] md:rounded-[2.75rem] md:border-[10px] md:border-[#201916] md:shadow-[0_36px_120px_rgba(28,19,16,0.28)]">
          <div className="pointer-events-none absolute left-1/2 top-3 z-40 hidden h-7 w-36 -translate-x-1/2 rounded-full bg-[#201916] md:block" />
          <div className="relative flex w-full flex-1 overflow-hidden md:rounded-[2.1rem]">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
