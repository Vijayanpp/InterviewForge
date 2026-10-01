import { z } from "zod";
import { difficultyLevelSchema } from "@/types/domain/enums";

/** Query expansion — same intent, richer vocabulary. */
export const queryExpansionSchema = z.object({
  originalQuery: z.string(),
  expandedQuery: z.string(),
  terms: z.array(z.string()).max(16),
  reasoning: z.string(),
});
export type QueryExpansion = z.infer<typeof queryExpansionSchema>;

export const researchSubQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  purpose: z.string(),
});
export type ResearchSubQuestion = z.infer<typeof researchSubQuestionSchema>;

export const queryDecompositionSchema = z.object({
  originalObjective: z.string(),
  requiresDecomposition: z.boolean(),
  reasoning: z.string(),
  subQuestions: z.array(researchSubQuestionSchema),
});
export type QueryDecomposition = z.infer<typeof queryDecompositionSchema>;

export const searchQuerySchema = z.object({
  id: z.string(),
  query: z.string(),
  angle: z.string(),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const multiQueryResultSchema = z.object({
  originalQuestion: z.string(),
  queries: z.array(searchQuerySchema),
});
export type MultiQueryResult = z.infer<typeof multiQueryResultSchema>;

export const interviewTaskAgentSchema = z.enum([
  "interviewer",
  "technical_evaluator",
  "behavioural_evaluator",
  "coding_reviewer",
  "coach",
]);
export type InterviewTaskAgent = z.infer<typeof interviewTaskAgentSchema>;

export const interviewTaskSchema = z.object({
  id: z.string(),
  agent: interviewTaskAgentSchema,
  objective: z.string(),
  topics: z.array(z.string()),
  status: z.enum(["pending", "in_progress", "done"]),
});
export type InterviewTask = z.infer<typeof interviewTaskSchema>;

export const interviewPlanSchema = z.object({
  goal: z.string(),
  difficulty: difficultyLevelSchema,
  phases: z.array(z.string()),
  tasks: z.array(interviewTaskSchema),
  weakTopics: z.array(z.string()),
});
export type InterviewPlan = z.infer<typeof interviewPlanSchema>;

export const supervisorActionSchema = z.enum([
  "follow_up",
  "next_question",
  "coding",
  "end",
  "research_more",
]);
export type SupervisorAction = z.infer<typeof supervisorActionSchema>;

export const supervisorDecisionSchema = z.object({
  decision: supervisorActionSchema,
  reasoning: z.string(),
  researchQuality: z.enum(["insufficient", "adequate", "strong"]),
  missingInformation: z.array(z.string()),
  followUpHint: z.string().nullable(),
});
export type SupervisorDecision = z.infer<typeof supervisorDecisionSchema>;

export const validatedClaimSchema = z.object({
  claim: z.string(),
  supported: z.boolean(),
  sourceIds: z.array(z.string()),
  reasoning: z.string(),
});
export type ValidatedClaim = z.infer<typeof validatedClaimSchema>;

export const validatedFindingSchema = z.object({
  agent: z.string(),
  finding: z.string(),
  claims: z.array(validatedClaimSchema),
  supported: z.boolean(),
});
export type ValidatedFinding = z.infer<typeof validatedFindingSchema>;

export const rerankedItemSchema = z.object({
  id: z.string(),
  score: z.number().min(0).max(1),
  reason: z.string(),
});
export type RerankedItem = z.infer<typeof rerankedItemSchema>;

export const rerankingResultSchema = z.object({
  rankings: z.array(rerankedItemSchema),
});
export type RerankingResult = z.infer<typeof rerankingResultSchema>;
