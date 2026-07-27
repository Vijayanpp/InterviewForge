import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type {
  Assessment,
  AssessmentCandidate,
  CreateAssessmentInput,
  RecruiterOrganization,
  AntiCheatingSettings,
} from "@/types/domain/assessment";
import { DEFAULT_ANTI_CHEATING } from "@/types/domain/assessment";

type Client = SupabaseClient<Database>;

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "org"
  );
}

export async function getMembershipForUser(
  supabase: Client,
  profileId: string
): Promise<{ organization: RecruiterOrganization; memberRole: string } | null> {
  const { data, error } = await supabase
    .from("recruiter_members")
    .select("member_role, recruiter_organizations(*)")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const org = data.recruiter_organizations as unknown as RecruiterOrganization | null;
  if (!org || org.deleted_at) return null;
  return { organization: org, memberRole: data.member_role };
}

export async function createOrganizationWithOwner(
  admin: Client,
  ownerId: string,
  name: string
): Promise<RecruiterOrganization> {
  const base = slugify(name);
  const slug = `${base}-${ownerId.slice(0, 8)}`;

  const { data: org, error } = await admin
    .from("recruiter_organizations")
    .insert({ name, slug, owner_id: ownerId })
    .select("*")
    .single();

  if (error || !org) throw new Error(error?.message ?? "Failed to create organization");

  const { error: memberError } = await admin.from("recruiter_members").insert({
    organization_id: org.id,
    profile_id: ownerId,
    member_role: "owner",
    joined_at: new Date().toISOString(),
  });

  if (memberError) throw new Error(memberError.message);
  return org;
}

export async function promoteToInterviewer(admin: Client, profileId: string): Promise<void> {
  const { data: role, error: roleError } = await admin
    .from("roles")
    .select("id")
    .eq("name", "interviewer")
    .single();

  if (roleError || !role) throw new Error(roleError?.message ?? "Interviewer role missing");

  const { error } = await admin.from("profiles").update({ role_id: role.id }).eq("id", profileId);
  if (error) throw new Error(error.message);
}

export async function listAssessments(
  supabase: Client,
  organizationId: string
): Promise<Assessment[]> {
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAssessmentById(
  supabase: Client,
  assessmentId: string
): Promise<Assessment | null> {
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", assessmentId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function createAssessment(
  supabase: Client,
  organizationId: string,
  createdBy: string,
  input: CreateAssessmentInput
): Promise<Assessment> {
  const settings: AntiCheatingSettings = {
    ...DEFAULT_ANTI_CHEATING,
    ...input.antiCheatingSettings,
  };

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      organization_id: organizationId,
      title: input.title,
      job_role: input.jobRole ?? null,
      technology_ids: input.technologyIds,
      topic_ids: input.topicIds,
      duration_minutes: input.durationMinutes,
      interview_mode: input.interviewMode,
      expires_at: input.expiresAt ?? null,
      candidate_limit: input.candidateLimit ?? null,
      passing_score: input.passingScore ?? null,
      anti_cheating_settings: settings as unknown as Json,
      status: "draft",
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create assessment");
  return data;
}

export async function publishAssessment(
  supabase: Client,
  assessmentId: string
): Promise<Assessment> {
  const { data, error } = await supabase
    .from("assessments")
    .update({ status: "approved" })
    .eq("id", assessmentId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to publish assessment");
  return data;
}

export async function listAssessmentCandidates(
  supabase: Client,
  assessmentId: string
): Promise<AssessmentCandidate[]> {
  const { data, error } = await supabase
    .from("assessment_candidates")
    .select("*")
    .eq("assessment_id", assessmentId)
    .order("invited_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function inviteCandidates(
  supabase: Client,
  assessmentId: string,
  emails: string[],
  expiresInDays: number
): Promise<AssessmentCandidate[]> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  const expiresIso = expiresAt.toISOString();

  const rows = emails.map((email) => ({
    assessment_id: assessmentId,
    candidate_email: email.toLowerCase(),
    status: "invited" as const,
    expires_at: expiresIso,
  }));

  const { data, error } = await supabase
    .from("assessment_candidates")
    .upsert(rows, { onConflict: "assessment_id,candidate_email" })
    .select("*");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getInviteByToken(
  supabase: Client,
  inviteToken: string
): Promise<
  | {
      candidate: AssessmentCandidate;
      assessment: Assessment;
      organizationName: string;
    }
  | null
> {
  const { data, error } = await supabase
    .from("assessment_candidates")
    .select(
      "*, assessments(*, recruiter_organizations(name))"
    )
    .eq("invite_token", inviteToken)
    .maybeSingle();

  if (error || !data) return null;

  const nested = data.assessments as unknown as
    | (Assessment & { recruiter_organizations: { name: string } | null })
    | null;
  if (!nested || nested.deleted_at) return null;

  const candidate = { ...data } as AssessmentCandidate & { assessments?: unknown };
  delete (candidate as { assessments?: unknown }).assessments;

  return {
    candidate,
    assessment: nested,
    organizationName: nested.recruiter_organizations?.name ?? "InterviewForge",
  };
}

export async function markInviteOpened(
  supabase: Client,
  candidateId: string,
  profileId: string
): Promise<void> {
  await supabase
    .from("assessment_candidates")
    .update({
      candidate_id: profileId,
      opened_at: new Date().toISOString(),
    })
    .eq("id", candidateId)
    .is("opened_at", null);
}

export async function linkSessionToInvite(
  supabase: Client,
  inviteRowId: string,
  sessionId: string
): Promise<void> {
  const { error } = await supabase
    .from("assessment_candidates")
    .update({
      session_id: sessionId,
      status: "in_progress",
    })
    .eq("id", inviteRowId);

  if (error) throw new Error(error.message);
}
