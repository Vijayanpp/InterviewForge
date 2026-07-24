import { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { checkRateLimit } from "@/lib/rate-limit";
import { CODING_LANGUAGES } from "@/lib/code-execution/languages";
import { generateAndPersistPracticeChallenge } from "@/lib/services/coding-practice";
import { toCandidateFacingChallenge } from "@/types/domain/coding";

const generatePracticeChallengeSchema = z.object({
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  languages: z
    .array(z.enum(CODING_LANGUAGES))
    .min(1)
    .max(21)
    .default(["javascript"]),
  topicHint: z.string().trim().max(120).optional(),
});

export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireRole();
  checkRateLimit(`coding-generate:${ctx.userId}`, { windowMs: 60_000, max: 8 });

  const body = await request.json().catch(() => ({}));
  const input = generatePracticeChallengeSchema.parse(body);

  const { challenge, generated } = await generateAndPersistPracticeChallenge({
    userId: ctx.userId,
    difficulty: input.difficulty,
    languages: input.languages,
    topicHint: input.topicHint,
  });

  const visibleTestCount = generated.testCases.filter((t) => !t.isHidden).length;

  return NextResponse.json({
    challengeId: challenge.id,
    challenge: toCandidateFacingChallenge(challenge, visibleTestCount),
  });
});
