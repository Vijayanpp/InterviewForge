import { z } from "zod";
import type { Tables } from "@/types/domain/db-helpers";
import {
  contentStatusSchema,
  difficultyLevelSchema,
  experienceLevelSchema,
  questionTypeSchema,
} from "@/types/domain/enums";

/** A row from `interview_questions` where `session_id IS NULL` — a bank entry. */
export type QuestionBankEntry = Tables<"interview_questions">;

export const questionRubricSchema = z.object({
  technicalAccuracyWeight: z.number().min(0).max(1),
  depthWeight: z.number().min(0).max(1),
  clarityWeight: z.number().min(0).max(1),
  completenessWeight: z.number().min(0).max(1),
  notes: z.string().max(1000).optional(),
});
export type QuestionRubric = z.infer<typeof questionRubricSchema>;

export const createQuestionBankEntrySchema = z.object({
  technologyId: z.string().uuid(),
  topicId: z.string().uuid().nullable().default(null),
  experienceLevels: z.array(experienceLevelSchema).min(1),
  difficulty: difficultyLevelSchema.default("medium"),
  questionType: questionTypeSchema.default("conceptual"),
  title: z.string().trim().max(160).optional(),
  body: z.string().trim().min(1).max(4000),
  expectedConcepts: z.array(z.string().trim().min(1)).default([]),
  rubric: questionRubricSchema.default({
    technicalAccuracyWeight: 0.4,
    depthWeight: 0.25,
    clarityWeight: 0.15,
    completenessWeight: 0.2,
  }),
  maxScore: z.number().min(1).max(20).default(10),
  referenceAnswer: z.string().trim().max(4000).optional(),
  status: contentStatusSchema.default("draft"),
});
export type CreateQuestionBankEntryInput = z.infer<typeof createQuestionBankEntrySchema>;

export const updateQuestionBankEntrySchema = createQuestionBankEntrySchema.partial();
export type UpdateQuestionBankEntryInput = z.infer<typeof updateQuestionBankEntrySchema>;

export const generateQuestionDraftSchema = z.object({
  technologyId: z.string().uuid(),
  topicId: z.string().uuid().nullable().default(null),
  experienceLevel: experienceLevelSchema.default("mid"),
  difficulty: difficultyLevelSchema.default("medium"),
});
export type GenerateQuestionDraftInput = z.infer<typeof generateQuestionDraftSchema>;
