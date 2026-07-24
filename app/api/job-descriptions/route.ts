import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createJobDescription } from "@/lib/repositories/documents.repo";
import { createJobDescriptionSchema } from "@/types/domain/documents";

export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireRole();
  checkRateLimit(`create-jd:${ctx.userId}`, { windowMs: 60_000, max: 20 });

  const body = createJobDescriptionSchema.parse(await request.json());
  const supabase = await createSupabaseServerClient();
  const jobDescription = await createJobDescription(supabase, {
    candidateId: ctx.userId,
    content: body.content,
    title: body.title,
    company: body.company,
    source: "paste",
  });

  return NextResponse.json({ jobDescription }, { status: 201 });
});
