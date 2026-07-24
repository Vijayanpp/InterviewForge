import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { submitAllTests } from "@/lib/services/coding-engine";
import { submitCodeSchema } from "@/types/domain/coding";

export const POST = withApiHandler<{ id: string }>(async (request: NextRequest, { params }) => {
  const ctx = await requireRole();
  checkRateLimit(`coding-submit:${ctx.userId}`, { windowMs: 60_000, max: 20 });

  const body = await request.json();
  const input = submitCodeSchema.parse(body);

  const supabase = await createSupabaseServerClient();
  const result = await submitAllTests(supabase, params.id, ctx.userId, {
    language: input.language,
    sourceCode: input.sourceCode,
    sessionId: input.sessionId,
  });

  return NextResponse.json(result);
});
