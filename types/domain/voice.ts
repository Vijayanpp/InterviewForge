import { z } from "zod";

/** One timed span of recognized speech (or silence gap between spans). */
export const transcriptSegmentSchema = z.object({
  startMs: z.number().int().min(0),
  endMs: z.number().int().min(0),
  text: z.string(),
  speaker: z.enum(["candidate", "ai"]).default("candidate"),
});

export type TranscriptSegment = z.infer<typeof transcriptSegmentSchema>;

/** Persisted on `candidate_answers.transcript` (jsonb). */
export const voiceTranscriptSchema = z.object({
  provider: z.enum(["mock", "openai"]),
  language: z.string().min(2).max(16).default("en"),
  finalText: z.string().min(1).max(8000),
  rawText: z.string().max(8000).optional(),
  segments: z.array(transcriptSegmentSchema).default([]),
  fillerWordCount: z.number().int().min(0).optional(),
  wpm: z.number().min(0).optional(),
  longPauses: z.number().int().min(0).optional(),
  durationSeconds: z.number().min(0).optional(),
});

export type VoiceTranscript = z.infer<typeof voiceTranscriptSchema>;

export const ttsRequestSchema = z.object({
  text: z.string().trim().min(1).max(4000),
});

export type TtsRequest = z.infer<typeof ttsRequestSchema>;
