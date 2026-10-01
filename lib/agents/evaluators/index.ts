import { evaluateBehaviouralAnswer } from "@/lib/agents/evaluators/behavioural";
import { evaluateCodingAnswer } from "@/lib/agents/evaluators/coding";
import { evaluateTechnicalAnswer } from "@/lib/agents/evaluators/technical";
import type { GeneratedEvaluation } from "@/lib/ai/schemas";
import type { InterviewState } from "@/lib/graph/state";

export async function evaluateAnswerByType(state: InterviewState): Promise<GeneratedEvaluation> {
  if (state.interviewType === "behavioural" || state.questionType === "behavioural") {
    return evaluateBehaviouralAnswer(state);
  }
  if (
    state.interviewType === "coding" ||
    state.questionType === "coding_challenge" ||
    state.questionType === "debugging"
  ) {
    return evaluateCodingAnswer(state);
  }
  return evaluateTechnicalAnswer(state);
}
