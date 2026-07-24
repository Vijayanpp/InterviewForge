import { z } from "zod";
import type { Tables } from "@/types/domain/db-helpers";
import { contentStatusSchema, difficultyLevelSchema } from "@/types/domain/enums";
import { CODING_LANGUAGES } from "@/lib/code-execution/languages";

export type CodingChallenge = Tables<"coding_challenges">;
export type CodingTestCase = Tables<"coding_test_cases">;
export type CodeSubmission = Tables<"code_submissions">;

export const codingLanguageSchema = z.enum(CODING_LANGUAGES);
export type CodingLanguageInput = z.infer<typeof codingLanguageSchema>;

export const challengeExampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});

export const createCodingChallengeSchema = z.object({
  technologyId: z.string().uuid().nullable().default(null),
  topicId: z.string().uuid().nullable().default(null),
  title: z.string().trim().min(1).max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  problemStatement: z.string().trim().min(1).max(20_000),
  difficulty: difficultyLevelSchema.default("medium"),
  examples: z.array(challengeExampleSchema).default([]),
  constraints: z.string().trim().max(4000).optional(),
  starterCode: z.record(z.string(), z.string()).default({}),
  supportedLanguages: z.array(codingLanguageSchema).min(1).default(["javascript"]),
  expectedTimeComplexity: z.string().trim().max(80).optional(),
  expectedSpaceComplexity: z.string().trim().max(80).optional(),
  timeLimitMs: z.number().int().min(100).max(30_000).default(2000),
  memoryLimitMb: z.number().int().min(32).max(1024).default(256),
  status: contentStatusSchema.default("draft"),
});
export type CreateCodingChallengeInput = z.infer<typeof createCodingChallengeSchema>;

export const updateCodingChallengeSchema = createCodingChallengeSchema.partial();
export type UpdateCodingChallengeInput = z.infer<typeof updateCodingChallengeSchema>;

export const createCodingTestCaseSchema = z.object({
  challengeId: z.string().uuid(),
  input: z.string().min(0).max(20_000),
  expectedOutput: z.string().min(0).max(20_000),
  isHidden: z.boolean().default(true),
  orderIndex: z.number().int().min(0).default(0),
  weight: z.number().min(0.1).max(100).default(1),
});
export type CreateCodingTestCaseInput = z.infer<typeof createCodingTestCaseSchema>;

export const updateCodingTestCaseSchema = createCodingTestCaseSchema
  .omit({ challengeId: true })
  .partial();
export type UpdateCodingTestCaseInput = z.infer<typeof updateCodingTestCaseSchema>;

export const runCodeSchema = z.object({
  language: codingLanguageSchema,
  sourceCode: z.string().trim().min(1).max(20_000),
});
export type RunCodeInput = z.infer<typeof runCodeSchema>;

export const submitCodeSchema = runCodeSchema.extend({
  sessionId: z.string().uuid().optional(),
});
export type SubmitCodeInput = z.infer<typeof submitCodeSchema>;

/** Safe for candidates — never includes hidden tests or expected outputs. */
export interface CandidateFacingChallenge {
  id: string;
  title: string;
  slug: string;
  problemStatement: string;
  difficulty: CodingChallenge["difficulty"];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string | null;
  starterCode: Record<string, string>;
  supportedLanguages: string[];
  expectedTimeComplexity: string | null;
  expectedSpaceComplexity: string | null;
  timeLimitMs: number;
  memoryLimitMb: number;
  visibleTestCount: number;
}

export interface VisibleTestCaseDto {
  id: string;
  input: string;
  orderIndex: number;
}

export interface TestCaseRunResult {
  testCaseId: string;
  passed: boolean;
  status: string;
  /** Only populated for visible (non-hidden) cases. */
  input?: string;
  stdout?: string;
  stderr?: string;
  timeMs?: number | null;
}

export interface RunChallengeResult {
  passedCount: number;
  totalCount: number;
  results: TestCaseRunResult[];
}

export interface SubmitChallengeResult extends RunChallengeResult {
  submissionId: string;
  status: CodeSubmission["status"];
  score: number; // 0-100 weighted
}

export function toCandidateFacingChallenge(
  challenge: CodingChallenge,
  visibleTestCount: number
): CandidateFacingChallenge {
  return {
    id: challenge.id,
    title: challenge.title,
    slug: challenge.slug,
    problemStatement: challenge.problem_statement,
    difficulty: challenge.difficulty,
    examples: (challenge.examples as CandidateFacingChallenge["examples"]) ?? [],
    constraints: challenge.constraints,
    starterCode: (challenge.starter_code as Record<string, string>) ?? {},
    supportedLanguages: challenge.supported_languages ?? [],
    expectedTimeComplexity: challenge.expected_time_complexity,
    expectedSpaceComplexity: challenge.expected_space_complexity,
    timeLimitMs: challenge.time_limit_ms,
    memoryLimitMb: challenge.memory_limit_mb,
    visibleTestCount,
  };
}
