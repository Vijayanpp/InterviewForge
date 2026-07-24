"use client";

import { Clock } from "lucide-react";
import { DURATION_PRESETS_MINUTES } from "@/types/domain/interview";
import { useWizardStore } from "@/lib/store/wizard-store";
import { cn } from "@/lib/utils";

export function StepDuration() {
  const durationMinutes = useWizardStore((s) => s.durationMinutes);
  const setField = useWizardStore((s) => s.setField);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="grid grid-cols-2 gap-md sm:grid-cols-5">
        {DURATION_PRESETS_MINUTES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => setField("durationMinutes", minutes)}
            className={cn(
              "flex flex-col items-center gap-sm rounded-xl border border-border bg-card p-lg transition-all hover:shadow-md",
              durationMinutes === minutes && "border-primary bg-primary/5 ring-1 ring-primary/20"
            )}
          >
            <Clock className="h-6 w-6 text-primary" />
            <span className="font-headline-md text-headline-md text-foreground">{minutes}</span>
            <span className="text-xs text-muted-foreground">minutes</span>
          </button>
        ))}
      </div>
    </div>
  );
}
