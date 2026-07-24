import type { Metadata } from "next";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listActiveTechnologies } from "@/lib/repositories/technologies.repo";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Set up your profile",
};

export default async function OnboardingPage() {
  const ctx = await getAuthContext();
  const supabase = await createSupabaseServerClient();
  const technologies = await listActiveTechnologies(supabase);

  return (
    <OnboardingWizard
      technologies={technologies}
      defaultFullName={ctx?.profile.full_name ?? ""}
    />
  );
}
