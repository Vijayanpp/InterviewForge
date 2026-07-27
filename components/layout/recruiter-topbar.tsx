"use client";

import { usePathname } from "next/navigation";
import type { Profile } from "@/types/domain/profile";
import { ThemePicker } from "@/components/theme/theme-picker";
import { BrandLogo } from "@/components/brand/brand-logo";

function titleFor(pathname: string): string {
  if (pathname.includes("/new")) return "New assessment";
  if (pathname.match(/\/assessments\/[^/]+/)) return "Assessment";
  if (pathname.includes("/assessments")) return "Assessments";
  if (pathname.includes("/onboarding")) return "Set up recruiter";
  return "Recruiter";
}

export function RecruiterTopbar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const title = titleFor(pathname);
  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-lg backdrop-blur-md">
      <div className="flex items-center lg:hidden">
        <BrandLogo variant="mark" href="/recruiter/assessments" />
      </div>
      <div className="hidden items-center lg:flex">
        <h2 className="font-headline-md text-headline-md font-bold text-foreground">{title}</h2>
      </div>
      <div className="flex items-center gap-md">
        <ThemePicker variant="topbar" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted font-label-md text-label-md font-semibold text-foreground">
          {initials}
        </div>
      </div>
    </header>
  );
}
