"use client";

import { usePathname } from "next/navigation";
import type { Profile } from "@/types/domain/profile";
import { ThemePicker } from "@/components/theme/theme-picker";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TITLES: Array<[string, string]> = [
  ["/dashboard", "Dashboard"],
  ["/practice", "Coding Challenges"],
  ["/interviews/new", "New Interview"],
  ["/interviews/history", "Interview History"],
  ["/settings", "Settings"],
  ["/interviews", "Interview"],
];

function titleFor(pathname: string): string {
  for (const [prefix, title] of TITLES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return title;
  }
  return "InterviewForge";
}

function initialsFromName(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CandidateTopbar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const title = titleFor(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-lg backdrop-blur-md">
      <div className="flex items-center lg:hidden">
        <BrandLogo variant="mark" href="/dashboard" />
      </div>
      <div className="hidden items-center lg:flex">
        <h2 className="font-headline-md text-headline-md font-bold text-foreground">{title}</h2>
      </div>
      <div className="flex items-center gap-md">
        <ThemePicker variant="topbar" />
        <Avatar className="size-9">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? "Profile"} />
          ) : null}
          <AvatarFallback className="font-label-md text-label-md font-semibold">
            {initialsFromName(profile.full_name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
