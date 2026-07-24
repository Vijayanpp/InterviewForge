import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { CodeSubmission } from "@/types/domain/coding";

type Client = SupabaseClient<Database>;

export interface CreateSubmissionInput {
  challengeId: string;
  candidateId: string;
  sessionId?: string | null;
  language: string;
  sourceCode: string;
  status: CodeSubmission["status"];
  passedTestCount: number;
  totalTestCount: number;
  executionResult: Json;
  evaluation?: Json;
}

export async function createSubmission(
  supabase: Client,
  input: CreateSubmissionInput
): Promise<CodeSubmission> {
  const { data, error } = await supabase
    .from("code_submissions")
    .insert({
      challenge_id: input.challengeId,
      candidate_id: input.candidateId,
      session_id: input.sessionId ?? null,
      language: input.language,
      source_code: input.sourceCode,
      status: input.status,
      passed_test_count: input.passedTestCount,
      total_test_count: input.totalTestCount,
      execution_result: input.executionResult,
      evaluation: input.evaluation ?? {},
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save submission");
  return data;
}

export async function listSubmissionsForCandidate(
  supabase: Client,
  candidateId: string,
  limit = 20
): Promise<CodeSubmission[]> {
  const { data, error } = await supabase
    .from("code_submissions")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLatestSessionSubmission(
  supabase: Client,
  sessionId: string
): Promise<CodeSubmission | null> {
  const { data, error } = await supabase
    .from("code_submissions")
    .select("*")
    .eq("session_id", sessionId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
