"use client";

import { Brain, Code2, Layers, Users, Network, FileText, Briefcase, Keyboard, Mic } from "lucide-react";
import type { InterviewType } from "@/types/domain/enums";
import { useWizardStore } from "@/lib/store/wizard-store";
import { SelectionCard } from "@/components/wizard/selection-card";
import { cn } from "@/lib/utils";

const TYPES: Array<{
  value: InterviewType;
  icon: typeof Brain;
  title: string;
  description: string;
  wide?: boolean;
}> = [
  {
    value: "technical",
    icon: Brain,
    title: "Technical",
    description: "Deep dive into domain-specific knowledge, logic, and core concepts.",
  },
  {
    value: "coding",
    icon: Code2,
    title: "Coding",
    description: "Algorithms, data structures, and live coding problem-solving exercises.",
  },
  {
    value: "mixed",
    icon: Layers,
    title: "Mixed",
    description: "A balanced combination of technical theory and practical coding tasks.",
  },
  {
    value: "behavioural",
    icon: Users,
    title: "Behavioural",
    description: "Situational questions focusing on soft skills, teamwork, and culture fit.",
  },
  {
    value: "system_design",
    icon: Network,
    title: "System Design",
    description: "High-level architectural challenges and scalability discussions.",
  },
  {
    value: "resume_based",
    icon: FileText,
    title: "Resume-Based",
    description: "Interview tailored specifically to your past experiences and projects.",
  },
  {
    value: "job_description_based",
    icon: Briefcase,
    title: "Job Description Match",
    description: "Paste a job posting and let the AI target questions at that role.",
    wide: true,
  },
];

export function StepInterviewType() {
  const interviewType = useWizardStore((s) => s.interviewType);
  const mode = useWizardStore((s) => s.mode);
  const setField = useWizardStore((s) => s.setField);

  const voiceAllowed = interviewType != null && interviewType !== "coding";

  return (
    <div className="space-y-lg">
      <div className="grid grid-cols-1 gap-md md:grid-cols-2 lg:grid-cols-3">
        {TYPES.map((type) =>
          type.wide ? (
            <div key={type.value} className="lg:col-span-3">
              <SelectionCard
                icon={type.icon}
                title={type.title}
                description={type.description}
                isSelected={interviewType === type.value}
                onSelect={() => {
                  setField("interviewType", type.value);
                  if (type.value === "coding") setField("mode", "coding");
                  else if (mode === "coding") setField("mode", "text");
                  if (type.value !== "resume_based") {
                    setField("resumeId", null);
                    setField("resumeFileName", null);
                    setField("resumeText", "");
                  }
                  if (type.value !== "job_description_based") {
                    setField("jobDescriptionId", null);
                    setField("jobDescriptionTitle", "");
                    setField("jobDescriptionContent", "");
                  }
                }}
                wide
              />
            </div>
          ) : (
            <SelectionCard
              key={type.value}
              icon={type.icon}
              title={type.title}
              description={type.description}
              isSelected={interviewType === type.value}
              onSelect={() => {
                setField("interviewType", type.value);
                if (type.value === "coding") setField("mode", "coding");
                else if (mode === "coding") setField("mode", "text");
                if (type.value !== "resume_based") {
                  setField("resumeId", null);
                  setField("resumeFileName", null);
                  setField("resumeText", "");
                }
                if (type.value !== "job_description_based") {
                  setField("jobDescriptionId", null);
                  setField("jobDescriptionTitle", "");
                  setField("jobDescriptionContent", "");
                }
              }}
            />
          )
        )}
      </div>

      {voiceAllowed && (
        <div className="mx-auto max-w-xl space-y-sm">
          <p className="text-center font-label-md text-label-md text-muted-foreground">
            How do you want to answer?
          </p>
          <div className="grid grid-cols-2 gap-md">
            <button
              type="button"
              onClick={() => setField("mode", "text")}
              className={cn(
                "flex flex-col items-center gap-sm rounded-xl border p-md transition-all",
                mode === "text"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <Keyboard className="size-6 text-primary" />
              <span className="font-label-md text-label-md font-semibold">Text</span>
              <span className="text-center text-body-sm text-muted-foreground">
                Type your answers in the interview room
              </span>
            </button>
            <button
              type="button"
              onClick={() => setField("mode", "voice")}
              className={cn(
                "flex flex-col items-center gap-sm rounded-xl border p-md transition-all",
                mode === "voice"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <Mic className="size-6 text-primary" />
              <span className="font-label-md text-label-md font-semibold">Voice</span>
              <span className="text-center text-body-sm text-muted-foreground">
                Speak answers with live transcript review
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
