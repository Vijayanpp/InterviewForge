import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { CandidateAnswer } from "@/types/domain/interview";
import type { VoiceTranscript } from "@/types/domain/voice";

type Client = SupabaseClient<Database>;

export async function createAnswer(
  supabase: Client,
  input: {
    questionId: string;
    sessionId: string;
    answerText: string;
    durationSeconds?: number;
    isRetry?: boolean;
    transcript?: VoiceTranscript;
  }
): Promise<CandidateAnswer> {
  const { data, error } = await supabase
    .from("candidate_answers")
    .insert({
      question_id: input.questionId,
      session_id: input.sessionId,
      answer_text: input.answerText,
      duration_seconds: input.durationSeconds ?? null,
      is_retry: input.isRetry ?? false,
      transcript: (input.transcript as Json | undefined) ?? null,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save answer");
  return data;
}

export async function listAnswersForSession(
  supabase: Client,
  sessionId: string
): Promise<CandidateAnswer[]> {
  const { data, error } = await supabase
    .from("candidate_answers")
    .select("*")
    .eq("session_id", sessionId)
    .order("submitted_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}
