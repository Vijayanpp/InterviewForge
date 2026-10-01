import type { InterviewPlan } from "@/lib/agents/schemas/query";
import type { InterviewState, InterviewStateUpdate, InterviewTurnMode } from "@/lib/graph/state";

/**
 * Fresh per-run input. Keeps thread-level memory (messages, plan) while
 * clearing turn artifacts — same pattern as Business-Research `build_graph_input`.
 */
export function buildGraphInput(
  base: Partial<InterviewState> & {
    sessionId: string;
    turnMode: InterviewTurnMode;
    interviewType: InterviewState["interviewType"];
    technology: string;
    experienceLevel: InterviewState["experienceLevel"];
    difficulty: InterviewState["difficulty"];
  }
): InterviewStateUpdate {
  return {
    sessionId: base.sessionId,
    conversationId: base.conversationId ?? base.sessionId,
    interviewType: base.interviewType,
    technology: base.technology,
    topics: base.topics ?? [],
    experienceLevel: base.experienceLevel,
    difficulty: base.difficulty,
    remainingMinutes: base.remainingMinutes ?? 30,
    questionsAsked: base.questionsAsked ?? 0,
    minQuestions: base.minQuestions ?? 4,
    maxQuestions: base.maxQuestions ?? 12,
    mixedTextQuestions: base.mixedTextQuestions ?? 2,
    previousQuestions: base.previousQuestions ?? [],
    topicCoverage: base.topicCoverage ?? [],
    candidateName: base.candidateName ?? null,
    targetCompany: base.targetCompany ?? null,
    customInstructions: base.customInstructions ?? null,
    resumeText: base.resumeText ?? null,
    jobDescriptionText: base.jobDescriptionText ?? null,
    skipOpening: base.skipOpening ?? false,
    candidateId: base.candidateId ?? null,
    interviewGoal: base.interviewGoal ?? buildInterviewObjective(base),
    interviewPlan: (base.interviewPlan as InterviewPlan | null | undefined) ?? null,
    currentTask: base.currentTask ?? null,
    expansion: null,
    decomposition: null,
    multiQuery: null,
    retrievedEvidence: [],
    retrievalTrace: null,
    turnMode: base.turnMode,
    lastQuestionBody: base.lastQuestionBody ?? null,
    lastCandidateAnswer: base.lastCandidateAnswer ?? null,
    lastEvaluationSummary: base.lastEvaluationSummary ?? null,
    questionType: base.questionType ?? null,
    expectedConcepts: base.expectedConcepts ?? [],
    referenceAnswer: base.referenceAnswer ?? null,
    generatedQuestion: null,
    lastEvaluation: null,
    generatedReport: null,
    previousSessionSummaries: base.previousSessionSummaries ?? [],
    researchIteration: base.researchIteration ?? 0,
    maxResearchIterations: base.maxResearchIterations ?? 2,
    supervisorDecision: null,
  };
}

export function buildInterviewObjective(input: {
  interviewType: InterviewState["interviewType"];
  technology: string;
  topics?: string[];
  experienceLevel: InterviewState["experienceLevel"];
  targetCompany?: string | null;
  customInstructions?: string | null;
  lastCandidateAnswer?: string | null;
  lastQuestionBody?: string | null;
}): string {
  const topics = input.topics?.length ? input.topics.join(", ") : input.technology;
  const parts = [
    `${input.interviewType} interview for a ${input.experienceLevel} ${input.technology} candidate covering ${topics}.`,
  ];
  if (input.targetCompany) parts.push(`Target company: ${input.targetCompany}.`);
  if (input.customInstructions) parts.push(`Instructions: ${input.customInstructions}`);
  if (input.lastQuestionBody) parts.push(`Last question: ${input.lastQuestionBody}`);
  if (input.lastCandidateAnswer) parts.push(`Candidate answer: ${input.lastCandidateAnswer}`);
  return parts.join(" ");
}
