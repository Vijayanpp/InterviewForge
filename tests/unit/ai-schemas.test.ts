import { describe, expect, it } from "vitest";
import {
  answerEvaluationScoresSchema,
  comparisonWithPreviousSchema,
  generatedEvaluationSchema,
  generatedQuestionSchema,
  generatedReportSchema,
  generatedStudyPlanSchema,
  recommendedNextSchema,
  studyPlanItemSchema,
  topicScoreSchema,
} from "@/lib/ai/schemas";

const validQuestion = {
  title: "Closures — Question 1",
  body: "Explain how closures work in JavaScript and why they matter in production code.",
  questionType: "conceptual",
  difficulty: "medium",
  expectedConcepts: ["closures", "lexical scope"],
  idealAnswer: "Closures capture lexical scope; useful for private state and factories.",
  rubric: {
    technicalAccuracyWeight: 0.4,
    depthWeight: 0.25,
    clarityWeight: 0.15,
    completenessWeight: 0.2,
    notes: null,
  },
};

const validEvaluation = {
  scores: {
    technicalAccuracy: 8,
    depth: 7,
    clarity: null,
    completeness: null,
    problemSolving: null,
  },
  weightedScore: 7.5,
  strengths: [],
  missingPoints: [],
  incorrectStatements: [],
  idealAnswer: "A strong answer would cover closures and lexical scope with a concrete example.",
  improvementAdvice: "Add a concrete example next time.",
  followUpQuestion: null,
  evaluatorConfidence: 0.8,
};

const validReport = {
  overallScore: 82,
  hireRecommendation: "strong_hire",
  recommendationRationale: "Consistently strong technical answers across all topics covered.",
  technicalScore: null,
  communicationScore: null,
  problemSolvingScore: null,
  codingScore: null,
  topicScores: [],
  strengths: [],
  weaknesses: [],
  criticalGaps: [],
  sevenDayPlan: [],
  thirtyDayPlan: [],
  recommendedNext: null,
  comparisonWithPrevious: null,
};

describe("generatedQuestionSchema", () => {
  it("accepts a well-formed question", () => {
    expect(() => generatedQuestionSchema.parse(validQuestion)).not.toThrow();
  });

  it("accepts null idealAnswer", () => {
    expect(() => generatedQuestionSchema.parse({ ...validQuestion, idealAnswer: null })).not.toThrow();
  });

  it("rejects a question with no expected concepts", () => {
    expect(() => generatedQuestionSchema.parse({ ...validQuestion, expectedConcepts: [] })).toThrow();
  });

  it("rejects a question with an unknown question type", () => {
    expect(() =>
      generatedQuestionSchema.parse({ ...validQuestion, questionType: "trivia" })
    ).toThrow();
  });

  it("rejects a body over the 4000-character limit", () => {
    expect(() =>
      generatedQuestionSchema.parse({ ...validQuestion, body: "a".repeat(4001) })
    ).toThrow();
  });

  it("rejects rubric weights outside the 0-1 range", () => {
    expect(() =>
      generatedQuestionSchema.parse({
        ...validQuestion,
        rubric: { ...validQuestion.rubric, technicalAccuracyWeight: 1.5 },
      })
    ).toThrow();
  });
});

describe("answerEvaluationScoresSchema", () => {
  it("requires every score key (nullable for N/A categories)", () => {
    expect(() => answerEvaluationScoresSchema.parse({})).toThrow();
    expect(() =>
      answerEvaluationScoresSchema.parse({
        technicalAccuracy: null,
        depth: null,
        clarity: null,
        completeness: null,
        problemSolving: null,
      })
    ).not.toThrow();
  });

  it("rejects a score above 10", () => {
    expect(() =>
      answerEvaluationScoresSchema.parse({
        technicalAccuracy: 11,
        depth: null,
        clarity: null,
        completeness: null,
        problemSolving: null,
      })
    ).toThrow();
  });
});

describe("generatedEvaluationSchema", () => {
  it("accepts a well-formed evaluation", () => {
    const parsed = generatedEvaluationSchema.parse(validEvaluation);
    expect(parsed.followUpQuestion).toBeNull();
    expect(parsed.evaluatorConfidence).toBe(0.8);
  });

  it("rejects a weightedScore outside 0-10", () => {
    expect(() => generatedEvaluationSchema.parse({ ...validEvaluation, weightedScore: 12 })).toThrow();
  });

  it("requires a non-empty idealAnswer and improvementAdvice", () => {
    expect(() => generatedEvaluationSchema.parse({ ...validEvaluation, idealAnswer: "" })).toThrow();
    expect(() => generatedEvaluationSchema.parse({ ...validEvaluation, improvementAdvice: "" })).toThrow();
  });
});

describe("topicScoreSchema / studyPlanItemSchema", () => {
  it("accepts a topic score with a null topicId (ad-hoc topics)", () => {
    expect(() => topicScoreSchema.parse({ topicId: null, topicName: "Closures", score: 72 })).not.toThrow();
  });

  it("rejects a score above 100", () => {
    expect(() => topicScoreSchema.parse({ topicId: null, topicName: "Closures", score: 150 })).toThrow();
  });

  it("requires at least one task per study plan day", () => {
    expect(() => studyPlanItemSchema.parse({ day: 1, focus: "Closures", tasks: [] })).toThrow();
  });

  it("rejects a day outside the 1-30 range", () => {
    expect(() =>
      studyPlanItemSchema.parse({ day: 31, focus: "Closures", tasks: ["Read the docs."] })
    ).toThrow();
  });
});

describe("recommendedNextSchema / comparisonWithPreviousSchema", () => {
  it("accepts a recommendation with empty topics", () => {
    const parsed = recommendedNextSchema.parse({
      interviewType: "technical",
      technology: "React",
      topics: [],
      reason: "Focus on hooks next time.",
    });
    expect(parsed.topics).toEqual([]);
  });

  it("accepts a null previous score for a candidate's first-ever session", () => {
    expect(() =>
      comparisonWithPreviousSchema.parse({
        previousSessionId: null,
        previousScore: null,
        currentScore: 70,
        delta: null,
        narrative: "This was your first interview for this technology.",
      })
    ).not.toThrow();
  });
});

describe("generatedReportSchema", () => {
  it("accepts a complete report", () => {
    const parsed = generatedReportSchema.parse(validReport);
    expect(parsed.topicScores).toEqual([]);
    expect(parsed.recommendedNext).toBeNull();
  });

  it("rejects an invalid hire recommendation", () => {
    expect(() => generatedReportSchema.parse({ ...validReport, hireRecommendation: "maybe" })).toThrow();
  });

  it("rejects an overallScore outside 0-100", () => {
    expect(() => generatedReportSchema.parse({ ...validReport, overallScore: 101 })).toThrow();
  });
});

describe("generatedStudyPlanSchema", () => {
  it("accepts empty plans", () => {
    const parsed = generatedStudyPlanSchema.parse({ sevenDayPlan: [], thirtyDayPlan: [] });
    expect(parsed.sevenDayPlan).toEqual([]);
    expect(parsed.thirtyDayPlan).toEqual([]);
  });
});
