import { generatedEvaluationSchema, type GeneratedEvaluation } from "@/lib/ai/schemas";
import { evaluateTechnicalAnswer } from "@/lib/agents/evaluators/technical";
import type { InterviewState } from "@/lib/graph/state";

export async function evaluateBehaviouralAnswer(state: InterviewState): Promise<GeneratedEvaluation> {
  try {
    const { loadPublishedPrompt, renderPromptTemplate } = await import("@/lib/ai/prompt-loader");
    const { invokeStructured } = await import("@/lib/agents/structured");
    const prompt = await loadPublishedPrompt("behavioural_evaluator");
    const system = renderPromptTemplate(prompt.content, {
      question: state.lastQuestionBody,
      answer: state.lastCandidateAnswer,
    });
    return invokeStructured(
      generatedEvaluationSchema,
      "behavioural_evaluation",
      `${system}\n\nQuestion: ${state.lastQuestionBody}\nAnswer: ${state.lastCandidateAnswer}\n\nGrade using STAR: situation, task, action, result. Return structured evaluation.`,
      () => mockBehavioural(state)
    );
  } catch {
    return evaluateTechnicalAnswer({ ...state, questionType: "behavioural" });
  }
}

function mockBehavioural(state: InterviewState): GeneratedEvaluation {
  const answer = state.lastCandidateAnswer ?? "";
  const hasStar = /\b(situation|task|action|result|i led|we shipped)\b/i.test(answer);
  const weightedScore = Math.min(10, 4 + Math.min(answer.length / 200, 3) + (hasStar ? 2 : 0));
  return generatedEvaluationSchema.parse({
    scores: {
      technicalAccuracy: null,
      depth: weightedScore,
      clarity: hasStar ? 8 : 5,
      completeness: hasStar ? 7 : 4,
      problemSolving: weightedScore,
    },
    weightedScore: Math.round(weightedScore * 10) / 10,
    strengths: hasStar ? ["Used a structured story."] : ["Attempted a behavioural answer."],
    missingPoints: hasStar ? [] : ["Add Situation, Task, Action, and Result."],
    incorrectStatements: [],
    idealAnswer: "A STAR story with ownership and a measurable result.",
    improvementAdvice: hasStar
      ? "Quantify the result more precisely."
      : "Retell this using STAR and name your specific actions.",
    followUpQuestion: hasStar ? null : "What was your specific role, and what changed because of it?",
    evaluatorConfidence: 0.7,
  });
}
