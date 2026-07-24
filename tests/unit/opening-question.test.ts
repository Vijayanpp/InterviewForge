import { describe, expect, it } from "vitest";
import { buildOpeningQuestion, shouldUseOpeningQuestion } from "@/lib/ai/opening-question";
import type { GenerateQuestionParams } from "@/lib/ai/provider";

const baseParams: GenerateQuestionParams = {
  interviewType: "technical",
  technology: "JavaScript",
  topics: ["Closures"],
  experienceLevel: "mid",
  difficulty: "medium",
  previousQuestions: [],
  topicCoverage: [],
  remainingMinutes: 30,
};

describe("opening-question helper", () => {
  it("greets by first name when candidateName is set", () => {
    const question = buildOpeningQuestion({
      ...baseParams,
      candidateName: "Alex Rivera",
    });
    expect(question.title.toLowerCase()).toContain("welcome");
    expect(question.body).toMatch(/Hi Alex/i);
    expect(question.body).toMatch(/I'm Maya/i);
    expect(question.body.toLowerCase()).toMatch(/technical architect/);
    expect(question.body.toLowerCase()).toMatch(/introduce yourself/);
    expect(question.questionType).toBe("behavioural");
  });

  it('falls back to "there" without a name', () => {
    const question = buildOpeningQuestion(baseParams);
    expect(question.body).toMatch(/Hi there/i);
    expect(question.body).toMatch(/I'm Maya/i);
  });

  it("shouldUseOpeningQuestion is true only for live first turns", () => {
    expect(shouldUseOpeningQuestion(baseParams)).toBe(true);
    expect(shouldUseOpeningQuestion({ ...baseParams, skipOpening: true })).toBe(false);
    expect(
      shouldUseOpeningQuestion({ ...baseParams, previousQuestions: ["Prior question"] })
    ).toBe(false);
  });
});
