import { NextResponse, type NextRequest } from "next/server";
import { withApiHandler } from "@/lib/api/handler";
import { requireRole } from "@/lib/auth/require-role";
import { AppError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { updateProfile } from "@/lib/repositories/profiles.repo";
import { AVATAR_MIME_TYPES, MAX_AVATAR_BYTES } from "@/types/domain/avatar";

const ALLOWED = new Set<string>(AVATAR_MIME_TYPES);

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

export const POST = withApiHandler(async (request: NextRequest) => {
  const ctx = await requireRole();
  checkRateLimit(`upload-avatar:${ctx.userId}`, { windowMs: 60_000, max: 10 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new AppError("BAD_REQUEST", "Missing image file. Expected multipart field `file`.");
  }

  const mimeType = file.type || "application/octet-stream";
  if (!ALLOWED.has(mimeType)) {
    throw new AppError("BAD_REQUEST", "Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }

  if (file.size <= 0 || file.size > MAX_AVATAR_BYTES) {
    throw new AppError("BAD_REQUEST", "Profile image must be between 1 byte and 2MB.");
  }

  const ext = extensionForMime(mimeType);
  const filePath = `${ctx.userId}/avatar.${ext}`;
  const supabase = await createSupabaseServerClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  // Clear any previous avatar files for this user (different extensions).
  const { data: existing } = await supabase.storage.from("avatars").list(ctx.userId);
  if (existing?.length) {
    await supabase.storage
      .from("avatars")
      .remove(existing.map((obj) => `${ctx.userId}/${obj.name}`));
  }

  const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, buffer, {
    contentType: mimeType,
    upsert: true,
  });

  if (uploadError) {
    throw new AppError("INTERNAL_ERROR", `Could not upload avatar: ${uploadError.message}`);
  }

  const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

  const profile = await updateProfile(supabase, ctx.userId, { avatar_url: avatarUrl });

  return NextResponse.json({ avatarUrl: profile.avatar_url, profile });
});

export const DELETE = withApiHandler(async () => {
  const ctx = await requireRole();
  checkRateLimit(`delete-avatar:${ctx.userId}`, { windowMs: 60_000, max: 10 });

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase.storage.from("avatars").list(ctx.userId);
  if (existing?.length) {
    await supabase.storage
      .from("avatars")
      .remove(existing.map((obj) => `${ctx.userId}/${obj.name}`));
  }

  const profile = await updateProfile(supabase, ctx.userId, { avatar_url: null });
  return NextResponse.json({ avatarUrl: null, profile });
});
