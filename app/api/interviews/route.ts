import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createInterviewSessionSchema } from "@/types/domain/interview";
import { createSession } from "@/lib/repositories/interview-sessions.repo";

export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireRole();
  checkRateLimit(`create-interview:${ctx.userId}`, { windowMs: 60_000, max: 10 });

  const body = await request.json();
  const input = createInterviewSessionSchema.parse(body);

  const supabase = await createSupabaseServerClient();
  const session = await createSession(supabase, ctx.userId, input);

  return NextResponse.json({ session }, { status: 201 });
});
