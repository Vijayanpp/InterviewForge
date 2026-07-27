import { z } from "zod";
import type { Tables } from "@/types/domain/db-helpers";
import { interviewModeSchema } from "@/types/domain/enums";

export type RecruiterOrganization = Tables<"recruiter_organizations">;
export type RecruiterMember = Tables<"recruiter_members">;
export type Assessment = Tables<"assessments">;
export type AssessmentCandidate = Tables<"assessment_candidates">;

/** Heavy proctoring defaults for published assessments. */
export const antiCheatingSettingsSchema = z.object({
  requireWebcam: z.boolean().default(true),
  requireScreenShare: z.boolean().default(true),
  requireFullscreen: z.boolean().default(true),
  blockClipboard: z.boolean().default(true),
  detectTabBlur: z.boolean().default(true),
  detectMultiFace: z.boolean().default(true),
  detectNoFace: z.boolean().default(true),
  maxViolationsBeforeFlag: z.number().int().min(1).max(50).default(5),
  recordWebcam: z.boolean().default(true),
  recordScreen: z.boolean().default(true),
});

export type AntiCheatingSettings = z.infer<typeof antiCheatingSettingsSchema>;

export const DEFAULT_ANTI_CHEATING: AntiCheatingSettings = antiCheatingSettingsSchema.parse({});

export function parseAntiCheatingSettings(raw: unknown): AntiCheatingSettings {
  const parsed = antiCheatingSettingsSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : DEFAULT_ANTI_CHEATING;
}

export const createAssessmentSchema = z.object({
  title: z.string().trim().min(2).max(200),
  jobRole: z.string().trim().max(200).optional(),
  technologyIds: z.array(z.string().uuid()).default([]),
  topicIds: z.array(z.string().uuid()).default([]),
  durationMinutes: z.number().int().min(5).max(240).default(45),
  interviewMode: interviewModeSchema.default("voice"),
  expiresAt: z.string().datetime().optional().nullable(),
  candidateLimit: z.number().int().positive().optional().nullable(),
  passingScore: z.number().min(0).max(100).optional().nullable(),
  antiCheatingSettings: antiCheatingSettingsSchema.optional(),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;

export const inviteCandidatesSchema = z.object({
  emails: z
    .array(z.string().trim().email())
    .min(1, "Add at least one email")
    .max(50),
  expiresInDays: z.number().int().min(1).max(90).default(7),
});

export type InviteCandidatesInput = z.infer<typeof inviteCandidatesSchema>;

export const bootstrapRecruiterSchema = z.object({
  organizationName: z.string().trim().min(2).max(120),
});

export type BootstrapRecruiterInput = z.infer<typeof bootstrapRecruiterSchema>;

export const PROCTOR_EVENT_TYPES = [
  "session_start",
  "session_end",
  "webcam_granted",
  "screen_granted",
  "fullscreen_enter",
  "fullscreen_exit",
  "tab_blur",
  "tab_focus",
  "clipboard_blocked",
  "no_face",
  "multi_face",
  "face_ok",
  "recording_chunk",
  "integrity_flagged",
] as const;

export const proctorEventSchema = z.object({
  sessionId: z.string().uuid(),
  eventType: z.enum(PROCTOR_EVENT_TYPES),
  severity: z.enum(["info", "warning", "critical"]).default("info"),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type ProctorEventInput = z.infer<typeof proctorEventSchema>;

export const proctorRecordingMetaSchema = z.object({
  sessionId: z.string().uuid(),
  kind: z.enum(["webcam", "screen"]),
  chunkIndex: z.number().int().min(0),
  mimeType: z.string().optional(),
  byteSize: z.number().int().nonnegative().optional(),
});

export type ProctorRecordingMetaInput = z.infer<typeof proctorRecordingMetaSchema>;
