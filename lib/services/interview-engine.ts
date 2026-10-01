import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { resolveInterviewEngine } from "@/lib/env";
import type { VoiceTranscript } from "@/types/domain/voice";
import {
  endSessionLegacy,
  startSessionLegacy,
  submitAnswerLegacy,
  toOverallScore,
  type SessionWithReport,
  type StartSessionResult,
  type SubmitAnswerResult,
} from "@/lib/services/interview-engine-legacy";
import {
  endSessionGraph,
  startSessionGraph,
  submitAnswerGraph,
} from "@/lib/services/interview-engine-graph";

type Client = SupabaseClient<Database>;

export type { StartSessionResult, SubmitAnswerResult, SessionWithReport };
export { toOverallScore };

/** BFF adapter: graph engine by default, `INTERVIEW_ENGINE=legacy` to roll back. */
export async function startSession(
  supabase: Client,
  sessionId: string,
  candidateId: string
): Promise<StartSessionResult> {
  if (resolveInterviewEngine() === "legacy") {
    return startSessionLegacy(supabase, sessionId, candidateId);
  }
  return startSessionGraph(supabase, sessionId, candidateId);
}

export async function submitAnswer(
  supabase: Client,
  sessionId: string,
  candidateId: string,
  input: {
    questionId: string;
    answerText: string;
    durationSeconds?: number;
    isRetry?: boolean;
    transcript?: VoiceTranscript;
  }
): Promise<SubmitAnswerResult> {
  if (resolveInterviewEngine() === "legacy") {
    return submitAnswerLegacy(supabase, sessionId, candidateId, input);
  }
  return submitAnswerGraph(supabase, sessionId, candidateId, input);
}

export async function endSession(
  supabase: Client,
  sessionId: string,
  candidateId: string,
  reason: "candidate_ended" | "time_expired" | "topics_exhausted" = "candidate_ended"
) {
  if (resolveInterviewEngine() === "legacy") {
    return endSessionLegacy(supabase, sessionId, candidateId, reason);
  }
  return endSessionGraph(supabase, sessionId, candidateId, reason);
}
