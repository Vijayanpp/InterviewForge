import { z } from "zod";

/**
 * These mirror the Postgres enum types created in
 * supabase/migrations/20250101000001_extensions_and_helpers.sql. Keep them
 * in sync with the SQL — this file is the single TypeScript source of truth
 * consumed by both the UI and the Zod validators used in API routes.
 */

export const ROLE_NAMES = ["candidate", "interviewer", "admin"] as const;
export const roleNameSchema = z.enum(ROLE_NAMES);
export type RoleName = z.infer<typeof roleNameSchema>;

export const EXPERIENCE_LEVELS = ["fresher", "junior", "mid", "senior", "lead", "architect"] as const;
export const experienceLevelSchema = z.enum(EXPERIENCE_LEVELS);
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard", "adaptive"] as const;
export const difficultyLevelSchema = z.enum(DIFFICULTY_LEVELS);
export type DifficultyLevel = z.infer<typeof difficultyLevelSchema>;

export const INTERVIEW_TYPES = [
  "technical",
  "coding",
  "mixed",
  "behavioural",
  "system_design",
  "resume_based",
  "job_description_based",
] as const;
export const interviewTypeSchema = z.enum(INTERVIEW_TYPES);
export type InterviewType = z.infer<typeof interviewTypeSchema>;

export const INTERVIEW_MODES = ["text", "voice", "coding"] as const;
export const interviewModeSchema = z.enum(INTERVIEW_MODES);
export type InterviewMode = z.infer<typeof interviewModeSchema>;

export const INTERVIEW_MODE_LABELS: Record<InterviewMode, string> = {
  text: "Text",
  voice: "Voice",
  coding: "Coding",
};

export const SESSION_STATUSES = ["draft", "in_progress", "completed", "abandoned"] as const;
export const sessionStatusSchema = z.enum(SESSION_STATUSES);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const QUESTION_TYPES = [
  "conceptual",
  "scenario_based",
  "debugging",
  "output_prediction",
  "code_review",
  "coding_challenge",
  "architecture",
  "multiple_choice",
  "behavioural",
  "project_experience",
  "system_design",
] as const;
export const questionTypeSchema = z.enum(QUESTION_TYPES);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const CONTENT_STATUSES = ["draft", "approved", "rejected", "archived"] as const;
export const contentStatusSchema = z.enum(CONTENT_STATUSES);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const HIRE_RECOMMENDATIONS = ["strong_hire", "hire", "borderline", "not_ready_yet"] as const;
export const hireRecommendationSchema = z.enum(HIRE_RECOMMENDATIONS);
export type HireRecommendation = z.infer<typeof hireRecommendationSchema>;

export const PROMPT_NAMES = [
  "interviewer",
  "question_generator",
  "answer_evaluator",
  "coding_evaluator",
  "coding_challenge_generator",
  "behavioural_evaluator",
  "report_generator",
  "study_plan_generator",
] as const;
export const promptNameSchema = z.enum(PROMPT_NAMES);
export type PromptName = z.infer<typeof promptNameSchema>;

export const PROMPT_STATUSES = ["draft", "published", "archived"] as const;
export const promptStatusSchema = z.enum(PROMPT_STATUSES);
export type PromptStatus = z.infer<typeof promptStatusSchema>;

export const HIRE_RECOMMENDATION_LABELS: Record<HireRecommendation, string> = {
  strong_hire: "Strong Hire",
  hire: "Hire",
  borderline: "Borderline",
  not_ready_yet: "Not Ready Yet",
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  fresher: "Fresher",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  architect: "Architect",
};

export const DIFFICULTY_LEVEL_LABELS: Record<DifficultyLevel, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  adaptive: "Adaptive",
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  conceptual: "Conceptual",
  scenario_based: "Scenario-Based",
  debugging: "Debugging",
  output_prediction: "Output Prediction",
  code_review: "Code Review",
  coding_challenge: "Coding Challenge",
  architecture: "Architecture",
  multiple_choice: "Multiple Choice",
  behavioural: "Behavioural",
  project_experience: "Project Experience",
  system_design: "System Design",
};

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  technical: "Technical",
  coding: "Coding",
  mixed: "Mixed",
  behavioural: "Behavioural",
  system_design: "System Design",
  resume_based: "Resume-Based",
  job_description_based: "Job Description Match",
};
