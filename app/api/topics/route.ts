import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { listTopicsForTechnologies } from "@/lib/repositories/technologies.repo";

export const GET = withApiHandler(async (request: NextRequest) => {
  await requireRole();

  const technologyIds = (request.nextUrl.searchParams.get("technologyIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const supabase = await createSupabaseServerClient();
  const topics = await listTopicsForTechnologies(supabase, technologyIds);

  return NextResponse.json({ topics });
});
