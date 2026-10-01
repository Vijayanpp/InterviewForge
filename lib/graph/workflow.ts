import "server-only";
import { END, START, StateGraph } from "@langchain/langgraph";
import { createInterviewPlan } from "@/lib/agents/planner";
import { generateInterviewQuestion } from "@/lib/agents/interviewer";
import { evaluateAnswerByType } from "@/lib/agents/evaluators";
import { validateFinding } from "@/lib/agents/evidence-validator";
import { reviewInterview } from "@/lib/agents/supervisor";
import { synthesizeReport } from "@/lib/agents/synthesizer";
import { runSpecialistResearch } from "@/lib/agents/research-engine";
import { buildOpeningQuestion, shouldUseOpeningQuestion } from "@/lib/ai/opening-question";
import { getInterviewCheckpointer } from "@/lib/graph/checkpointer";
import { buildInterviewObjective } from "@/lib/graph/inputs";
import {
  InterviewAnnotation,
  type InterviewState,
  type InterviewStateUpdate,
} from "@/lib/graph/state";
import {
  routeAfterOpening,
  routeAfterSupervisor,
  routeAskOrGrade,
  routeStart,
} from "@/lib/graph/routing";
import { configureLangSmith } from "@/lib/agents/tracing";
import { logger } from "@/lib/logger";

function addError(stage: string, error: unknown, agent?: string): InterviewStateUpdate {
  return {
    errors: [{ stage, error: error instanceof Error ? error.message : String(error), agent }],
  };
}

async function plannerNode(state: InterviewState): Promise<InterviewStateUpdate> {
  try {
    const interviewPlan = await createInterviewPlan(state);
    return {
      interviewPlan,
      interviewGoal: interviewPlan.goal,
      currentTask: interviewPlan.tasks[0] ?? null,
    };
  } catch (error) {
    return addError("planner", error, "planner");
  }
}

async function openingGuardNode(state: InterviewState): Promise<InterviewStateUpdate> {
  const params = {
    interviewType: state.interviewType,
    technology: state.technology,
    topics: state.topics,
    experienceLevel: state.experienceLevel,
    difficulty: state.difficulty,
    previousQuestions: state.previousQuestions,
    topicCoverage: state.topicCoverage,
    remainingMinutes: state.remainingMinutes,
    candidateName: state.candidateName,
    skipOpening: state.skipOpening,
  };
  if (shouldUseOpeningQuestion(params)) {
    return { generatedQuestion: buildOpeningQuestion(params) };
  }
  return {};
}

async function retrieveNode(state: InterviewState): Promise<InterviewStateUpdate> {
  try {
    const objective = state.lastCandidateAnswer
      ? buildInterviewObjective(state)
      : state.interviewGoal || buildInterviewObjective(state);
    const trace = await runSpecialistResearch(state, objective);
    return {
      interviewGoal: objective,
      expansion: {
        originalQuery: objective,
        expandedQuery: trace.expandedQuery ?? objective,
        terms: trace.expansionTerms,
        reasoning: "Retrieval expansion",
      },
      retrievedEvidence: trace.documents,
      retrievalTrace: trace,
      researchIteration: state.researchIteration + (state.turnMode === "grade" ? 1 : 0),
    };
  } catch (error) {
    return addError("retrieve", error, "retriever");
  }
}

async function interviewerNode(state: InterviewState): Promise<InterviewStateUpdate> {
  try {
    if (state.turnMode === "ask" && state.generatedQuestion && state.previousQuestions.length === 0) {
      return { generatedQuestion: state.generatedQuestion };
    }
    const mode =
      state.supervisorDecision?.decision === "follow_up" ||
      state.supervisorDecision?.decision === "research_more"
        ? "follow_up"
        : "next";
    const generatedQuestion = await generateInterviewQuestion(state, mode);
    return {
      generatedQuestion,
      messages: [{ role: "assistant", content: generatedQuestion.body }],
    };
  } catch (error) {
    return addError("interviewer", error, "interviewer");
  }
}

async function evaluatorNode(state: InterviewState): Promise<InterviewStateUpdate> {
  try {
    const lastEvaluation = await evaluateAnswerByType(state);
    return {
      lastEvaluation,
      lastEvaluationSummary: lastEvaluation.improvementAdvice,
    };
  } catch (error) {
    return addError("evaluator", error, "evaluator");
  }
}

