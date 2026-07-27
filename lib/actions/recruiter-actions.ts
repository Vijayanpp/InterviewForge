"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { getServerEnv } from "@/lib/env";
import {
  bootstrapRecruiterSchema,
  createAssessmentSchema,
  inviteCandidatesSchema,
} from "@/types/domain/assessment";
import {
  createAssessment,
  createOrganizationWithOwner,
  getAssessmentById,
  getMembershipForUser,
  inviteCandidates,
  listAssessments,
  promoteToInterviewer,
  publishAssessment,
} from "@/lib/repositories/assessments.repo";
import { sendAssessmentInviteEmail } from "@/lib/email/resend";

export type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function bootstrapRecruiterAction(
  raw: unknown
): Promise<ActionResult<{ organizationId: string }>> {
  const parsed = bootstrapRecruiterSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await requireRole();
  const admin = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();

  const existing = await getMembershipForUser(supabase, ctx.userId);
  if (existing) {
    if (ctx.role !== "interviewer" && ctx.role !== "admin") {
      await promoteToInterviewer(admin, ctx.userId);
    }
    redirect("/recruiter/assessments");
  }

  await promoteToInterviewer(admin, ctx.userId);
  const org = await createOrganizationWithOwner(admin, ctx.userId, parsed.data.organizationName);
  revalidatePath("/recruiter");
  redirect("/recruiter/assessments");
}

export async function createAssessmentAction(raw: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createAssessmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ctx = await requireRole("interviewer", "admin");
  const supabase = await createSupabaseServerClient();
  const membership = await getMembershipForUser(supabase, ctx.userId);
  if (!membership) return { success: false, error: "Create an organization first." };

  const assessment = await createAssessment(
    supabase,
    membership.organization.id,
    ctx.userId,
    parsed.data
  );
  revalidatePath("/recruiter/assessments");
  return { success: true, data: { id: assessment.id } };
}

export async function publishAssessmentAction(assessmentId: string): Promise<ActionResult> {
  const ctx = await requireRole("interviewer", "admin");
  const supabase = await createSupabaseServerClient();
  const membership = await getMembershipForUser(supabase, ctx.userId);
  if (!membership) return { success: false, error: "No organization." };

  const assessment = await getAssessmentById(supabase, assessmentId);
  if (!assessment || assessment.organization_id !== membership.organization.id) {
    return { success: false, error: "Assessment not found." };
  }

  await publishAssessment(supabase, assessmentId);
  revalidatePath(`/recruiter/assessments/${assessmentId}`);
  return { success: true };
}

export async function inviteCandidatesAction(
  assessmentId: string,
  raw: unknown
): Promise<ActionResult<{ invited: number; emailed: number }>> {
  const parsed = inviteCandidatesSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid emails" };
  }

  const ctx = await requireRole("interviewer", "admin");
  const supabase = await createSupabaseServerClient();
  const membership = await getMembershipForUser(supabase, ctx.userId);
  if (!membership) return { success: false, error: "No organization." };

  const assessment = await getAssessmentById(supabase, assessmentId);
  if (!assessment || assessment.organization_id !== membership.organization.id) {
    return { success: false, error: "Assessment not found." };
  }
  if (assessment.status !== "approved") {
    return { success: false, error: "Publish the assessment before inviting candidates." };
  }

  const unique = [...new Set(parsed.data.emails.map((e) => e.toLowerCase()))];
  const rows = await inviteCandidates(supabase, assessmentId, unique, parsed.data.expiresInDays);

  const env = getServerEnv();
  let emailed = 0;
  for (const row of rows) {
    const inviteUrl = `${env.APP_URL}/invite/${row.invite_token}`;
    try {
      const result = await sendAssessmentInviteEmail({
        to: row.candidate_email,
        organizationName: membership.organization.name,
        assessmentTitle: assessment.title,
        jobRole: assessment.job_role,
        durationMinutes: assessment.duration_minutes,
        expiresAt: row.expires_at,
        inviteUrl,
      });
      if (result.sent) emailed += 1;
    } catch {
      // Row still created; recruiter can copy link from UI.
    }
  }

  revalidatePath(`/recruiter/assessments/${assessmentId}`);
  return { success: true, data: { invited: rows.length, emailed } };
}

export async function listMyAssessmentsAction() {
  const ctx = await requireRole("interviewer", "admin");
  const supabase = await createSupabaseServerClient();
  const membership = await getMembershipForUser(supabase, ctx.userId);
  if (!membership) return { organization: null, assessments: [] };
  const assessments = await listAssessments(supabase, membership.organization.id);
  return { organization: membership.organization, assessments };
}
