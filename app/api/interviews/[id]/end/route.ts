import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { endSession } from "@/lib/services/interview-engine";
import { endSessionSchema } from "@/types/domain/interview";

export const POST = withApiHandler<{ id: string }>(async (request: NextRequest, { params }) => {
  const ctx = await requireRole();
  const body = await request.json().catch(() => ({}));
  const input = endSessionSchema.parse(body);

  const supabase = await createSupabaseServerClient();
  const report = await endSession(supabase, params.id, ctx.userId, input.reason);

  return NextResponse.json({ report });
});
