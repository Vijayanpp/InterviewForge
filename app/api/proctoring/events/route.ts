import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { proctorEventSchema, parseAntiCheatingSettings } from "@/types/domain/assessment";
import {
  insertProctorEvent,
  refreshIntegrityForSession,
} from "@/lib/proctoring/integrity";

export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireRole();
  checkRateLimit(`proctor-event:${ctx.userId}`, { windowMs: 60_000, max: 120 });

  const body = await request.json();
  const input = proctorEventSchema.parse(body);

  const supabase = await createSupabaseServerClient();
  const { data: session } = await supabase
    .from("interview_sessions")
    .select("id, candidate_id")
    .eq("id", input.sessionId)
    .single();

  if (!session || session.candidate_id !== ctx.userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data: ac } = await supabase
    .from("assessment_candidates")
    .select("id, assessment_id, assessments(anti_cheating_settings)")
    .eq("session_id", input.sessionId)
    .maybeSingle();

  const event = await insertProctorEvent(supabase, input, ac?.id ?? null);

  let integrity = null;
  if (ac) {
    const settingsRaw = (ac.assessments as { anti_cheating_settings?: unknown } | null)
      ?.anti_cheating_settings;
    const settings = parseAntiCheatingSettings(settingsRaw);
    integrity = await refreshIntegrityForSession(
      supabase,
      input.sessionId,
      settings.maxViolationsBeforeFlag
    );
  }

  return NextResponse.json({ event, integrity });
});

export const GET = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireRole("interviewer", "admin");
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: ac } = await admin
    .from("assessment_candidates")
    .select("id, assessment_id, assessments(organization_id)")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!ac) {
    return NextResponse.json({ error: "Not an assessment session" }, { status: 404 });
  }

  const orgId = (ac.assessments as { organization_id?: string } | null)?.organization_id;
  const supabase = await createSupabaseServerClient();
  const { data: member } = await supabase
    .from("recruiter_members")
    .select("id")
    .eq("organization_id", orgId!)
    .eq("profile_id", ctx.userId)
    .maybeSingle();

  if (!member && ctx.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: events } = await admin
    .from("proctoring_events")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  return NextResponse.json({ events: events ?? [] });
});
