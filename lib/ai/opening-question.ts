import type { GenerateQuestionParams } from "@/lib/ai/provider";
import type { GeneratedQuestion } from "@/lib/ai/schemas";
import { generatedQuestionSchema } from "@/lib/ai/schemas";

/**
 * Deterministic first-turn welcome for live interviews (text + voice).
 * Used by both mock and OpenAI providers so greeting does not depend on the model following soft prompt rules.
 */
export function buildOpeningQuestion(params: GenerateQuestionParams): GeneratedQuestion {
  const name = params.candidateName?.trim();
  const greet = name ? name.split(/\s+/)[0]! : "there";
  const focus =
    params.topics[0] ??
    (params.technology !== "General Programming" ? params.technology : "your target role");

  return generatedQuestionSchema.parse({
    title: "Welcome & introduction",
    body: [
      `Hi ${greet}! I'm Maya, a Technical Architect with about 20 years of experience — I'll be your interviewer today.`,
      `We'll keep this conversational and focused on ${focus}.`,
      `To get started, could you briefly introduce yourself — your background, what you've been working on lately, and what you're preparing for?`,
    ].join(" "),
    questionType: "behavioural",
    difficulty: params.difficulty,
    expectedConcepts: ["background", "experience", "goals", "communication"],
    idealAnswer:
      "A clear, concise intro covering recent experience, stack strengths, and interview goals.",
    rubric: {
      technicalAccuracyWeight: 0.15,
      depthWeight: 0.25,
      clarityWeight: 0.35,
      completenessWeight: 0.25,
      notes: "Opening intro — prioritize clarity and relevance over technical depth.",
    },
  });
}

/** True when this call should use the deterministic opening instead of generating a technical question. */
export function shouldUseOpeningQuestion(params: GenerateQuestionParams): boolean {
  return params.previousQuestions.length === 0 && !params.skipOpening;
}
