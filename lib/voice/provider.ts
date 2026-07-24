import type { VoiceTranscript } from "@/types/domain/voice";

export interface TranscribeParams {
  audio: Buffer;
  mimeType: string;
  language?: string;
  /** Approximate recording length for analytics (client-reported). */
  durationSeconds?: number;
}

export interface SynthesizeParams {
  text: string;
  voice?: string;
}

export interface SynthesizeResult {
  audio: Buffer;
  mimeType: string;
}

/**
 * Swappable STT/TTS backend. Kept separate from `AiProvider` so LLM evaluation
 * stays text-only (mirrors the code-execution vs AI split).
 */
export interface VoiceProvider {
  readonly name: "mock" | "openai";
  transcribe(params: TranscribeParams): Promise<VoiceTranscript>;
  synthesize(params: SynthesizeParams): Promise<SynthesizeResult>;
}
