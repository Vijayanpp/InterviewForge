import { z } from "zod";
import type { Tables } from "@/types/domain/db-helpers";

export type Resume = Tables<"resumes">;
export type JobDescription = Tables<"job_descriptions">;

export const RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export const MAX_RESUME_BYTES = 10_485_760;
export const MAX_JD_CONTENT = 20_000;
export const MAX_RESUME_PARSED_TEXT = 50_000;

export const createJobDescriptionSchema = z.object({
  content: z
    .string()
    .trim()
    .min(40, "Paste a fuller job description (at least ~40 characters).")
    .max(MAX_JD_CONTENT),
  title: z.string().trim().max(200).optional(),
  company: z.string().trim().max(120).optional(),
});

export type CreateJobDescriptionInput = z.infer<typeof createJobDescriptionSchema>;

/** Client may send parsedText for PDF/DOCX; plain-text files are extracted server-side. */
export const resumeUploadMetaSchema = z.object({
  parsedText: z.string().trim().max(MAX_RESUME_PARSED_TEXT).optional(),
});
