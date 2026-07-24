"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useWizardStore } from "@/lib/store/wizard-store";
import type { Topic } from "@/types/domain/technology";
import { cn } from "@/lib/utils";

export function StepTopics() {
  const technologyIds = useWizardStore((s) => s.technologyIds);
  const topicIds = useWizardStore((s) => s.topicIds);
  const setField = useWizardStore((s) => s.setField);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/topics?technologyIds=${technologyIds.join(",")}`)
      .then((res) => res.json())
      .then((data: { topics: Topic[] }) => {
        if (!cancelled) setTopics(data.topics ?? []);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [technologyIds]);

  function toggle(id: string) {
    setField(
      "topicIds",
      topicIds.includes(id) ? topicIds.filter((t) => t !== id) : [...topicIds, id]
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-2xl">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-2xl text-center text-body-sm text-muted-foreground">
        No specific topics are catalogued yet for your selected technologies — the AI will cover
        a broad range automatically. You can continue without selecting any.
      </div>
    );
  }

  return (
    <div className="space-y-md">
      <p className="text-center text-body-sm text-muted-foreground">
        Optional — narrow the focus, or leave everything unselected to let the AI cover a broad
        mix.
      </p>
      <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-4">
        {topics.map((topic) => {
          const isSelected = topicIds.includes(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => toggle(topic.id)}
              className={cn(
                "relative rounded-xl border border-border bg-card p-md text-left text-sm transition-all hover:shadow-md",
                isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20"
              )}
            >
              {isSelected && (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <p className="font-label-md text-label-md font-semibold text-foreground">{topic.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
