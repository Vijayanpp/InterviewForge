import { z } from "zod";
import type { Tables } from "@/types/domain/db-helpers";

export type Profile = Tables<"profiles">;
export type Role = Tables<"roles">;

/** Onboarding form: every field optional except full name — spec requires
 *  candidates to be able to skip optional fields and complete them later. */
export const onboardingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  yearsExperience: z.coerce.number().min(0).max(60).optional(),
  currentJobRole: z.string().trim().max(120).optional(),
  targetJobRole: z.string().trim().max(120).optional(),
  mainSkills: z.array(z.string().trim().min(1)).max(20).default([]),
  preferredTechnologies: z.array(z.string().uuid()).max(20).default([]),
  interviewGoal: z.string().trim().max(500).optional(),
  preferredLanguage: z.string().trim().min(2).max(10).default("en"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
/** Pre-default shape used by the form itself (fields with `.default()` are optional on input). */
export type OnboardingFormValues = z.input<typeof onboardingSchema>;

export const updateProfileSchema = onboardingSchema.partial().extend({
  onboardingCompleted: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
