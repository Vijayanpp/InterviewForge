"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useWizardStore } from "@/lib/store/wizard-store";
import {
  wizardStep1Schema,
  wizardStep2Schema,
  wizardStep4Schema,
  wizardStep5Schema,
  wizardStep6Schema,
  type CreateInterviewSessionInput,
} from "@/types/domain/interview";
import type { Technology } from "@/types/domain/technology";
import { WizardShell } from "@/components/wizard/wizard-shell";
import { StepInterviewType } from "@/components/wizard/steps/step-interview-type";
import { StepTechnologies } from "@/components/wizard/steps/step-technologies";
import { StepTopics } from "@/components/wizard/steps/step-topics";
import { StepExperience } from "@/components/wizard/steps/step-experience";
import { StepDifficulty } from "@/components/wizard/steps/step-difficulty";
import { StepDuration } from "@/components/wizard/steps/step-duration";
import { StepPersonalization } from "@/components/wizard/steps/step-personalization";
import { StepReview } from "@/components/wizard/steps/step-review";

const STEPS = [
  { title: "Select Interview Type", subtitle: "Define the core focus of your interview session." },
  { title: "Choose Your Technologies", subtitle: "Pick one or more technologies to be tested on." },
  { title: "Narrow the Topics", subtitle: "Optionally focus on specific topics." },
  { title: "Your Experience Level", subtitle: "Calibrate question depth to your seniority." },
  { title: "Choose a Difficulty", subtitle: "How challenging should the questions be?" },
  { title: "Set the Duration", subtitle: "How long should the interview run?" },
  { title: "Personalize", subtitle: "Add resume, job description, or extra context." },
  { title: "Review & Confirm", subtitle: "Double-check your setup before we begin." },
] as const;

export function InterviewWizard({ technologies }: { technologies: Technology[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const state = useWizardStore((s) => s);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const stepConfig = STEPS[step]!;

  function personalizationReady(): boolean {
    if (state.interviewType === "resume_based") {
      return Boolean(state.resumeId) && state.resumeText.trim().length >= 40;
    }
    if (state.interviewType === "job_description_based") {
      return state.jobDescriptionContent.trim().length >= 40;
    }
    return true;
  }

  function canContinueFromStep(): boolean {
    switch (step) {
      case 0:
        return wizardStep1Schema.safeParse({ interviewType: state.interviewType }).success;
      case 1:
        return wizardStep2Schema.safeParse({ technologyIds: state.technologyIds }).success;
      case 2:
        return true;
      case 3:
        return wizardStep4Schema.safeParse({ experienceLevel: state.experienceLevel }).success;
      case 4:
        return wizardStep5Schema.safeParse({ difficulty: state.difficulty }).success;
      case 5:
        return wizardStep6Schema.safeParse({ durationMinutes: state.durationMinutes }).success;
      case 6:
        return personalizationReady();
      default:
        return true;
    }
  }

  async function ensureDocuments(): Promise<{
    resumeId?: string;
    jobDescriptionId?: string;
  }> {
    let resumeId = state.resumeId ?? undefined;
    let jobDescriptionId = state.jobDescriptionId ?? undefined;

    if (state.interviewType === "resume_based") {
      if (!resumeId) {
        throw new Error("Upload or save your resume before starting.");
      }
    }

    if (state.interviewType === "job_description_based") {
      if (!jobDescriptionId) {
        const res = await fetch("/api/job-descriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: state.jobDescriptionContent.trim(),
            title: state.jobDescriptionTitle.trim() || undefined,
            company: state.targetCompany.trim() || undefined,
          }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(body?.error?.message ?? "Could not save the job description.");
        }
        jobDescriptionId = (body.jobDescription as { id: string }).id;
        useWizardStore.getState().setField("jobDescriptionId", jobDescriptionId!);
      }
    }

    return { resumeId, jobDescriptionId };
  }

  async function handleContinue() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      const docs = await ensureDocuments();
      const mode =
        state.interviewType === "coding"
          ? "coding"
          : state.mode === "voice"
            ? "voice"
            : "text";

      const payload: CreateInterviewSessionInput = {
        interviewType: state.interviewType!,
        technologyIds: state.technologyIds,
        topicIds: state.topicIds,
        experienceLevel: state.experienceLevel!,
        difficulty: state.difficulty!,
        durationMinutes: state.durationMinutes!,
        targetCompany: state.targetCompany || undefined,
        customInstructions: state.customInstructions || undefined,
        resumeId: docs.resumeId,
        jobDescriptionId: docs.jobDescriptionId,
        mode,
      };

      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not create the interview session.");
      }

      const { session } = (await res.json()) as { session: { id: string } };
      useWizardStore.getState().reset();
      if (mode === "voice") {
        router.push(`/interviews/${session.id}/voice`);
      } else if (mode === "coding") {
        router.push(`/interviews/${session.id}/coding`);
      } else {
        router.push(`/interviews/${session.id}/room`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  if (!hydrated) {
    return null;
  }

  return (
    <WizardShell
      stepIndex={step}
      totalSteps={STEPS.length}
      title={stepConfig.title}
      subtitle={stepConfig.subtitle}
      canContinue={canContinueFromStep()}
      isSubmitting={isSubmitting}
      isLastStep={step === STEPS.length - 1}
      onBack={handleBack}
      onContinue={handleContinue}
    >
      {step === 0 && <StepInterviewType />}
      {step === 1 && <StepTechnologies technologies={technologies} />}
      {step === 2 && <StepTopics />}
      {step === 3 && <StepExperience />}
      {step === 4 && <StepDifficulty />}
      {step === 5 && <StepDuration />}
      {step === 6 && <StepPersonalization />}
      {step === 7 && <StepReview technologies={technologies} />}
    </WizardShell>
  );
}
