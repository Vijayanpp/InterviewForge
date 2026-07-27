import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getMembershipForUser, listAssessments } from "@/lib/repositories/assessments.repo";
import { Button } from "@/components/ui/button";

export default async function RecruiterAssessmentsPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const membership = await getMembershipForUser(supabase, ctx.userId);
  if (!membership) redirect("/become-recruiter");

  const assessments = await listAssessments(supabase, membership.organization.id);

  return (
    <div className="space-y-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-foreground">Assessments</h1>
          <p className="text-muted-foreground">
            Create proctored AI interviews and send invite links to candidates.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/recruiter/assessments/new">New assessment</Link>} />
      </div>

      {assessments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-xl text-center text-muted-foreground">
          No assessments yet. Create one to invite candidates.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-md py-sm font-medium">Title</th>
                <th className="px-md py-sm font-medium">Mode</th>
                <th className="px-md py-sm font-medium">Duration</th>
                <th className="px-md py-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-md py-sm">
                    <Link href={`/recruiter/assessments/${a.id}`} className="font-medium text-primary hover:underline">
                      {a.title}
                    </Link>
                    {a.job_role ? (
                      <p className="text-xs text-muted-foreground">{a.job_role}</p>
                    ) : null}
                  </td>
                  <td className="px-md py-sm capitalize">{a.interview_mode}</td>
                  <td className="px-md py-sm">{a.duration_minutes} min</td>
                  <td className="px-md py-sm">
                    <span className="rounded-full bg-muted px-sm py-0.5 text-xs capitalize">
                      {a.status === "approved" ? "published" : a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
