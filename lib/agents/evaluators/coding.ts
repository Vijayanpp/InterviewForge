import { generatedEvaluationSchema, type GeneratedEvaluation } from "@/lib/ai/schemas";
import { evaluateTechnicalAnswer } from "@/lib/agents/evaluators/technical";
import type { InterviewState } from "@/lib/graph/state";

export async function evaluateCodingAnswer(state: InterviewState): Promise<GeneratedEvaluation> {
  try {
    const { loadPublishedPrompt, renderPromptTemplate } = await import("@/lib/ai/prompt-loader");
    const { invokeStructured } = await import("@/lib/agents/structured");
    const prompt = await loadPublishedPrompt("coding_evaluator");
    const system = renderPromptTemplate(prompt.content, {
      question: state.lastQuestionBody,
      answer: state.lastCandidateAnswer,
    });
    return invokeStructured(
      generatedEvaluationSchema,
      "coding_evaluation",
      `${system}\n\nProblem: ${state.lastQuestionBody}\nSolution: ${state.lastCandidateAnswer}\n\nGrade correctness, complexity, edge cases, and clarity. Return structured evaluation.`,
      () => mockCoding(state)
    );
  } catch {
    return evaluateTechnicalAnswer({ ...state, questionType: "coding_challenge" });
  }
}

function mockCoding(state: InterviewState): GeneratedEvaluation {
  const answer = state.lastCandidateAnswer ?? "";
  const looksLikeCode = /function|const |let |def |class |return |=>/.test(answer);
  const weightedScore = Math.min(10, (looksLikeCode ? 6 : 3) + Math.min(answer.length / 300, 3));
  return generatedEvaluationSchema.parse({
    scores: {
      technicalAccuracy: weightedScore,
      depth: looksLikeCode ? 6 : 3,
      clarity: 6,
      completeness: looksLikeCode ? 6 : 3,
      problemSolving: weightedScore,
    },
    weightedScore: Math.round(weightedScore * 10) / 10,
    strengths: looksLikeCode ? ["Provided an implementation sketch."] : ["Described an approach."],
    missingPoints: looksLikeCode ? ["Discuss complexity and edge cases."] : ["Show working code and tests."],
    incorrectStatements: [],
    idealAnswer: "A correct solution with complexity analysis and edge-case handling.",
    improvementAdvice: "Walk through an example and state time/space complexity.",
    followUpQuestion: "What is the time and space complexity, and which edge cases did you consider?",
    evaluatorConfidence: 0.65,
  });
}