async function validatorNode(state: InterviewState): Promise<InterviewStateUpdate> {
  if (!state.lastEvaluation) return {};
  try {
    const finding = await validateFinding(
      state.lastEvaluation,
      state.retrievedEvidence,
      state.interviewType === "behavioural" ? "behavioural_evaluator" : "technical_evaluator"
    );
    return { validatedFindings: [finding] };
  } catch (error) {
    return addError("validator", error, "evidence_validator");
  }
}

async function supervisorNode(state: InterviewState): Promise<InterviewStateUpdate> {
  try {
    const lastScore = state.lastEvaluation?.weightedScore ?? 0;
    const wasFollowUp = (state.lastQuestionBody ?? "").toLowerCase().includes("following up")
      || (state.generatedQuestion?.title.startsWith("Follow-up:") ?? false);
    const supervisorDecision = await reviewInterview({
      remainingMinutes: state.remainingMinutes,
      questionsAsked: state.questionsAsked,
      minQuestions: state.minQuestions,
      maxQuestions: state.maxQuestions,
      lastWeightedScore: lastScore,
      wasFollowUp,
      interviewType: state.interviewType,
      mixedTextQuestions: state.mixedTextQuestions,
      researchIteration: state.researchIteration,
      maxResearchIterations: state.maxResearchIterations,
      lastEvaluationSupported: state.validatedFindings.at(-1)?.supported,
    });
    return { supervisorDecision };
  } catch (error) {
    return addError("supervisor", error, "supervisor");
  }
}

async function synthesizerNode(state: InterviewState): Promise<InterviewStateUpdate> {
  try {
    const generatedReport = await synthesizeReport(state, []);
    return { generatedReport };
  } catch (error) {
    return addError("synthesizer", error, "coach");
  }
}

function compileInterviewGraph() {
  const builder = new StateGraph(InterviewAnnotation)
    .addNode("planner", plannerNode)
    .addNode("opening_guard", openingGuardNode)
    .addNode("retrieve", retrieveNode)
    .addNode("interviewer", interviewerNode)
    .addNode("evaluator", evaluatorNode)
    .addNode("validator", validatorNode)
    .addNode("supervisor", supervisorNode)
    .addNode("synthesizer", synthesizerNode)
    .addConditionalEdges(START, routeStart, {
      planner: "planner",
      opening_guard: "opening_guard",
      retrieve: "retrieve",
      synthesizer: "synthesizer",
    })
    .addEdge("planner", "retrieve")
    .addConditionalEdges("opening_guard", routeAfterOpening, {
      retrieve: "retrieve",
      interviewer: "interviewer",
    })
    .addConditionalEdges("retrieve", routeAskOrGrade, {
      interviewer: "interviewer",
      evaluator: "evaluator",
      __end__: END,
    })
    .addEdge("evaluator", "validator")
    .addEdge("validator", "supervisor")
    .addConditionalEdges("supervisor", routeAfterSupervisor, {
      retrieve: "retrieve",
      interviewer: "interviewer",
      __end__: END,
    })
    .addEdge("interviewer", END)
    .addEdge("synthesizer", END);

  return builder.compile({ checkpointer: getInterviewCheckpointer() });
}

let compiledGraph: ReturnType<typeof compileInterviewGraph> | undefined;

export function getInterviewGraph() {
  configureLangSmith();
  if (!compiledGraph) {
    compiledGraph = compileInterviewGraph();
    logger.info("Interview LangGraph compiled");
  }
  return compiledGraph;
}

export function resetInterviewGraph(): void {
  compiledGraph = undefined;
}

export async function invokeInterviewGraph(
  input: InterviewStateUpdate,
  sessionId: string
): Promise<InterviewState> {
  const graph = getInterviewGraph();
  return graph.invoke(input, {
    configurable: { thread_id: sessionId },
    runName: `interview.${input.turnMode ?? "turn"}`,
    tags: ["interviewforge", String(input.turnMode ?? "turn")],
    metadata: { sessionId, turnMode: input.turnMode ?? null },
  }) as Promise<InterviewState>;
}
