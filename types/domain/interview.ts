import { z } from "zod";
import type { Tables } from "@/types/domain/db-helpers";
import {
  difficultyLevelSchema,
  experienceLevelSchema,
  interviewModeSchema,
  interviewTypeSchema,
} from "@/types/domain/enums";
import { voiceTranscriptSchema } from "@/types/domain/voice";

export type InterviewTemplate = Tables<"interview_templates">;
export type InterviewSession = Tables<"interview_sessions">;
export type InterviewQuestion = Tables<"interview_questions">;
export type CandidateAnswer = Tables<"candidate_answers">;
export type AnswerEvaluation = Tables<"answer_evaluations">;

export const DURATION_PRESETS_MINUTES = [10, 20, 30, 45, 60] as const;

// ---------------------------------------------------------------------------
// Interview setup wizard — one schema per step so the UI can validate
// incrementally, plus a combined schema for the final submission.
// ---------------------------------------------------------------------------
export const wizardStep1Schema = z.object({
  interviewType: interviewTypeSchema,
});

export const wizardStep2Schema = z.object({
  technologyIds: z.array(z.string().uuid()).min(1, "Select at least one technology"),
});

export const wizardStep3Schema = z.object({
  topicIds: z.array(z.string().uuid()).default([]),
});

export const wizardStep4Schema = z.object({
  experienceLevel: experienceLevelSchema,
});

export const wizardStep5Schema = z.object({
  difficulty: difficultyLevelSchema,
});

export const wizardStep6Schema = z.object({
  durationMinutes: z.number().int().min(5, "Minimum 5 minutes").max(240, "Maximum 240 minutes"),
});

export const wizardStep7Schema = z.object({
  resumeId: z.string().uuid().optional(),
  jobDescriptionId: z.string().uuid().optional(),
  targetCompany: z.string().trim().max(120).optional(),
  customInstructions: z.string().trim().max(2000).optional(),
});

export const createInterviewSessionSchema = wizardStep1Schema
  .merge(wizardStep2Schema)
  .merge(wizardStep3Schema)
  .merge(wizardStep4Schema)
  .merge(wizardStep5Schema)
  .merge(wizardStep6Schema)
  .merge(wizardStep7Schema)
  .extend({
    mode: interviewModeSchema.default("text"),
  });

export type CreateInterviewSessionInput = z.infer<typeof createInterviewSessionSchema>;

// ---------------------------------------------------------------------------
// Runtime interview-room API payloads
// ---------------------------------------------------------------------------
export const submitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().trim().min(1, "Answer cannot be empty").max(8000),
  durationSeconds: z.number().int().min(0).optional(),
  isRetry: z.boolean().default(false),
  /** Voice mode only — raw/final STT payload stored on `candidate_answers.transcript`. */
  transcript: voiceTranscriptSchema.optional(),
});
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

export const endSessionSchema = z.object({
  reason: z.enum(["candidate_ended", "time_expired", "topics_exhausted"]).default("candidate_ended"),
});
export type EndSessionInput = z.infer<typeof endSessionSchema>;

/** What the candidate actually sees during the interview — never includes
 *  rubric, reference answer, or expected concepts (defense in depth beyond RLS). */
export interface CandidateFacingQuestion {
  id: string;
  title: string | null;
  body: string;
  questionType: InterviewQuestion["question_type"];
  difficulty: InterviewQuestion["difficulty"];
  orderIndex: number | null;
}

export function toCandidateFacingQuestion(q: InterviewQuestion): CandidateFacingQuestion {
  return {
    id: q.id,
    title: q.title,
    body: q.body,
    questionType: q.question_type,
    difficulty: q.difficulty,
    orderIndex: q.order_index,
  };
}
