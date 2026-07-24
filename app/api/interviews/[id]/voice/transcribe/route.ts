import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { AppError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { getServerEnv } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSessionById } from "@/lib/repositories/interview-sessions.repo";
import { getVoiceProvider } from "@/lib/voice";

const ALLOWED_MIME = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/ogg",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
]);

function normalizeMime(raw: string): string {
  return raw.split(";")[0]!.trim().toLowerCase();
}

export const POST = withApiHandler<{ id: string }>(async (request: NextRequest, { params }) => {
  const ctx = await requireRole();
  checkRateLimit(`voice-transcribe:${ctx.userId}`, { windowMs: 60_000, max: 12 });

  const env = getServerEnv();
  const supabase = await createSupabaseServerClient();
  const session = await getSessionById(supabase, params.id);
  if (!session) throw new NotFoundError("Interview session not found.");
  if (session.candidate_id !== ctx.userId) {
    throw new ForbiddenError("You do not own this interview session.");
  }
  if (session.mode !== "voice") {
    throw new AppError("BAD_REQUEST", "This session is not a voice interview.");
  }

  const form = await request.formData();
  const file = form.get("audio");
  if (!(file instanceof File)) {
    throw new AppError("BAD_REQUEST", "Missing audio file. Expected multipart field `audio`.");
  }

  const mimeType = file.type || "audio/webm";
  if (!ALLOWED_MIME.has(mimeType) && !ALLOWED_MIME.has(normalizeMime(mimeType))) {
    throw new AppError("BAD_REQUEST", `Unsupported audio type: ${mimeType}`);
  }

  if (file.size <= 0) {
    throw new AppError("BAD_REQUEST", "Audio file is empty.");
  }
  if (file.size > env.VOICE_MAX_UPLOAD_BYTES) {
    throw new AppError(
      "BAD_REQUEST",
      `Audio exceeds the ${Math.round(env.VOICE_MAX_UPLOAD_BYTES / (1024 * 1024))}MB upload limit.`
    );
  }

  const durationRaw = form.get("durationSeconds");
  const durationSeconds =
    typeof durationRaw === "string" && durationRaw.trim()
      ? Number.parseFloat(durationRaw)
      : undefined;

  if (durationSeconds != null && Number.isFinite(durationSeconds)) {
    if (durationSeconds > env.VOICE_MAX_ANSWER_SECONDS) {
      throw new AppError(
        "BAD_REQUEST",
        `Answer exceeds the ${env.VOICE_MAX_ANSWER_SECONDS}s recording limit.`
      );
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const provider = getVoiceProvider();
  const transcript = await provider.transcribe({
    audio: buffer,
    mimeType: normalizeMime(mimeType),
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : undefined,
  });

  return NextResponse.json({ transcript });
});
