import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { startSession } from "@/lib/services/interview-engine";

export const POST = withApiHandler<{ id: string }>(async (_request: NextRequest, { params }) => {
  const ctx = await requireRole();
  const supabase = await createSupabaseServerClient();

  const { session, question } = await startSession(supabase, params.id, ctx.userId);

  return NextResponse.json({ session, question });
});
