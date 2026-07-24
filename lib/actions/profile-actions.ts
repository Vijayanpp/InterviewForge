"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { requireRole } from "@/lib/auth/require-role";
import { updateProfile } from "@/lib/repositories/profiles.repo";
import { onboardingSchema, type OnboardingFormValues } from "@/types/domain/profile";

export interface ProfileActionResult {
  success: boolean;
  error?: string;
}

export async function updateProfileAction(
  input: OnboardingFormValues
): Promise<ProfileActionResult> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await requireRole();
  const supabase = await createSupabaseServerClient();

  await updateProfile(supabase, ctx.userId, {
    full_name: parsed.data.fullName,
    years_experience: parsed.data.yearsExperience ?? null,
    current_job_role: parsed.data.currentJobRole || null,
    target_job_role: parsed.data.targetJobRole || null,
    main_skills: parsed.data.mainSkills,
    preferred_technologies: parsed.data.preferredTechnologies,
    interview_goal: parsed.data.interviewGoal || null,
    preferred_language: parsed.data.preferredLanguage,
  });

  return { success: true };
}
