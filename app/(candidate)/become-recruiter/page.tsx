import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getMembershipForUser } from "@/lib/repositories/assessments.repo";
import { RecruiterOnboardingForm } from "@/components/recruiter/onboarding-form";

/** Accessible to candidates — promote to interviewer + create org. */
export default async function BecomeRecruiterPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login?next=/become-recruiter");

  const supabase = await createSupabaseServerClient();
  const membership = await getMembershipForUser(supabase, ctx.userId);
  if (membership && (ctx.role === "interviewer" || ctx.role === "admin")) {
    redirect("/recruiter/assessments");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-lg py-2xl">
      <RecruiterOnboardingForm />
    </div>
  );
}
