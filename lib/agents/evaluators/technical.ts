import { getAiProvider } from "@/lib/ai";
import type { GeneratedEvaluation } from "@/lib/ai/schemas";
import type { InterviewState } from "@/lib/graph/state";

export async function evaluateTechnicalAnswer(state: InterviewState): Promise<GeneratedEvaluation> {
  const provider = getAiProvider();
  return provider.evaluateAnswer({
    questionType: state.questionType ?? "conceptual",
    difficulty: state.difficulty,
    questionBody: state.lastQuestionBody ?? "",
    expectedConcepts: state.expectedConcepts,
    referenceAnswer: state.referenceAnswer,
    candidateAnswer: state.lastCandidateAnswer ?? "",
  });
}
