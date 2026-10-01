"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlayCircle,
  History,
  LogOut,
  ShieldCheck,
  Code2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/auth/actions";
import { BrandLogo } from "@/components/brand/brand-logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/interviews/new", label: "Start Interview", icon: PlayCircle },
  { href: "/practice", label: "Coding Challenges", icon: Code2 },
  { href: "/interviews/history", label: "Interview History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/become-recruiter", label: "Recruiter", icon: ShieldCheck },
];

export function CandidateSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-[280px] flex-col bg-sidebar-gradient lg:flex">
      <div className="p-lg">
        <BrandLogo variant="compact" href="/dashboard" onDark />
      </div>

      <nav className="custom-scrollbar mt-md flex-1 overflow-y-auto px-md" aria-label="Candidate">
        <div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
        </div>
      </nav>

      {isAdmin && (
        <div className="border-t border-sidebar-border p-md">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-md rounded-lg px-4 py-3 text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="font-body-md">Admin console</span>
          </Link>
        </div>
      )}

      <div className="border-t border-sidebar-border p-md">
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
