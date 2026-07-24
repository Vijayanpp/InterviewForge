import { BrandLogo } from "@/components/brand/brand-logo";
import { BRAND_HEADLINE, BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const STATS = [
  { value: "21", label: "Technology Tracks" },
  { value: "AI", label: "Adaptive Interviewer" },
];

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen w-full overflow-hidden">
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar-gradient p-xl lg:flex">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--sidebar-primary)_28%,transparent),transparent_60%)]" />

        {/* Spacer keeps the original top/bottom balance without a side logo */}
        <div className="relative z-10" aria-hidden />

        <div className="relative z-10 max-w-lg">
          <p className="mb-md text-[11px] font-semibold uppercase tracking-[0.22em] text-sidebar-ring">
            {BRAND_TAGLINE}
          </p>
          <h2 className="mb-md font-headline-xl text-headline-xl text-white">
            {BRAND_HEADLINE}
          </h2>
          <p className="font-body-lg text-body-lg text-sidebar-foreground/70">
            Practise realistic interviews across 21 technology tracks with adaptive questioning,
            honest evaluation, and a personalised improvement plan.
          </p>
          <div className="mt-xl flex gap-xl">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-headline-md text-headline-md text-white">{stat.value}</div>
                <div className="font-label-sm text-label-sm uppercase tracking-widest text-sidebar-foreground/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-sidebar-foreground/40">
          © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </p>
      </section>

      <section className="flex w-full flex-col items-center justify-center overflow-y-auto bg-background p-md lg:w-1/2 lg:p-xl">
        <div className="w-full max-w-md space-y-xl py-xl">
          <div className="mb-xl flex flex-col items-center gap-sm">
            <BrandLogo variant="compact" href="/" priority />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
