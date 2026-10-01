import { Annotation } from "@langchain/langgraph";
import type {
  InterviewPlan,
  InterviewTask,
  MultiQueryResult,
  QueryDecomposition,
  QueryExpansion,
  SupervisorDecision,
  ValidatedFinding,
} from "@/lib/agents/schemas/query";
import type { GeneratedEvaluation, GeneratedQuestion, GeneratedReport } from "@/lib/ai/schemas";
import type { RetrievalTrace, RetrievedDocument } from "@/lib/retrieval/types";
import type {
  DifficultyLevel,
  ExperienceLevel,
  InterviewType,
  QuestionType,
} from "@/types/domain/enums";

export type InterviewTurnMode = "prep" | "ask" | "grade" | "close";

export interface InterviewMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface InterviewGraphError {
  stage: string;
  error: string;
  agent?: string;
}

export interface TopicCoverageEntry {
  topic: string;
  score: number;
}

const replace = <T>(_left: T, right: T) => right;

export const InterviewAnnotation = Annotation.Root({
  sessionId: Annotation<string>,
  conversationId: Annotation<string>,
  messages: Annotation<InterviewMessage[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),

  interviewType: Annotation<InterviewType>,
  technology: Annotation<string>,
  topics: Annotation<string[]>({ reducer: replace, default: () => [] }),
  experienceLevel: Annotation<ExperienceLevel>,
  difficulty: Annotation<DifficultyLevel>,
  remainingMinutes: Annotation<number>,
  questionsAsked: Annotation<number>,
  minQuestions: Annotation<number>,
  maxQuestions: Annotation<number>,
  mixedTextQuestions: Annotation<number>,
  previousQuestions: Annotation<string[]>({ reducer: replace, default: () => [] }),
  topicCoverage: Annotation<TopicCoverageEntry[]>({ reducer: replace, default: () => [] }),
  candidateName: Annotation<string | null>,
  targetCompany: Annotation<string | null>,
  customInstructions: Annotation<string | null>,
  resumeText: Annotation<string | null>,
  jobDescriptionText: Annotation<string | null>,
  skipOpening: Annotation<boolean>,
  candidateId: Annotation<string | null>,

  interviewGoal: Annotation<string>,
  interviewPlan: Annotation<InterviewPlan | null>,
  currentTask: Annotation<InterviewTask | null>,

  expansion: Annotation<QueryExpansion | null>,
  decomposition: Annotation<QueryDecomposition | null>,
  multiQuery: Annotation<MultiQueryResult | null>,
  retrievedEvidence: Annotation<RetrievedDocument[]>({ reducer: replace, default: () => [] }),
  retrievalTrace: Annotation<RetrievalTrace | null>,

  turnMode: Annotation<InterviewTurnMode>,
  lastQuestionBody: Annotation<string | null>,
  lastCandidateAnswer: Annotation<string | null>,
  lastEvaluationSummary: Annotation<string | null>,
  questionType: Annotation<QuestionType | null>,
  expectedConcepts: Annotation<string[]>({ reducer: replace, default: () => [] }),
  referenceAnswer: Annotation<string | null>,

  generatedQuestion: Annotation<GeneratedQuestion | null>,
  lastEvaluation: Annotation<GeneratedEvaluation | null>,
  validatedFindings: Annotation<ValidatedFinding[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),

  researchIteration: Annotation<number>,
  maxResearchIterations: Annotation<number>,
  supervisorDecision: Annotation<SupervisorDecision | null>,

  generatedReport: Annotation<GeneratedReport | null>,
  previousSessionSummaries: Annotation<
    Array<{ sessionId: string; overallScore: number; endedAt: string | null }>
  >({
    reducer: replace,
    default: () => [],
  }),

  errors: Annotation<InterviewGraphError[]>({
    reducer: (left, right) => left.concat(right),
    default: () => [],
  }),
});

export type InterviewState = typeof InterviewAnnotation.State;
export type InterviewStateUpdate = typeof InterviewAnnotation.Update;
