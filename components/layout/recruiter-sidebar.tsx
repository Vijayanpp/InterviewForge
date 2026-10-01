"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutDashboard, LogOut, PlusCircle, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth/actions";
import { BrandLogo } from "@/components/brand/brand-logo";

const NAV_ITEMS = [
  { href: "/recruiter/assessments", label: "Assessments", icon: ClipboardList },
  { href: "/recruiter/assessments/new", label: "New assessment", icon: PlusCircle },
];

export function RecruiterSidebar({ orgName }: { orgName?: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-[280px] flex-col bg-sidebar-gradient lg:flex">
      <div className="p-lg">
        <BrandLogo variant="compact" href="/recruiter/assessments" onDark />
        <p className="mt-sm px-xs text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/60">
          Recruiter
        </p>
        {orgName ? (
          <p className="mt-md flex items-center gap-sm truncate px-xs text-sm text-sidebar-foreground/80">
            <Building2 className="h-4 w-4 shrink-0" />
            {orgName}
          </p>
        ) : null}
      </div>

      <nav className="custom-scrollbar mt-md flex-1 overflow-y-auto px-md" aria-label="Recruiter">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/recruiter/assessments/new" &&
              pathname.startsWith(`${item.href}/`) &&
              !pathname.includes("/new"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-md border-b border-sidebar-border px-4 py-3 font-body-md text-body-md transition-all duration-200",
                isActive
                  ? "border-l-4 border-l-sidebar-primary bg-sidebar-accent font-bold text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-md">
        <Link
          href="/dashboard"
          className="flex items-center gap-md rounded-lg px-4 py-3 text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="font-body-md">Candidate app</span>
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-md rounded-lg px-4 py-3 text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-body-md">Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
