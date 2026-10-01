"use client";

import { usePathname } from "next/navigation";
import type { Profile } from "@/types/domain/profile";
import { ThemePicker } from "@/components/theme/theme-picker";
import { BrandLogo } from "@/components/brand/brand-logo";
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet";
import { ClipboardList, PlusCircle } from "lucide-react";

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
      <div className="flex items-center gap-sm lg:hidden">
        <MobileNavSheet
          label="Recruiter"
          items={[
            { href: "/recruiter/assessments", label: "Assessments", icon: ClipboardList },
            { href: "/recruiter/assessments/new", label: "New assessment", icon: PlusCircle },
          ]}
        />
        <BrandLogo variant="mark" href="/recruiter/assessments" />
      </div>
      <div className="hidden items-center lg:flex">
        <h1 className="font-headline-md text-headline-md font-bold text-foreground">{title}</h1>
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
