import { z } from "zod";
import { questionTypeSchema, difficultyLevelSchema, hireRecommendationSchema } from "@/types/domain/enums";
import { CODING_LANGUAGES } from "@/lib/code-execution/languages";

/**
 * Every AI provider response is validated against one of these schemas
 * before it's used anywhere in the app.
 *
 * OpenAI Structured Outputs require every property to be listed as required;
 * optional values must use `.nullable()` (not bare `.optional()`).
 * @see https://platform.openai.com/docs/guides/structured-outputs
 */

export const generatedQuestionSchema = z.object({
  title: z.string().min(1).max(160),
  body: z.string().min(1).max(4000),
  questionType: questionTypeSchema,
  difficulty: difficultyLevelSchema,
  expectedConcepts: z.array(z.string().min(1)).min(1).max(12),
  /** Model-authored ideal answer for graders (never shown mid-interview). */
  idealAnswer: z.string().max(4000).nullable(),
  rubric: z.object({
    technicalAccuracyWeight: z.number().min(0).max(1),
    depthWeight: z.number().min(0).max(1),
    clarityWeight: z.number().min(0).max(1),
    completenessWeight: z.number().min(0).max(1),
    notes: z.string().max(1000).nullable(),
  }),
});
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;

export const answerEvaluationScoresSchema = z.object({
  technicalAccuracy: z.number().min(0).max(10).nullable(),
  depth: z.number().min(0).max(10).nullable(),
  clarity: z.number().min(0).max(10).nullable(),
  completeness: z.number().min(0).max(10).nullable(),
  problemSolving: z.number().min(0).max(10).nullable(),
});

export const generatedEvaluationSchema = z.object({
  scores: answerEvaluationScoresSchema,
  weightedScore: z.number().min(0).max(10),
  strengths: z.array(z.string()),
  missingPoints: z.array(z.string()),
  incorrectStatements: z.array(z.string()),
  idealAnswer: z.string().min(1).max(4000),
  improvementAdvice: z.string().min(1).max(2000),
  followUpQuestion: z.string().max(1000).nullable(),
  evaluatorConfidence: z.number().min(0).max(1),
});
export type GeneratedEvaluation = z.infer<typeof generatedEvaluationSchema>;

export const topicScoreSchema = z.object({
  topicId: z.string().uuid().nullable(),
  topicName: z.string().min(1),
  score: z.number().min(0).max(100),
});

export const studyPlanItemSchema = z.object({
  day: z.number().int().min(1).max(30),
  focus: z.string().min(1).max(200),
  tasks: z.array(z.string().min(1)).min(1).max(8),
});
export type GeneratedStudyPlanItem = z.infer<typeof studyPlanItemSchema>;

export const recommendedNextSchema = z.object({
  interviewType: z.string(),
  technology: z.string(),
  topics: z.array(z.string()),
  reason: z.string().min(1).max(500),
});

export const comparisonWithPreviousSchema = z.object({
  previousSessionId: z.string().uuid().nullable(),
  previousScore: z.number().min(0).max(100).nullable(),
  currentScore: z.number().min(0).max(100),
  delta: z.number().nullable(),
  narrative: z.string().min(1).max(500),
});

export const generatedReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  hireRecommendation: hireRecommendationSchema,
  recommendationRationale: z.string().min(1).max(1500),
  technicalScore: z.number().min(0).max(100).nullable(),
  communicationScore: z.number().min(0).max(100).nullable(),
  problemSolvingScore: z.number().min(0).max(100).nullable(),
  codingScore: z.number().min(0).max(100).nullable(),
  topicScores: z.array(topicScoreSchema),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  criticalGaps: z.array(z.string()),
  sevenDayPlan: z.array(studyPlanItemSchema),
  thirtyDayPlan: z.array(studyPlanItemSchema),
  recommendedNext: recommendedNextSchema.nullable(),
  comparisonWithPrevious: comparisonWithPreviousSchema.nullable(),
});
export type GeneratedReport = z.infer<typeof generatedReportSchema>;

export const generatedStudyPlanSchema = z.object({
  sevenDayPlan: z.array(studyPlanItemSchema),
  thirtyDayPlan: z.array(studyPlanItemSchema),
});
export type GeneratedStudyPlan = z.infer<typeof generatedStudyPlanSchema>;

const codingLanguageLiteralSchema = z.enum(CODING_LANGUAGES);

/** AI-authored coding challenge used for practice generation (OpenAI structured outputs). */
export const generatedCodingChallengeSchema = z.object({
  title: z.string().min(1).max(160),
  problemStatement: z.string().min(1).max(12_000),
  difficulty: z.enum(["easy", "medium", "hard"]),
  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        explanation: z.string().nullable(),
      })
    )
    .min(1)
    .max(5),
  constraints: z.string().max(2000).nullable(),
  supportedLanguages: z.array(codingLanguageLiteralSchema).min(1).max(21),
  starterCode: z
    .array(
      z.object({
        language: codingLanguageLiteralSchema,
        code: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(21),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedOutput: z.string(),
        isHidden: z.boolean(),
        weight: z.number().min(0.1).max(10),
      })
    )
    .min(2)
    .max(12),
  expectedTimeComplexity: z.string().max(80).nullable(),
  expectedSpaceComplexity: z.string().max(80).nullable(),
});
export type GeneratedCodingChallenge = z.infer<typeof generatedCodingChallengeSchema>;
