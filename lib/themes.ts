export const APP_THEMES = [
  {
    id: "forge",
    label: "Forge",
    description: "Brand navy & forge orange",
    swatch: "#ea580c",
    sonner: "light" as const,
  },
  {
    id: "indigo",
    label: "Indigo",
    description: "Classic InterviewForge look",
    swatch: "#4f46e5",
    sonner: "light" as const,
  },
  {
    id: "black",
    label: "Black",
    description: "High-contrast dark sidebar",
    swatch: "#0a0a0a",
    sonner: "light" as const,
  },
  {
    id: "white",
    label: "White",
    description: "Clean light neutrals",
    swatch: "#f5f5f5",
    sonner: "light" as const,
  },
  {
    id: "forest",
    label: "Forest",
    description: "Deep greens",
    swatch: "#166534",
    sonner: "light" as const,
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Cool teal & blue",
    swatch: "#0e7490",
    sonner: "light" as const,
  },
  {
    id: "rose",
    label: "Rose",
    description: "Warm rose accents",
    swatch: "#e11d48",
    sonner: "light" as const,
  },
] as const;

export type AppThemeId = (typeof APP_THEMES)[number]["id"];

export const APP_THEME_IDS = APP_THEMES.map((t) => t.id);

export function isAppThemeId(value: string | undefined): value is AppThemeId {
  return !!value && (APP_THEME_IDS as readonly string[]).includes(value);
}
