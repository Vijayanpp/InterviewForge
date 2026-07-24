import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { submitAnswer } from "@/lib/services/interview-engine";
import { submitAnswerSchema } from "@/types/domain/interview";

export const POST = withApiHandler<{ id: string }>(async (request: NextRequest, { params }) => {
  const ctx = await requireRole();
  checkRateLimit(`submit-answer:${ctx.userId}`, { windowMs: 60_000, max: 30 });

  const body = await request.json();
  const input = submitAnswerSchema.parse(body);

  const supabase = await createSupabaseServerClient();
  const result = await submitAnswer(supabase, params.id, ctx.userId, {
    questionId: input.questionId,
    answerText: input.answerText,
    durationSeconds: input.durationSeconds,
    isRetry: input.isRetry,
    transcript: input.transcript,
  });

  return NextResponse.json(result);
});
