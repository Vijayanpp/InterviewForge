import { describe, expect, it } from "vitest";
import { applySupervisorGuards, decideSupervisorFallback } from "@/lib/agents/supervisor";
import { routeAskOrGrade, routeStart } from "@/lib/graph/routing";
import type { InterviewState } from "@/lib/graph/state";

const baseInput = {
  remainingMinutes: 20,
  questionsAsked: 2,
  minQuestions: 4,
  maxQuestions: 12,
  lastWeightedScore: 8,
  wasFollowUp: false,
  interviewType: "technical",
  mixedTextQuestions: 2,
  researchIteration: 0,
  maxResearchIterations: 2,
};

describe("supervisor guards", () => {
  it("ends when time or max questions are exhausted", () => {
    const decision = applySupervisorGuards({ ...baseInput, remainingMinutes: 0.2, questionsAsked: 4 });
    expect(decision?.decision).toBe("end");
  });

  it("hands mixed interviews to coding after the text round", () => {
    const decision = applySupervisorGuards({
      ...baseInput,
      interviewType: "mixed",
      questionsAsked: 2,
      lastWeightedScore: 8,
    });
    expect(decision?.decision).toBe("coding");
  });

  it("falls back to follow-up when the last score is weak", () => {
    const decision = decideSupervisorFallback({
      ...baseInput,
      lastWeightedScore: 4,
      questionsAsked: 2,
    });
    expect(decision.decision).toBe("follow_up");
  });

  it("forces a terminal decision after max research iterations", () => {
    const decision = applySupervisorGuards({
      ...baseInput,
      researchIteration: 2,
      lastEvaluationSupported: false,
      lastWeightedScore: 4,
    });
    expect(decision?.decision).toBe("follow_up");
  });
});

describe("graph routing", () => {
  it("routes prep to planner, ask to opening guard, grade to retrieve", () => {
    expect(routeStart({ turnMode: "prep" } as InterviewState)).toBe("planner");
    expect(routeStart({ turnMode: "ask" } as InterviewState)).toBe("opening_guard");
    expect(routeStart({ turnMode: "grade" } as InterviewState)).toBe("retrieve");
    expect(routeStart({ turnMode: "close" } as InterviewState)).toBe("synthesizer");
  });

  it("ends prep after retrieval and sends grade turns to the evaluator", () => {
    expect(routeAskOrGrade({ turnMode: "prep" } as InterviewState)).toBe("__end__");
    expect(routeAskOrGrade({ turnMode: "ask" } as InterviewState)).toBe("interviewer");
    expect(routeAskOrGrade({ turnMode: "grade" } as InterviewState)).toBe("evaluator");
  });
});
