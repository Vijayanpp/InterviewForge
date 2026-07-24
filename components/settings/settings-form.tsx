"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Dumbbell, Briefcase, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { onboardingSchema, type OnboardingFormValues, type Profile } from "@/types/domain/profile";
import { updateProfileAction } from "@/lib/actions/profile-actions";
import { SkillsInput } from "@/components/onboarding/skills-input";
import { AvatarUpload } from "@/components/settings/avatar-upload";
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

function nearestExperiencePreset(years: number | null): number | undefined {
  if (years == null || Number.isNaN(Number(years))) return undefined;
  const value = Number(years);
  let best = EXPERIENCE_PRESETS[0]!.value;
  let bestDist = Math.abs(best - value);
  for (const preset of EXPERIENCE_PRESETS) {
    const dist = Math.abs(preset.value - value);
    if (dist < bestDist) {
      best = preset.value;
      bestDist = dist;
    }
  }
  return best;
}

export function SettingsForm({
  profile,
  email,
  technologies,
}: {
  profile: Profile;
  email: string;
  technologies: Technology[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: profile.full_name ?? "",
      yearsExperience: nearestExperiencePreset(
        profile.years_experience == null ? null : Number(profile.years_experience)
      ),
      currentJobRole: profile.current_job_role ?? "",
      targetJobRole: profile.target_job_role ?? "",
      mainSkills: profile.main_skills ?? [],
      preferredTechnologies: profile.preferred_technologies ?? [],
      interviewGoal: profile.interview_goal ?? "",
      preferredLanguage: profile.preferred_language ?? "en",
    },
  });

  async function onSubmit(values: OnboardingFormValues) {
    setIsSubmitting(true);
    const result = await updateProfileAction(values);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Could not save your settings.");
      return;
    }

    toast.success("Settings saved.");
    router.refresh();
  }

  const selectedTechnologies = form.watch("preferredTechnologies");
  const selectedGoal = form.watch("interviewGoal");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
        <Card className="space-y-md p-lg">
          <div>
            <h2 className="font-headline-md text-headline-md">Account</h2>
            <p className="mt-xs text-body-sm text-muted-foreground">
              Basic identity details for your InterviewForge profile.
            </p>
          </div>

          <AvatarUpload fullName={profile.full_name} avatarUrl={profile.avatar_url} />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-xs">
            <FormLabel>Email</FormLabel>
            <Input value={email} disabled readOnly />
            <FormDescription>Email comes from your sign-in account and can&apos;t be changed here.</FormDescription>
          </div>
        </Card>

        <Card className="space-y-md p-lg">
          <div>
            <h2 className="font-headline-md text-headline-md">Career profile</h2>
            <p className="mt-xs text-body-sm text-muted-foreground">
              Used to calibrate interview difficulty and question focus.
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

          <FormField
            control={form.control}
            name="yearsExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of professional experience</FormLabel>
                <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
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

          <FormField
            control={form.control}
            name="interviewGoal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main goal</FormLabel>
                <div className="grid gap-md sm:grid-cols-2">
                  {GOALS.map((goal) => (
                    <button
                      key={goal.title}
                      type="button"
                      onClick={() => field.onChange(goal.value)}
                      className={cn(
                        "relative rounded-xl border-2 p-lg text-left transition-all hover:shadow-md",
                        selectedGoal === goal.value
                          ? "border-primary bg-card"
                          : "border-transparent bg-muted/50"
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
        </Card>

        <Card className="space-y-md p-lg">
          <div>
            <h2 className="font-headline-md text-headline-md">Skills &amp; stack</h2>
            <p className="mt-xs text-body-sm text-muted-foreground">
              Prefer technologies and skills you want interview practice around.
            </p>
          </div>

          <FormField
            control={form.control}
            name="preferredTechnologies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred technologies</FormLabel>
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
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
