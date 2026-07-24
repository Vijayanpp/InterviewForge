import type { DifficultyLevel, ExperienceLevel, InterviewType, QuestionType } from "@/types/domain/enums";
import type {
  GeneratedEvaluation,
  GeneratedQuestion,
  GeneratedReport,
  GeneratedStudyPlan,
  GeneratedCodingChallenge,
} from "@/lib/ai/schemas";
import type { CodingLanguage } from "@/lib/code-execution/languages";

export interface TopicCoverageEntry {
  topic: string;
  score: number;
}

export interface GenerateQuestionParams {
  interviewType: InterviewType;
  technology: string;
  topics: string[];
  experienceLevel: ExperienceLevel;
  difficulty: DifficultyLevel;
  previousQuestions: string[];
  topicCoverage: TopicCoverageEntry[];
  remainingMinutes: number;
  targetCompany?: string | null;
  customInstructions?: string | null;
  resumeText?: string | null;
  jobDescriptionText?: string | null;
  /** Candidate display name for warm greetings / first-turn intros. */
  candidateName?: string | null;
  /** When true, skip the friendly intro turn (e.g. admin question-bank drafts). */
  skipOpening?: boolean;
}

export interface GenerateFollowUpParams extends GenerateQuestionParams {
  lastQuestionBody: string;
  lastCandidateAnswer: string;
  lastEvaluationSummary: string;
}

export interface EvaluateAnswerParams {
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  questionBody: string;
  expectedConcepts: string[];
  referenceAnswer?: string | null;
  candidateAnswer: string;
}

export interface QuestionEvaluationSummary {
  question: string;
  candidateAnswer: string;
  weightedScore: number;
  strengths: string[];
  missingPoints: string[];
  topicName: string | null;
}

export interface PreviousSessionSummary {
  sessionId: string;
  overallScore: number;
  endedAt: string | null;
}

export interface GenerateReportParams {
  interviewType: InterviewType;
  technology: string;
  topics: string[];
  experienceLevel: ExperienceLevel;
  questionEvaluations: QuestionEvaluationSummary[];
  previousSessions: PreviousSessionSummary[];
}

export interface GenerateStudyPlanParams {
  technology: string;
  weakestAreas: string[];
  criticalGaps: string[];
}

export interface GenerateCodingChallengeParams {
  difficulty: "easy" | "medium" | "hard";
  languages: CodingLanguage[];
  topicHint?: string | null;
}

/**
 * Swappable AI backend. `MockAiProvider` (default, zero-config) returns
 * deterministic schema-valid data for local dev/tests. `OpenAiProvider`
 * wraps the real OpenAI SDK, always validating output against the Zod
 * schemas in `lib/ai/schemas.ts` before returning it — never passed
 * through unchecked.
 */
export interface AiProvider {
  readonly name: "mock" | "openai";
  generateQuestion(params: GenerateQuestionParams): Promise<GeneratedQuestion>;
  generateFollowUp(params: GenerateFollowUpParams): Promise<GeneratedQuestion>;
  evaluateAnswer(params: EvaluateAnswerParams): Promise<GeneratedEvaluation>;
  generateReport(params: GenerateReportParams): Promise<GeneratedReport>;
  generateStudyPlan(params: GenerateStudyPlanParams): Promise<GeneratedStudyPlan>;
  generateCodingChallenge(params: GenerateCodingChallengeParams): Promise<GeneratedCodingChallenge>;
}
