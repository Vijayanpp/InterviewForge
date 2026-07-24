import "server-only";
import { nanoid } from "nanoid";
import { getAiProvider } from "@/lib/ai";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createChallenge } from "@/lib/repositories/coding-challenges.repo";
import { createTestCase } from "@/lib/repositories/coding-test-cases.repo";
import { defaultStarterCode, type CodingLanguage } from "@/lib/code-execution/languages";
import type { GeneratedCodingChallenge } from "@/lib/ai/schemas";
import type { CodingChallenge } from "@/types/domain/coding";

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return `ai-${base || "challenge"}-${nanoid(8)}`.toLowerCase();
}

/** Always keep every language the candidate selected; fill missing starters. */
function buildStarterCode(
  languages: CodingLanguage[],
  generated: GeneratedCodingChallenge
): Record<string, string> {
  const fromAi = new Map(generated.starterCode.map((e) => [e.language, e.code] as const));
  const map: Record<string, string> = {};
  for (const lang of languages) {
    map[lang] = fromAi.get(lang) ?? defaultStarterCode(lang);
  }
  return map;
}

export async function generateAndPersistPracticeChallenge(input: {
  userId: string;
  difficulty: "easy" | "medium" | "hard";
  languages: CodingLanguage[];
  topicHint?: string | null;
}): Promise<{ challenge: CodingChallenge; generated: GeneratedCodingChallenge }> {
  const requestedLanguages: CodingLanguage[] =
    input.languages.length > 0 ? input.languages : ["javascript"];

  const provider = getAiProvider();
  const generated = await provider.generateCodingChallenge({
    difficulty: input.difficulty,
    languages: requestedLanguages,
    topicHint: input.topicHint,
  });

  // Candidate selection wins — the model often returns only a subset (e.g. JS only).
  const effectiveLanguages = requestedLanguages;

  const admin = createSupabaseAdminClient();
  const challenge = await createChallenge(
    admin,
    {
      technologyId: null,
      topicId: null,
      title: generated.title,
      slug: slugifyTitle(generated.title),
      problemStatement: generated.problemStatement,
      difficulty: generated.difficulty,
      examples: generated.examples.map((e) => ({
        input: e.input,
        output: e.output,
        ...(e.explanation ? { explanation: e.explanation } : {}),
      })),
      constraints: generated.constraints ?? undefined,
      starterCode: buildStarterCode(effectiveLanguages, generated),
      supportedLanguages: effectiveLanguages,
      expectedTimeComplexity: generated.expectedTimeComplexity ?? undefined,
      expectedSpaceComplexity: generated.expectedSpaceComplexity ?? undefined,
      timeLimitMs: 3000,
      memoryLimitMb: 256,
      status: "approved",
    },
    input.userId
  );

  let orderIndex = 0;
  for (const test of generated.testCases) {
    await createTestCase(admin, {
      challengeId: challenge.id,
      input: test.input,
      expectedOutput: test.expectedOutput,
      isHidden: test.isHidden,
      orderIndex: orderIndex++,
      weight: test.weight,
    });
  }

  return { challenge, generated };
}
