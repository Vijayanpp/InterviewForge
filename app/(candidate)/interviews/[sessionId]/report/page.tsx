import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSessionById } from "@/lib/repositories/interview-sessions.repo";
import { getReportBySessionId } from "@/lib/repositories/interview-reports.repo";
import { ReportHeader } from "@/components/report/report-header";
import { SubScores } from "@/components/report/sub-scores";
import { TopicScoresChart } from "@/components/report/topic-scores-chart";
import { StrengthsWeaknesses } from "@/components/report/strengths-weaknesses";
import { StudyPlan } from "@/components/report/study-plan";
import { QuestionFeedbackList } from "@/components/report/question-feedback-list";
import { RecommendedNextCard } from "@/components/report/recommended-next";
import { ComparisonWithPreviousCard } from "@/components/report/comparison-with-previous";
import type {
  ComparisonWithPrevious,
  QuestionFeedbackItem,
  RecommendedNext,
  StudyPlanItem,
  TopicScore,
} from "@/types/domain/report";

export const metadata: Metadata = {
  title: "Interview Report",
};

export default async function InterviewReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const ctx = await getAuthContext();
  const supabase = await createSupabaseServerClient();

  const session = await getSessionById(supabase, sessionId);
  if (!session || session.candidate_id !== ctx?.userId) notFound();

  const report = await getReportBySessionId(supabase, sessionId);

  if (!report) {
    redirect(`/interviews/${sessionId}/room`);
  }

  const topicScores = (report.topic_scores as unknown as TopicScore[]) ?? [];
  const strengths = (report.strongest_areas as unknown as string[]) ?? [];
  const weaknesses = (report.weakest_areas as unknown as string[]) ?? [];
  const criticalGaps = (report.critical_gaps as unknown as string[]) ?? [];
  const sevenDayPlan = (report.seven_day_plan as unknown as StudyPlanItem[]) ?? [];
  const thirtyDayPlan = (report.thirty_day_plan as unknown as StudyPlanItem[]) ?? [];
  const questionFeedback = (report.question_feedback as unknown as QuestionFeedbackItem[]) ?? [];
  const recommendedNext = report.recommended_next as unknown as RecommendedNext | null;
  const comparisonWithPrevious = report.comparison_with_previous as unknown as ComparisonWithPrevious | null;

  return (
    <div className="space-y-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-foreground">Interview Report</h1>
        <p className="mt-xs text-body-md text-muted-foreground">
          Generated {new Date(report.generated_at).toLocaleString()}
        </p>
      </div>

      <ReportHeader report={report} />
      <ComparisonWithPreviousCard comparison={comparisonWithPrevious} />
      <SubScores report={report} />
      <TopicScoresChart topicScores={topicScores} />
      <StrengthsWeaknesses strengths={strengths} weaknesses={weaknesses} criticalGaps={criticalGaps} />
      <StudyPlan sevenDayPlan={sevenDayPlan} thirtyDayPlan={thirtyDayPlan} />
      <QuestionFeedbackList items={questionFeedback} />
      <RecommendedNextCard recommendedNext={recommendedNext} />
    </div>
  );
}
