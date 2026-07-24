import { describe, expect, it } from "vitest";
import { MockAiProvider } from "@/lib/ai/mock-provider";
import {
  generatedEvaluationSchema,
  generatedQuestionSchema,
  generatedReportSchema,
  generatedStudyPlanSchema,
} from "@/lib/ai/schemas";
import type {
  EvaluateAnswerParams,
  GenerateFollowUpParams,
  GenerateQuestionParams,
  GenerateReportParams,
} from "@/lib/ai/provider";

const baseQuestionParams: GenerateQuestionParams = {
  interviewType: "technical",
  technology: "JavaScript",
  topics: ["Closures"],
  experienceLevel: "mid",
  difficulty: "medium",
  previousQuestions: [],
  topicCoverage: [],
  remainingMinutes: 30,
};

describe("MockAiProvider", () => {
  it("reports its provider name", () => {
    expect(new MockAiProvider().name).toBe("mock");
  });

  describe("generateQuestion", () => {
    it("always returns schema-valid output", async () => {
      const provider = new MockAiProvider();
      const question = await provider.generateQuestion(baseQuestionParams);
      expect(() => generatedQuestionSchema.parse(question)).not.toThrow();
    });

    it("is deterministic for identical input", async () => {
      const provider = new MockAiProvider();
      const first = await provider.generateQuestion(baseQuestionParams);
      const second = await provider.generateQuestion(baseQuestionParams);
      expect(first).toEqual(second);
    });

    it("opens with a named greeting and intro ask on the first turn", async () => {
      const provider = new MockAiProvider();
      const question = await provider.generateQuestion({
        ...baseQuestionParams,
        candidateName: "Alex Rivera",
      });
      expect(question.title.toLowerCase()).toContain("welcome");
      expect(question.body).toMatch(/Hi Alex/i);
      expect(question.body).toMatch(/I'm Maya/i);
      expect(question.body.toLowerCase()).toMatch(/introduce yourself/);
      expect(question.questionType).toBe("behavioural");
    });

    it("skips the opening greeting for question-bank drafts", async () => {
      const provider = new MockAiProvider();
      const question = await provider.generateQuestion({
        ...baseQuestionParams,
        candidateName: "Alex Rivera",
        skipOpening: true,
      });
      expect(question.body.toLowerCase()).not.toMatch(/introduce yourself/);
      expect(question.title.toLowerCase()).not.toContain("welcome");
    });

    it("rotates question types as more questions have been asked", async () => {
      const provider = new MockAiProvider();
      const first = await provider.generateQuestion({
        ...baseQuestionParams,
        skipOpening: true,
      });
      const second = await provider.generateQuestion({
        ...baseQuestionParams,
        previousQuestions: [first.body],
      });
      expect(first.questionType).not.toBe(second.questionType);
    });

    it("targets the weakest-covered topic when topic coverage is provided", async () => {
      const provider = new MockAiProvider();
      const question = await provider.generateQuestion({
        ...baseQuestionParams,
        skipOpening: true,
        topics: ["Closures", "Hooks"],
        topicCoverage: [
          { topic: "Closures", score: 90 },
          { topic: "Hooks", score: 40 },
        ],
      });
      expect(question.title).toContain("Hooks");
    });
  });

  describe("generateFollowUp", () => {
    it("returns schema-valid output prefixed as a follow-up", async () => {
      const provider = new MockAiProvider();
      const params: GenerateFollowUpParams = {
        ...baseQuestionParams,
        lastQuestionBody: "Explain closures.",
        lastCandidateAnswer: "A closure is a function with access to its outer scope.",
        lastEvaluationSummary: "Good start, add an example.",
      };
      const followUp = await provider.generateFollowUp(params);
      expect(() => generatedQuestionSchema.parse(followUp)).not.toThrow();
      expect(followUp.title).toMatch(/^Follow-up:/);
    });
  });

  describe("evaluateAnswer", () => {
    const params: EvaluateAnswerParams = {
      questionType: "conceptual",
      difficulty: "medium",
      questionBody: "Explain closures.",
      expectedConcepts: ["closures", "lexical scope"],
      candidateAnswer:
        "Closures let a function retain access to its lexical scope even after the outer function has returned, which is what makes patterns like memoization and private state possible in JavaScript.",
    };

    it("returns schema-valid output", async () => {
      const provider = new MockAiProvider();
      const evaluation = await provider.evaluateAnswer(params);
      expect(() => generatedEvaluationSchema.parse(evaluation)).not.toThrow();
    });

    it("scores a thorough, on-topic answer higher than an empty one", async () => {
      const provider = new MockAiProvider();
      const goodEvaluation = await provider.evaluateAnswer(params);
      const emptyEvaluation = await provider.evaluateAnswer({ ...params, candidateAnswer: "" });
      expect(goodEvaluation.weightedScore).toBeGreaterThan(emptyEvaluation.weightedScore);
    });

    it("flags missing concepts that the answer never mentions", async () => {
      const provider = new MockAiProvider();
      const evaluation = await provider.evaluateAnswer({
        ...params,
        candidateAnswer: "Something unrelated to the question entirely.",
      });
      expect(evaluation.missingPoints.length).toBeGreaterThan(0);
    });

    it("offers a follow-up question only when the score is weak", async () => {
      const provider = new MockAiProvider();
      const weak = await provider.evaluateAnswer({ ...params, candidateAnswer: "idk" });
      const strong = await provider.evaluateAnswer(params);
      expect(weak.followUpQuestion).not.toBeNull();
      expect(strong.followUpQuestion).toBeNull();
    });
  });

  describe("generateReport", () => {
    const reportParams: GenerateReportParams = {
      interviewType: "technical",
      technology: "JavaScript",
      topics: ["Closures"],
      experienceLevel: "mid",
      questionEvaluations: [
        {
          question: "Explain closures.",
          candidateAnswer: "A closure retains access to its outer scope.",
          weightedScore: 8,
          strengths: ["Clear explanation"],
          missingPoints: [],
          topicName: "Closures",
        },
      ],
      previousSessions: [],
    };

    it("returns schema-valid output", async () => {
      const provider = new MockAiProvider();
      const report = await provider.generateReport(reportParams);
      expect(() => generatedReportSchema.parse(report)).not.toThrow();
    });

    it("returns a neutral report when there are no answered questions", async () => {
      const provider = new MockAiProvider();
      const report = await provider.generateReport({ ...reportParams, questionEvaluations: [] });
      expect(report.overallScore).toBe(50);
    });

    it("includes a comparison narrative when a previous session exists", async () => {
      const provider = new MockAiProvider();
      const report = await provider.generateReport({
        ...reportParams,
        previousSessions: [
          { sessionId: "11111111-1111-4111-8111-111111111111", overallScore: 60, endedAt: null },
        ],
      });
      expect(report.comparisonWithPrevious).not.toBeNull();
      expect(report.comparisonWithPrevious?.delta).toBe(report.overallScore - 60);
    });
  });

  describe("generateStudyPlan", () => {
    it("returns schema-valid seven- and thirty-day plans", async () => {
      const provider = new MockAiProvider();
      const plan = await provider.generateStudyPlan({
        technology: "JavaScript",
        weakestAreas: ["Closures"],
        criticalGaps: [],
      });
      expect(() => generatedStudyPlanSchema.parse(plan)).not.toThrow();
      expect(plan.sevenDayPlan).toHaveLength(7);
      expect(plan.thirtyDayPlan.length).toBeGreaterThan(0);
    });
  });
});
