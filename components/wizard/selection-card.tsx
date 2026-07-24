"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
  wide?: boolean;
}

export function SelectionCard({
  icon: Icon,
  title,
  description,
  isSelected,
  onSelect,
  wide = false,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group cursor-pointer rounded-xl border border-border border-b-4 bg-card p-lg text-left transition-all duration-200 hover:shadow-lg",
        isSelected ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" : "hover:border-primary/60",
        wide && "flex items-center gap-lg"
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted transition-transform duration-300 group-hover:scale-110",
          !wide && "mb-md"
        )}
      >
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div>
        <h4 className="font-headline-md text-headline-md text-foreground">{title}</h4>
        <p className="font-body-sm text-body-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}
