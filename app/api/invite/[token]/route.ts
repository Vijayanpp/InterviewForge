import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSession } from "@/lib/repositories/interview-sessions.repo";
import {
  getInviteByToken,
  linkSessionToInvite,
  markInviteOpened,
} from "@/lib/repositories/assessments.repo";
import { parseAntiCheatingSettings } from "@/types/domain/assessment";
import type { CreateInterviewSessionInput } from "@/types/domain/interview";
import type { InterviewMode } from "@/types/domain/enums";
import { startSession } from "@/lib/services/interview-engine";

export const GET = withApiHandler<{ token: string }>(async (_request, { params }) => {
  const admin = createSupabaseAdminClient();
  const invite = await getInviteByToken(admin, params.token);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const { candidate, assessment, organizationName } = invite;
  const expired =
    (candidate.expires_at && new Date(candidate.expires_at) < new Date()) ||
    (assessment.expires_at && new Date(assessment.expires_at) < new Date()) ||
    candidate.status === "expired";

  return NextResponse.json({
    organizationName,
    title: assessment.title,
    jobRole: assessment.job_role,
    durationMinutes: assessment.duration_minutes,
    interviewMode: assessment.interview_mode,
    status: candidate.status,
    expired,
    assessmentStatus: assessment.status,
    antiCheating: parseAntiCheatingSettings(assessment.anti_cheating_settings),
    candidateEmail: candidate.candidate_email,
    sessionId: candidate.session_id,
  });
});

export const POST = withApiHandler<{ token: string }>(async (_request, { params }) => {
  const ctx = await requireRole();
  checkRateLimit(`invite-redeem:${ctx.userId}`, { windowMs: 60_000, max: 10 });

  const admin = createSupabaseAdminClient();
  const invite = await getInviteByToken(admin, params.token);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const { candidate, assessment } = invite;

  if (assessment.status !== "approved") {
    return NextResponse.json({ error: "Assessment is not open" }, { status: 400 });
  }

  if (
    candidate.status === "expired" ||
    (candidate.expires_at && new Date(candidate.expires_at) < new Date()) ||
    (assessment.expires_at && new Date(assessment.expires_at) < new Date())
  ) {
    await admin
      .from("assessment_candidates")
      .update({ status: "expired" })
      .eq("id", candidate.id);
    return NextResponse.json({ error: "This invite has expired" }, { status: 410 });
  }

  const email = (ctx.email ?? "").toLowerCase();
  if (email && email !== candidate.candidate_email.toLowerCase()) {
    return NextResponse.json(
      { error: `Sign in with ${candidate.candidate_email} to open this invite.` },
      { status: 403 }
    );
  }

  if (candidate.session_id) {
    return NextResponse.json({
      sessionId: candidate.session_id,
      mode: assessment.interview_mode,
      alreadyStarted: true,
      antiCheating: parseAntiCheatingSettings(assessment.anti_cheating_settings),
    });
  }

  if (candidate.status === "completed") {
    return NextResponse.json({ error: "Assessment already completed" }, { status: 400 });
  }

  const mode = (assessment.interview_mode || "voice") as InterviewMode;
  const input: CreateInterviewSessionInput = {
    interviewType: "technical",
    technologyIds: [...assessment.technology_ids],
    topicIds: assessment.topic_ids,
    experienceLevel: "mid",
    difficulty: "medium",
    durationMinutes: assessment.duration_minutes,
    mode,
    customInstructions: `Proctored assessment for: ${assessment.title}${
      assessment.job_role ? ` (${assessment.job_role})` : ""
    }. Enforce professional interview standards.`,
  };

  if (input.technologyIds.length === 0) {
    const { data: tech } = await admin.from("technologies").select("id").limit(1).maybeSingle();
    if (!tech) {
      return NextResponse.json(
        { error: "Assessment has no technologies configured" },
        { status: 400 }
      );
    }
    input.technologyIds = [tech.id];
  }

  const supabase = await createSupabaseServerClient();
  await markInviteOpened(admin, candidate.id, ctx.userId);
  const session = await createSession(supabase, ctx.userId, input);
  await linkSessionToInvite(admin, candidate.id, session.id);

  try {
    await startSession(supabase, session.id, ctx.userId);
  } catch {
    // Room can start on entry if still draft
  }

  return NextResponse.json({
    sessionId: session.id,
    mode: session.mode,
    alreadyStarted: false,
    antiCheating: parseAntiCheatingSettings(assessment.anti_cheating_settings),
  });
});
