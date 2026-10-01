import { getAiProvider } from "@/lib/ai";
import { generatedReportSchema, type GeneratedReport } from "@/lib/ai/schemas";
import type { InterviewState } from "@/lib/graph/state";
import type { GenerateReportParams } from "@/lib/ai/provider";

export async function synthesizeReport(
  state: InterviewState,
  questionEvaluations: GenerateReportParams["questionEvaluations"]
): Promise<GeneratedReport> {
  if (questionEvaluations.length === 0) {
    return generatedReportSchema.parse({
      overallScore: 0,
      hireRecommendation: "not_ready_yet",
      recommendationRationale: "No questions were answered during this session.",
      technicalScore: null,
      communicationScore: null,
      problemSolvingScore: null,
      codingScore: null,
      topicScores: [],
      strengths: [],
      weaknesses: [],
      criticalGaps: [],
      sevenDayPlan: [],
      thirtyDayPlan: [],
      recommendedNext: {
        interviewType: state.interviewType,
        technology: state.technology,
        topics: [],
        reason: "Try again and answer at least one question to get a personalized report.",
      },
      comparisonWithPrevious: null,
    });
  }

  const provider = getAiProvider();
  return provider.generateReport({
    interviewType: state.interviewType,
    technology: state.technology,
    topics: state.topics,
    experienceLevel: state.experienceLevel,
    questionEvaluations,
    previousSessions: state.previousSessionSummaries,
  });
}
