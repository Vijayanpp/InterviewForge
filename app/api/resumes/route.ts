import { NextResponse, type NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { AppError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { createResume } from "@/lib/repositories/documents.repo";
import {
  MAX_RESUME_BYTES,
  RESUME_MIME_TYPES,
  resumeUploadMetaSchema,
} from "@/types/domain/documents";

const ALLOWED = new Set<string>(RESUME_MIME_TYPES);

export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireRole();
  checkRateLimit(`upload-resume:${ctx.userId}`, { windowMs: 60_000, max: 10 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new AppError("BAD_REQUEST", "Missing resume file. Expected multipart field `file`.");
  }

  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED.has(mimeType)) {
    throw new AppError(
      "BAD_REQUEST",
      "Unsupported file type. Upload a PDF, DOC, DOCX, or TXT resume."
    );
  }

  if (file.size <= 0 || file.size > MAX_RESUME_BYTES) {
    throw new AppError("BAD_REQUEST", "Resume must be between 1 byte and 10MB.");
  }

  const metaRaw = form.get("parsedText");
  const meta = resumeUploadMetaSchema.parse({
    parsedText: typeof metaRaw === "string" ? metaRaw : undefined,
  });

  let parsedText = meta.parsedText?.trim() || null;
  if (mimeType === "text/plain" && !parsedText) {
    parsedText = (await file.text()).slice(0, 50_000).trim() || null;
  }

  if (!parsedText || parsedText.length < 40) {
    throw new AppError(
      "BAD_REQUEST",
      "Provide resume text for the AI (paste the content, or upload a .txt file with enough detail)."
    );
  }

  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_").slice(0, 180) || "resume";
  const filePath = `${ctx.userId}/${Date.now()}-${nanoid(8)}-${safeName}`;

  const supabase = await createSupabaseServerClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage.from("resumes").upload(filePath, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (uploadError) {
    throw new AppError("INTERNAL_ERROR", `Could not upload resume: ${uploadError.message}`);
  }

  const resume = await createResume(supabase, {
    candidateId: ctx.userId,
    filePath,
    fileName: safeName,
    mimeType,
    sizeBytes: file.size,
    parsedText,
    isPrimary: true,
  });

  void import("@/lib/services/knowledge-ingest").then(({ ingestKnowledgeText }) =>
    ingestKnowledgeText(supabase, {
      sourceType: "resume",
      sourceId: resume.id,
      text: parsedText,
      candidateId: ctx.userId,
      title: safeName,
    })
  );

  return NextResponse.json({ resume }, { status: 201 });
});
