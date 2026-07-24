import type { SupabaseClient } from "@supabase/supabase-js";
import type { Json } from "@/types/database";
import type { Database } from "@/types/database";
import type { InterviewReport } from "@/types/domain/report";
import type { GeneratedReport } from "@/lib/ai/schemas";

type Client = SupabaseClient<Database>;

export async function createReport(
  supabase: Client,
  input: {
    sessionId: string;
    report: GeneratedReport;
    questionFeedback: Json;
    confidenceScore: number;
    modelUsed: string;
  }
): Promise<InterviewReport> {
  const { report } = input;
  const { data, error } = await supabase
    .from("interview_reports")
    .insert({
      session_id: input.sessionId,
      overall_score: report.overallScore,
      hire_recommendation: report.hireRecommendation,
      recommendation_rationale: report.recommendationRationale,
      technical_score: report.technicalScore,
      communication_score: report.communicationScore,
      problem_solving_score: report.problemSolvingScore,
      coding_score: report.codingScore,
      confidence_score: input.confidenceScore,
      topic_scores: report.topicScores,
      strongest_areas: report.strengths,
      weakest_areas: report.weaknesses,
      critical_gaps: report.criticalGaps,
      question_feedback: input.questionFeedback,
      seven_day_plan: report.sevenDayPlan,
      thirty_day_plan: report.thirtyDayPlan,
      recommended_next: report.recommendedNext ?? {},
      comparison_with_previous: report.comparisonWithPrevious ?? {},
      model_used: input.modelUsed,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save interview report");
  return data;
}

export async function getReportBySessionId(
  supabase: Client,
  sessionId: string
): Promise<InterviewReport | null> {
  const { data, error } = await supabase
    .from("interview_reports")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function listCompletedReportsForCandidateAndTechnology(
  supabase: Client,
  candidateId: string,
  technologyIds: string[],
  excludeSessionId: string,
  limit = 3
): Promise<Array<{ sessionId: string; overallScore: number; endedAt: string | null }>> {
  const { data, error } = await supabase
    .from("interview_reports")
    .select("session_id, overall_score, generated_at, interview_sessions!inner(candidate_id, technology_ids, ended_at)")
    .eq("interview_sessions.candidate_id", candidateId)
    .overlaps("interview_sessions.technology_ids", technologyIds)
    .neq("session_id", excludeSessionId)
    .order("generated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    sessionId: row.session_id,
    overallScore: row.overall_score,
    endedAt: (row.interview_sessions as unknown as { ended_at: string | null })?.ended_at ?? null,
  }));
}
