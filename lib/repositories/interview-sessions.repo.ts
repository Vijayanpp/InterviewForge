import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CreateInterviewSessionInput, InterviewSession } from "@/types/domain/interview";
import type { InterviewReport } from "@/types/domain/report";

type Client = SupabaseClient<Database>;

export async function createSession(
  supabase: Client,
  candidateId: string,
  input: CreateInterviewSessionInput
): Promise<InterviewSession> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      candidate_id: candidateId,
      interview_type: input.interviewType,
      mode: input.mode,
      technology_ids: input.technologyIds,
      topic_ids: input.topicIds,
      experience_level: input.experienceLevel,
      difficulty: input.difficulty,
      duration_minutes: input.durationMinutes,
      target_company: input.targetCompany ?? null,
      custom_instructions: input.customInstructions ?? null,
      resume_id: input.resumeId ?? null,
      job_description_id: input.jobDescriptionId ?? null,
      config: input,
      status: "draft",
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create interview session");
  return data;
}

export async function updateSession(
  supabase: Client,
  sessionId: string,
  values: Partial<{
    status: InterviewSession["status"];
    current_question_index: number;
    started_at: string | null;
    ended_at: string | null;
    config: InterviewSession["config"];
  }>
): Promise<InterviewSession> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .update(values)
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update interview session");
  return data;
}

export interface SessionWithReport extends InterviewSession {
  interview_reports: InterviewReport[] | null;
  technologies?: { id: string; name: string; slug: string }[];
}

export async function listCandidateSessions(
  supabase: Client,
  candidateId: string,
  limit = 20
): Promise<SessionWithReport[]> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*, interview_reports(*)")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SessionWithReport[];
}

export async function getSessionById(
  supabase: Client,
  sessionId: string
): Promise<InterviewSession | null> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) return null;
  return data;
}

export async function countCompletedSessions(
  supabase: Client,
  candidateId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("interview_sessions")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", candidateId)
    .eq("status", "completed");

  if (error) throw new Error(error.message);
  return count ?? 0;
}
