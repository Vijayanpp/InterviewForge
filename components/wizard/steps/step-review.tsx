"use client";

import { useWizardStore } from "@/lib/store/wizard-store";
import {
  DIFFICULTY_LEVEL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  INTERVIEW_MODE_LABELS,
  INTERVIEW_TYPE_LABELS,
} from "@/types/domain/enums";
import type { Technology } from "@/types/domain/technology";
import { Card } from "@/components/ui/card";

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-md last:border-0">
      <span className="text-body-sm text-muted-foreground">{label}</span>
      <span className="font-label-md text-label-md font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function StepReview({ technologies }: { technologies: Technology[] }) {
  const state = useWizardStore((s) => s);
  const techNames = state.technologyIds
    .map((id) => technologies.find((t) => t.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const modeLabel =
    state.interviewType === "coding"
      ? INTERVIEW_MODE_LABELS.coding
      : INTERVIEW_MODE_LABELS[state.mode === "coding" ? "text" : state.mode];

  return (
    <Card className="mx-auto max-w-2xl p-lg">
      <ReviewRow
        label="Interview type"
        value={state.interviewType ? INTERVIEW_TYPE_LABELS[state.interviewType] : "—"}
      />
      <ReviewRow label="Delivery mode" value={modeLabel} />
      <ReviewRow label="Technologies" value={techNames || "—"} />
      <ReviewRow label="Topics" value={state.topicIds.length > 0 ? `${state.topicIds.length} selected` : "All topics"} />
      <ReviewRow
        label="Experience level"
        value={state.experienceLevel ? EXPERIENCE_LEVEL_LABELS[state.experienceLevel] : "—"}
      />
      <ReviewRow
        label="Difficulty"
        value={state.difficulty ? DIFFICULTY_LEVEL_LABELS[state.difficulty] : "—"}
      />
      <ReviewRow label="Duration" value={state.durationMinutes ? `${state.durationMinutes} minutes` : "—"} />
      {state.interviewType === "resume_based" && (
        <ReviewRow
          label="Resume"
          value={state.resumeFileName || (state.resumeId ? "Saved" : "Missing")}
        />
      )}
      {state.interviewType === "job_description_based" && (
        <ReviewRow
          label="Job description"
          value={
            state.jobDescriptionContent.trim().length > 0
              ? `${state.jobDescriptionContent.trim().length} characters`
              : "Missing"
          }
        />
      )}
      <ReviewRow label="Target company" value={state.targetCompany || "Not specified"} />
    </Card>
  );
}
