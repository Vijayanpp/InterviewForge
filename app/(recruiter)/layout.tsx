import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getMembershipForUser } from "@/lib/repositories/assessments.repo";
import { RecruiterSidebar } from "@/components/layout/recruiter-sidebar";
import { RecruiterTopbar } from "@/components/layout/recruiter-topbar";

export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/login?next=/recruiter/assessments");
  }

  if (ctx.role !== "interviewer" && ctx.role !== "admin") {
    redirect("/become-recruiter");
  }

  const supabase = await createSupabaseServerClient();
  const membership = await getMembershipForUser(supabase, ctx.userId);
  if (!membership) {
    redirect("/become-recruiter");
  }

  return (
    <div className="min-h-screen bg-background">
      <RecruiterSidebar orgName={membership?.organization.name} />
      <main className="flex min-h-screen flex-col lg:ml-[280px]">
        <RecruiterTopbar profile={ctx.profile} />
        <div className="mx-auto w-full max-w-[1440px] flex-1 space-y-lg p-lg lg:p-xl">{children}</div>
      </main>
    </div>
  );
}
