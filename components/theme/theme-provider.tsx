"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { APP_THEME_IDS } from "@/lib/themes";

/**
 * Multi-theme provider. Themes map to a single CSS class on <html>
 * (see app/globals.css `.theme-*`). Do not put spaces in class values —
 * next-themes passes them to classList which rejects whitespace.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="forge"
      enableSystem={false}
      themes={[...APP_THEME_IDS]}
      value={{
        forge: "theme-forge",
        indigo: "theme-indigo",
        black: "theme-black",
        white: "theme-white",
        forest: "theme-forest",
        ocean: "theme-ocean",
        rose: "theme-rose",
      }}
      storageKey="interviewforge-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
