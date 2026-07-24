import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { runVisibleTests } from "@/lib/services/coding-engine";
import { runCodeSchema } from "@/types/domain/coding";

export const POST = withApiHandler<{ id: string }>(async (request: NextRequest, { params }) => {
  const ctx = await requireRole();
  checkRateLimit(`coding-run:${ctx.userId}`, { windowMs: 60_000, max: 40 });

  const body = await request.json();
  const input = runCodeSchema.parse(body);

  const supabase = await createSupabaseServerClient();
  const result = await runVisibleTests(supabase, params.id, input);

  return NextResponse.json(result);
});
