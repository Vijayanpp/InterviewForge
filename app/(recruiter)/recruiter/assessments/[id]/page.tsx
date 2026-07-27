import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
  getAssessmentById,
  getMembershipForUser,
  listAssessmentCandidates,
} from "@/lib/repositories/assessments.repo";
import { getServerEnv } from "@/lib/env";
import { AssessmentInvitePanel } from "@/components/recruiter/assessment-invite-panel";
import { IntegrityPanel } from "@/components/recruiter/integrity-panel";
import { Button } from "@/components/ui/button";

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAuthContext();
  if (!ctx) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const membership = await getMembershipForUser(supabase, ctx.userId);
  if (!membership) redirect("/become-recruiter");

  const assessment = await getAssessmentById(supabase, id);
  if (!assessment || assessment.organization_id !== membership.organization.id) {
    notFound();
  }

  const candidates = await listAssessmentCandidates(supabase, id);
  const env = getServerEnv();

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">{assessment.title}</h1>
        <p className="text-muted-foreground">
          {assessment.job_role ? `${assessment.job_role} · ` : ""}
          {assessment.duration_minutes} min · {assessment.interview_mode} ·{" "}
          {assessment.status === "approved" ? "published" : assessment.status}
        </p>
      </div>

      <AssessmentInvitePanel
        assessmentId={assessment.id}
        status={assessment.status}
        appUrl={env.APP_URL}
      />

      <div className="space-y-md">
        <h2 className="font-headline-md text-headline-md">Candidates</h2>
        {candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invites yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-md py-sm">Email</th>
                  <th className="px-md py-sm">Status</th>
                  <th className="px-md py-sm">Integrity</th>
                  <th className="px-md py-sm">Invite link</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} className="border-b border-border align-top last:border-0">
                    <td className="px-md py-sm">{c.candidate_email}</td>
                    <td className="px-md py-sm capitalize">{c.status}</td>
                    <td className="px-md py-sm">
                      {c.integrity_flagged ? (
                        <span className="text-destructive">Flagged</span>
                      ) : c.integrity_score != null ? (
                        Math.round(c.integrity_score)
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-md py-sm">
                      <code className="break-all text-xs text-muted-foreground">
                        {env.APP_URL}/invite/{c.invite_token}
                      </code>
                      <div className="mt-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          nativeButton={false}
                          render={
                            <a href={`${env.APP_URL}/invite/${c.invite_token}`} target="_blank" rel="noreferrer">
                              Open
                            </a>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="space-y-md">
        {candidates
          .filter((c) => c.session_id)
          .map((c) => (
            <div key={c.id} className="space-y-sm">
              <p className="text-sm font-medium">{c.candidate_email}</p>
              <IntegrityPanel
                sessionId={c.session_id!}
                integrityScore={c.integrity_score}
                integrityFlagged={c.integrity_flagged}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
