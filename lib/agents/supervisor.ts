import {
  supervisorDecisionSchema,
  type SupervisorDecision,
} from "@/lib/agents/schemas/query";
import { decideNextAction, type AdaptiveDecision } from "@/lib/services/scoring";

export interface SupervisorInput {
  remainingMinutes: number;
  questionsAsked: number;
  minQuestions: number;
  maxQuestions: number;
  lastWeightedScore: number;
  wasFollowUp: boolean;
  interviewType: string;
  mixedTextQuestions: number;
  researchIteration: number;
  maxResearchIterations: number;
  lastEvaluationSupported?: boolean;
}

/**
 * Hard policy caps — same role as Business-Research max_research_iterations
 * and InterviewForge `decideNextAction`. Always wins over the LLM supervisor.
 */
export function applySupervisorGuards(input: SupervisorInput): SupervisorDecision | null {
  if (input.researchIteration >= input.maxResearchIterations && input.lastEvaluationSupported === false) {
    return supervisorDecisionSchema.parse({
      decision: mapAdaptiveDecision(
        decideNextAction({
          remainingMinutes: input.remainingMinutes,
          questionsAsked: input.questionsAsked,
          minQuestions: input.minQuestions,
          maxQuestions: input.maxQuestions,
          lastWeightedScore: input.lastWeightedScore,
          wasFollowUp: input.wasFollowUp,
        })
      ),
      reasoning: "Maximum research iterations reached. Proceeding with the best available evaluation.",
      researchQuality: "adequate",
      missingInformation: [],
      followUpHint: null,
    });
  }

  if (input.interviewType === "mixed" && input.questionsAsked >= input.mixedTextQuestions) {
    const adaptive = decideNextAction({
      remainingMinutes: input.remainingMinutes,
      questionsAsked: input.questionsAsked,
      minQuestions: input.minQuestions,
      maxQuestions: input.maxQuestions,
      lastWeightedScore: input.lastWeightedScore,
      wasFollowUp: input.wasFollowUp,
    });
    if (adaptive !== "follow_up") {
      return supervisorDecisionSchema.parse({
        decision: "coding",
        reasoning: "Mixed interview text round is complete. Hand off to coding.",
        researchQuality: "adequate",
        missingInformation: [],
        followUpHint: null,
      });
    }
  }

  const adaptive = decideNextAction({
    remainingMinutes: input.remainingMinutes,
    questionsAsked: input.questionsAsked,
    minQuestions: input.minQuestions,
    maxQuestions: input.maxQuestions,
    lastWeightedScore: input.lastWeightedScore,
    wasFollowUp: input.wasFollowUp,
  });

  if (adaptive === "end") {
    return supervisorDecisionSchema.parse({
      decision: "end",
      reasoning: "Time or question cap reached.",
      researchQuality: "adequate",
      missingInformation: [],
      followUpHint: null,
    });
  }

  return null;
}

export function decideSupervisorFallback(input: SupervisorInput): SupervisorDecision {
  const guarded = applySupervisorGuards(input);
  if (guarded) return guarded;

  const adaptive = decideNextAction({
    remainingMinutes: input.remainingMinutes,
    questionsAsked: input.questionsAsked,
    minQuestions: input.minQuestions,
    maxQuestions: input.maxQuestions,
    lastWeightedScore: input.lastWeightedScore,
    wasFollowUp: input.wasFollowUp,
  });

  return supervisorDecisionSchema.parse({
    decision: mapAdaptiveDecision(adaptive),
    reasoning: "Rule-based supervisor fallback.",
    researchQuality: input.lastWeightedScore >= 7 ? "strong" : "adequate",
    missingInformation: input.lastWeightedScore < 6 ? ["Need a deeper probe on the last gap."] : [],
    followUpHint: input.lastWeightedScore < 6 ? "Probe the weakest expected concept." : null,
  });
}

function mapAdaptiveDecision(decision: AdaptiveDecision): SupervisorDecision["decision"] {
  if (decision === "follow_up") return "follow_up";
  if (decision === "end") return "end";
  return "next_question";
}

export async function reviewInterview(input: SupervisorInput): Promise<SupervisorDecision> {
  const guarded = applySupervisorGuards(input);
  if (guarded) return guarded;

  const { invokeStructured } = await import("@/lib/agents/structured");
  return invokeStructured(
    supervisorDecisionSchema,
    "supervisor_decision",
    `You supervise a live interview.

Questions asked: ${input.questionsAsked} (min ${input.minQuestions}, max ${input.maxQuestions})
Minutes remaining: ${input.remainingMinutes}
Last score: ${input.lastWeightedScore}/10
Was follow-up: ${input.wasFollowUp}
Type: ${input.interviewType}
Evidence supported: ${input.lastEvaluationSupported ?? true}

Choose follow_up, next_question, coding, end, or research_more.
Respect time and question caps. Do not generate the next question.
Return structured supervisor decision.`,
    () => decideSupervisorFallback(input)
  );
}
