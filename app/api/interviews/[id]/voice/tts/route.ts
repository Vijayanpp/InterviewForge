import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { AppError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { getSessionById } from "@/lib/repositories/interview-sessions.repo";
import { getVoiceProvider } from "@/lib/voice";
import { ttsRequestSchema } from "@/types/domain/voice";

export const POST = withApiHandler<{ id: string }>(async (request: NextRequest, { params }) => {
  const ctx = await requireRole();
  checkRateLimit(`voice-tts:${ctx.userId}`, { windowMs: 60_000, max: 40 });

  const supabase = await createSupabaseServerClient();
  const session = await getSessionById(supabase, params.id);
  if (!session) throw new NotFoundError("Interview session not found.");
  if (session.candidate_id !== ctx.userId) {
    throw new ForbiddenError("You do not own this interview session.");
  }
  if (session.mode !== "voice") {
    throw new AppError("BAD_REQUEST", "This session is not a voice interview.");
  }

  const body = ttsRequestSchema.parse(await request.json());
  const provider = getVoiceProvider();
  const result = await provider.synthesize({ text: body.text });

  return new NextResponse(new Uint8Array(result.audio), {
    status: 200,
    headers: {
      "Content-Type": result.mimeType,
      "Cache-Control": "no-store",
    },
  });
});
