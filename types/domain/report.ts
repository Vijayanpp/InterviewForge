import type { Tables } from "@/types/domain/db-helpers";
import type { HireRecommendation } from "@/types/domain/enums";

export type InterviewReport = Tables<"interview_reports">;

export interface TopicScore {
  topicId: string | null;
  topicName: string;
  score: number; // 0-100
}

export interface QuestionFeedbackItem {
  questionId: string;
  question: string;
  candidateAnswer: string;
  score: number; // 0-10
  strengths: string[];
  missingPoints: string[];
  idealAnswer: string;
  improvementAdvice: string;
}

export interface StudyPlanItem {
  day: number;
  focus: string;
  tasks: string[];
}

export interface RecommendedNext {
  interviewType: string;
  technology: string;
  topics: string[];
  reason: string;
}

export interface ComparisonWithPrevious {
  previousSessionId: string | null;
  previousScore: number | null;
  currentScore: number;
  delta: number | null;
  narrative: string;
}

export const HIRE_RECOMMENDATION_COLOR: Record<HireRecommendation, string> = {
  strong_hire: "text-success",
  hire: "text-success",
  borderline: "text-warning",
  not_ready_yet: "text-destructive",
};
