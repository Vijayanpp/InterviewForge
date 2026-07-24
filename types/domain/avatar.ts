import { z } from "zod";

export const AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export const avatarUploadResultSchema = z.object({
  avatarUrl: z.string().url(),
});

export type AvatarUploadResult = z.infer<typeof avatarUploadResultSchema>;
