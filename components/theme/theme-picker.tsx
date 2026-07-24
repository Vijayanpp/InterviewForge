"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_THEMES, isAppThemeId } from "@/lib/themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemePicker({
  className,
  variant = "topbar",
}: {
  className?: string;
  /** `topbar` = compact icon button; `sidebar` = full-width row */
  variant?: "topbar" | "sidebar";
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted && isAppThemeId(theme) ? theme : "forge";
  const swatch = APP_THEMES.find((t) => t.id === active)?.swatch;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          variant === "topbar" ? (
            <button
              type="button"
              className={cn(
                "inline-flex h-9 items-center gap-sm rounded-lg border border-border bg-background px-sm text-foreground transition-colors hover:bg-muted",
                className
              )}
              aria-label="Choose theme"
              title="Theme"
            >
              <Palette className="size-4" />
              {mounted && (
                <span
                  className="size-3 rounded-full border border-border"
                  style={{ backgroundColor: swatch }}
                />
              )}
            </button>
          ) : (
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-md rounded-lg px-4 py-3 text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                className
              )}
              aria-label="Choose theme"
            >
              <Palette className="h-5 w-5" />
              <span className="font-body-md">Theme</span>
              {mounted && (
                <span
                  className="ml-auto size-3 rounded-full border border-white/30"
                  style={{ backgroundColor: swatch }}
                />
              )}
            </button>
          )
        }
      />
      <DropdownMenuContent align="end" side="bottom" className="w-56">
        {APP_THEMES.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => setTheme(item.id)}
            className="flex cursor-pointer items-center gap-sm"
          >
            <span
              className="size-3.5 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: item.swatch }}
            />
            <span className="flex-1">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-xs text-muted-foreground">{item.description}</span>
            </span>
            {active === item.id && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
