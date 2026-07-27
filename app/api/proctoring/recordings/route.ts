import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { proctorRecordingMetaSchema } from "@/types/domain/assessment";
import { insertRecordingMeta } from "@/lib/proctoring/integrity";

export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireRole();
  checkRateLimit(`proctor-rec:${ctx.userId}`, { windowMs: 60_000, max: 60 });

  const form = await request.formData();
  const metaRaw = form.get("meta");
  const file = form.get("file");

  if (typeof metaRaw !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "meta and file required" }, { status: 400 });
  }

  const meta = proctorRecordingMetaSchema.parse(JSON.parse(metaRaw));
  const supabase = await createSupabaseServerClient();

  const { data: session } = await supabase
    .from("interview_sessions")
    .select("id, candidate_id")
    .eq("id", meta.sessionId)
    .single();

  if (!session || session.candidate_id !== ctx.userId) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const ext = file.type.includes("mp4") ? "mp4" : "webm";
  const storagePath = `${meta.sessionId}/${meta.kind}/${meta.chunkIndex}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("proctoring")
    .upload(storagePath, buffer, {
      contentType: file.type || "video/webm",
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: ac } = await supabase
    .from("assessment_candidates")
    .select("id")
    .eq("session_id", meta.sessionId)
    .maybeSingle();

  const row = await insertRecordingMeta(
    supabase,
    {
      ...meta,
      storagePath,
      mimeType: file.type || "video/webm",
      byteSize: buffer.byteLength,
    },
    ac?.id ?? null
  );

  return NextResponse.json({ recording: row }, { status: 201 });
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
    .select("id, assessments(organization_id)")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!ac) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const { data: recordings } = await admin
    .from("proctoring_recordings")
    .select("*")
    .eq("session_id", sessionId)
    .order("kind")
    .order("chunk_index");

  const withUrls = await Promise.all(
    (recordings ?? []).map(async (r) => {
      const { data: signed } = await admin.storage
        .from("proctoring")
        .createSignedUrl(r.storage_path, 3600);
      return { ...r, url: signed?.signedUrl ?? null };
    })
  );

  return NextResponse.json({ recordings: withUrls });
});
