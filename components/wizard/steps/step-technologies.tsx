"use client";

import { Check } from "lucide-react";
import { useWizardStore } from "@/lib/store/wizard-store";
import type { Technology } from "@/types/domain/technology";
import { cn } from "@/lib/utils";

export function StepTechnologies({ technologies }: { technologies: Technology[] }) {
  const technologyIds = useWizardStore((s) => s.technologyIds);
  const setField = useWizardStore((s) => s.setField);

  function toggle(id: string) {
    setField(
      "technologyIds",
      technologyIds.includes(id)
        ? technologyIds.filter((t) => t !== id)
        : [...technologyIds, id]
    );
    // Selecting different technologies invalidates any previously chosen topics.
    setField("topicIds", []);
  }

  return (
    <div className="space-y-md">
      <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-4">
        {technologies.map((tech) => {
          const isSelected = technologyIds.includes(tech.id);
          return (
            <button
              key={tech.id}
              type="button"
              onClick={() => toggle(tech.id)}
              className={cn(
                "relative rounded-xl border border-border bg-card p-md text-left transition-all hover:shadow-md",
                isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20"
              )}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <p className="font-label-md text-label-md font-semibold text-foreground">{tech.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{tech.category}</p>
            </button>
          );
        })}
      </div>
      <p className="text-center text-body-sm text-muted-foreground">
        {technologyIds.length} technolog{technologyIds.length === 1 ? "y" : "ies"} selected
      </p>
    </div>
  );
}
