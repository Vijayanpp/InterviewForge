import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { getCodeExecutionProvider } from "@/lib/code-execution";
import type { CodingLanguage } from "@/lib/code-execution/languages";
import { isCodingLanguage } from "@/lib/code-execution/languages";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import {
  getChallengeById,
} from "@/lib/repositories/coding-challenges.repo";
import {
  listAllTestCases,
  listVisibleTestCases,
} from "@/lib/repositories/coding-test-cases.repo";
import { createSubmission } from "@/lib/repositories/code-submissions.repo";
import { computeWeightedScore } from "@/lib/services/coding-scoring";
import type {
  CodingTestCase,
  RunChallengeResult,
  SubmitChallengeResult,
  TestCaseRunResult,
} from "@/types/domain/coding";

type Client = SupabaseClient<Database>;

function normalizeOutput(text: string): string {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

export { computeWeightedScore };

async function executeCases(
  cases: CodingTestCase[],
  opts: {
    language: CodingLanguage;
    sourceCode: string;
    challengeSlug: string;
    timeLimitMs: number;
    memoryLimitMb: number;
    revealDetails: boolean;
  }
): Promise<{ results: TestCaseRunResult[]; passedIds: Set<string> }> {
  const provider = getCodeExecutionProvider();
  const results: TestCaseRunResult[] = [];
  const passedIds = new Set<string>();

  for (const testCase of cases) {
    const run = await provider.run({
      language: opts.language,
      sourceCode: opts.sourceCode,
      stdin: testCase.input,
      expectedOutput: testCase.expected_output,
      challengeSlug: opts.challengeSlug,
      timeLimitMs: opts.timeLimitMs,
      memoryLimitMb: opts.memoryLimitMb,
    });

    // Mock provider returns expected stdout when the source looks complete;
    // Judge0 returns real stdout — always require accepted + normalized match
    // except mock-accepted which already embeds the expected output.
    const finalPass =
      run.status === "accepted" &&
      (provider.name === "mock" ||
        normalizeOutput(run.stdout) === normalizeOutput(testCase.expected_output));

    if (finalPass) passedIds.add(testCase.id);

    const result: TestCaseRunResult = {
      testCaseId: testCase.id,
      passed: finalPass,
      status: run.status,
    };

    if (opts.revealDetails && !testCase.is_hidden) {
      result.input = testCase.input;
      result.stdout = run.stdout;
      result.stderr = run.stderr;
      result.timeMs = run.timeMs;
    }

    results.push(result);
  }

  return { results, passedIds };
}

async function assertReadableChallenge(supabase: Client, challengeId: string) {
  const challenge = await getChallengeById(supabase, challengeId);
  if (!challenge || challenge.deleted_at) throw new NotFoundError("Challenge not found.");
  if (challenge.status !== "approved") {
    // Admins may still run drafts via admin UI later; candidates cannot.
    throw new NotFoundError("Challenge not found.");
  }
  return challenge;
}

/**
 * Runs only visible (non-hidden) tests. Safe for the candidate RLS client —
 * never loads hidden cases.
 */
export async function runVisibleTests(
  supabase: Client,
  challengeId: string,
  input: { language: string; sourceCode: string }
): Promise<RunChallengeResult> {
  if (!isCodingLanguage(input.language)) {
    throw new ForbiddenError("Unsupported language.");
  }

  const challenge = await assertReadableChallenge(supabase, challengeId);
  if (!challenge.supported_languages.includes(input.language)) {
    throw new ForbiddenError("This challenge does not support that language.");
  }

  const cases = await listVisibleTestCases(supabase, challengeId);
  const { results, passedIds } = await executeCases(cases, {
    language: input.language,
    sourceCode: input.sourceCode,
    challengeSlug: challenge.slug,
    timeLimitMs: challenge.time_limit_ms,
    memoryLimitMb: challenge.memory_limit_mb,
    revealDetails: true,
  });

  return {
    passedCount: passedIds.size,
    totalCount: cases.length,
    results,
  };
}

/**
 * Runs ALL tests (including hidden) via the admin client, persists a
 * submission, and returns a candidate-safe summary (no hidden inputs/outputs).
 */
export async function submitAllTests(
  supabase: Client,
  challengeId: string,
  candidateId: string,
  input: { language: string; sourceCode: string; sessionId?: string }
): Promise<SubmitChallengeResult> {
  if (!isCodingLanguage(input.language)) {
    throw new ForbiddenError("Unsupported language.");
  }

  const challenge = await assertReadableChallenge(supabase, challengeId);
  if (!challenge.supported_languages.includes(input.language)) {
    throw new ForbiddenError("This challenge does not support that language.");
  }

  const admin = createSupabaseAdminClient();
  const allCases = await listAllTestCases(admin, challengeId);

  const { results, passedIds } = await executeCases(allCases, {
    language: input.language,
    sourceCode: input.sourceCode,
    challengeSlug: challenge.slug,
    timeLimitMs: challenge.time_limit_ms,
    memoryLimitMb: challenge.memory_limit_mb,
    revealDetails: false,
  });

  // Re-attach visible case inputs only; never leak hidden case data.
  const visibleIds = new Set(allCases.filter((c) => !c.is_hidden).map((c) => c.id));
  const visibleCases = await listVisibleTestCases(supabase, challengeId);
  const visibleById = new Map(visibleCases.map((c) => [c.id, c]));

  const safeResults: TestCaseRunResult[] = results.map((r) => {
    if (!visibleIds.has(r.testCaseId)) {
      return { testCaseId: r.testCaseId, passed: r.passed, status: r.status };
    }
    const tc = visibleById.get(r.testCaseId);
    return {
      testCaseId: r.testCaseId,
      passed: r.passed,
      status: r.status,
      input: tc?.input,
    };
  });

  const score = computeWeightedScore(allCases, passedIds);
  const status: SubmitChallengeResult["status"] =
    allCases.length > 0 && passedIds.size === allCases.length ? "passed" : "failed";

  const submission = await createSubmission(supabase, {
    challengeId,
    candidateId,
    sessionId: input.sessionId,
    language: input.language,
    sourceCode: input.sourceCode,
    status,
    passedTestCount: passedIds.size,
    totalTestCount: allCases.length,
    executionResult: {
      score,
      results: safeResults,
      provider: getCodeExecutionProvider().name,
    } as unknown as Json,
    evaluation: { score } as unknown as Json,
  });

  return {
    submissionId: submission.id,
    status,
    score,
    passedCount: passedIds.size,
    totalCount: allCases.length,
    results: safeResults,
  };
}
