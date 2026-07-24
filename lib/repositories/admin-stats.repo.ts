import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export interface AdminOverviewStats {
  activeTechnologies: number;
  activeTopics: number;
  draftQuestions: number;
  approvedQuestions: number;
  totalCandidates: number;
  totalSessions: number;
  completedSessions: number;
}

export async function getAdminOverviewStats(supabase: Client): Promise<AdminOverviewStats> {
  const [
    technologiesResult,
    topicsResult,
    draftQuestionsResult,
    approvedQuestionsResult,
    candidatesResult,
    sessionsResult,
    completedSessionsResult,
  ] = await Promise.all([
    supabase
      .from("technologies")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("topics")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("interview_questions")
      .select("*", { count: "exact", head: true })
      .is("session_id", null)
      .eq("status", "draft"),
    supabase
      .from("interview_questions")
      .select("*", { count: "exact", head: true })
      .is("session_id", null)
      .eq("status", "approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("interview_sessions").select("*", { count: "exact", head: true }),
    supabase
      .from("interview_sessions")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  return {
    activeTechnologies: technologiesResult.count ?? 0,
    activeTopics: topicsResult.count ?? 0,
    draftQuestions: draftQuestionsResult.count ?? 0,
    approvedQuestions: approvedQuestionsResult.count ?? 0,
    totalCandidates: candidatesResult.count ?? 0,
    totalSessions: sessionsResult.count ?? 0,
    completedSessions: completedSessionsResult.count ?? 0,
  };
}
