"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WizardShellProps {
  stepIndex: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  canContinue: boolean;
  isSubmitting?: boolean;
  isLastStep?: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function WizardShell({
  stepIndex,
  totalSteps,
  title,
  subtitle,
  children,
  canContinue,
  isSubmitting = false,
  isLastStep = false,
  onBack,
  onContinue,
}: WizardShellProps) {
  const percent = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-lg">
      <div className="rounded-xl border border-border bg-card p-lg shadow-sm">
        <div className="mb-md flex flex-col items-center justify-between gap-md md:flex-row">
          <div>
            <h2 className="font-headline-md text-headline-md text-foreground">
              Interview Configuration
            </h2>
            <p className="font-body-sm text-body-sm text-muted-foreground">
              Step {stepIndex + 1} of {totalSteps}: {subtitle}
            </p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 font-label-md text-label-md text-secondary-foreground">
            {Math.round(percent)}% Complete
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-sm flex justify-between px-1">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                idx <= stepIndex ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <div className="space-y-lg">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="font-headline-lg text-headline-lg text-foreground">{title}</h3>
        </div>
        {children}
      </div>

      <div className="mt-xl flex flex-wrap items-center justify-between gap-md border-t border-border pt-lg">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className={cn(stepIndex === 0 && "invisible")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onContinue}
          disabled={!canContinue || isSubmitting}
          className="min-w-0 sm:min-w-40"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isLastStep ? "Start Interview" : "Continue"}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
