"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Loader2, Dumbbell, Briefcase } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { onboardingSchema, type OnboardingFormValues } from "@/types/domain/profile";
import { completeOnboardingAction } from "@/lib/actions/onboarding-actions";
import { SkillsInput } from "@/components/onboarding/skills-input";
import type { Technology } from "@/types/domain/technology";
import { cn } from "@/lib/utils";

const EXPERIENCE_PRESETS = [
  { label: "0-1 yrs", value: 1 },
  { label: "2-4 yrs", value: 3 },
  { label: "5-8 yrs", value: 6 },
  { label: "9+ yrs", value: 10 },
];

const GOALS = [
  {
    value: "General practice — stay sharp with regular mock interviews.",
    title: "General Practice",
    description: "Stay sharp and keep your skills up to date with varied questions.",
  },
  {
    value: "Job interview prep — I have an upcoming interview to prepare for.",
    title: "Job Interview Prep",
    description: "Intensive simulations focused on an upcoming interview.",
  },
];

const STEP_TITLES = [
  "Personal Identity",
  "Current Status",
  "Ambition",
  "Stack Selection",
  "Your Goal",
];

const STEP_FIELDS: Array<Array<keyof OnboardingFormValues>> = [
  ["fullName"],
  ["currentJobRole", "yearsExperience"],
  ["targetJobRole"],
  ["preferredTechnologies"],
  ["mainSkills", "interviewGoal"],
];

export function OnboardingWizard({
  technologies,
  defaultFullName,
}: {
  technologies: Technology[];
  defaultFullName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = STEP_TITLES.length;

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: defaultFullName,
      yearsExperience: undefined,
      currentJobRole: "",
      targetJobRole: "",
      mainSkills: [],
      preferredTechnologies: [],
      interviewGoal: "",
      preferredLanguage: "en",
    },
  });

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const valid = fields ? await form.trigger(fields) : true;
    if (!valid) return;

    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
      return;
    }

    setIsSubmitting(true);
    const result = await completeOnboardingAction(form.getValues());
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Could not save your profile.");
      return;
    }

    toast.success("You're all set!");
    router.push("/dashboard");
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  const selectedTechnologies = form.watch("preferredTechnologies");
  const selectedGoal = form.watch("interviewGoal");

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-xl">
        <div className="mb-sm flex justify-between">
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="font-label-md text-label-md text-muted-foreground">
            {STEP_TITLES[step]}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-xl"
          onSubmit={(e) => {
            e.preventDefault();
            void goNext();
          }}
        >
          {step === 0 && (
            <div className="space-y-lg">
              <div className="text-center">
                <h1 className="font-headline-lg text-headline-lg">Welcome! Let&apos;s get started.</h1>
                <p className="mt-sm font-body-md text-body-md text-muted-foreground">
                  First, how should we address you?
                </p>
              </div>
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Alex Rivera" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-lg">
              <div className="text-center">
                <h1 className="font-headline-lg text-headline-lg">Where are you now?</h1>
                <p className="mt-sm font-body-md text-body-md text-muted-foreground">
                  Tell us about your professional background.
                </p>
              </div>
              <FormField
                control={form.control}
                name="currentJobRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current position</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yearsExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of professional experience</FormLabel>
                    <div className="grid grid-cols-4 gap-sm">
                      {EXPERIENCE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => field.onChange(preset.value)}
                          className={cn(
                            "rounded-lg border p-md text-center font-label-md text-label-md transition-colors",
                            field.value === preset.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input hover:bg-muted"
                          )}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-lg">
              <div className="text-center">
                <h1 className="font-headline-lg text-headline-lg">What&apos;s the next move?</h1>
                <p className="mt-sm font-body-md text-body-md text-muted-foreground">
                  Your target role helps us tailor the AI questions.
                </p>
              </div>
              <FormField
                control={form.control}
                name="targetJobRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target position</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Frontend Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-lg">
              <div className="text-center">
                <h1 className="font-headline-lg text-headline-lg">Refine your stack.</h1>
                <p className="mt-sm font-body-md text-body-md text-muted-foreground">
                  Select the technologies you want to be tested on.
                </p>
              </div>
              <FormField
                control={form.control}
                name="preferredTechnologies"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-wrap gap-sm">
                      {technologies.map((tech) => {
                        const isSelected = field.value?.includes(tech.id);
                        return (
                          <button
                            key={tech.id}
                            type="button"
                            onClick={() => {
                              const current = field.value ?? [];
                              field.onChange(
                                isSelected
                                  ? current.filter((id) => id !== tech.id)
                                  : [...current, tech.id]
                              );
                            }}
                            className={cn(
                              "rounded-full border px-md py-2 text-sm transition-all",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input hover:border-primary"
                            )}
                          >
                            {tech.name}
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                    {(selectedTechnologies?.length ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {selectedTechnologies?.length} selected
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-xl">
              <div className="text-center">
                <h1 className="font-headline-lg text-headline-lg">A couple more things.</h1>
                <p className="mt-sm font-body-md text-body-md text-muted-foreground">
                  Your key skills and main goal help us calibrate difficulty.
                </p>
              </div>
              <FormField
                control={form.control}
                name="mainSkills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key skills</FormLabel>
                    <FormControl>
                      <SkillsInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        placeholder="e.g. REST APIs, testing, system design..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interviewGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What&apos;s the main goal?</FormLabel>
                    <div className="grid gap-md sm:grid-cols-2">
                      {GOALS.map((goal) => (
                        <button
                          key={goal.title}
                          type="button"
                          onClick={() => field.onChange(goal.value)}
                          className={cn(
                            "relative rounded-xl border-2 p-lg text-left transition-all hover:shadow-md",
                            selectedGoal === goal.value ? "border-primary" : "border-transparent bg-muted/50"
                          )}
                        >
                          {selectedGoal === goal.value && (
                            <Check className="absolute right-4 top-4 h-5 w-5 text-primary" />
                          )}
                          <div className="mb-md flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            {goal.title === "General Practice" ? (
                              <Dumbbell className="h-6 w-6 text-primary" />
                            ) : (
                              <Briefcase className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <h3 className="font-headline-md text-headline-md">{goal.title}</h3>
                          <p className="mt-1 text-body-sm text-muted-foreground">{goal.description}</p>
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-xl">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              className={cn(step === 0 && "invisible")}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {step === totalSteps - 1 ? "Complete setup" : "Continue"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
