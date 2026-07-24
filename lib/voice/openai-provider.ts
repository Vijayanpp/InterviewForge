import "server-only";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

import { getServerEnv } from "@/lib/env";
import { AiProviderError } from "@/lib/errors";
import { enrichTranscriptAnalytics } from "@/lib/voice/analytics";
import type {
  SynthesizeParams,
  SynthesizeResult,
  TranscribeParams,
  VoiceProvider,
} from "@/lib/voice/provider";
import type { VoiceTranscript } from "@/types/domain/voice";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  const env = getServerEnv();
  if (!env.OPENAI_API_KEY) {
    throw new AiProviderError("OPENAI_API_KEY is not configured for voice.");
  }
  client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}

function extensionForMime(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("m4a")) return "mp4";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

export class OpenAiVoiceProvider implements VoiceProvider {
  readonly name = "openai" as const;

  async transcribe(params: TranscribeParams): Promise<VoiceTranscript> {
    const env = getServerEnv();
    const openai = getClient();
    const ext = extensionForMime(params.mimeType);
    const file = await toFile(params.audio, `answer.${ext}`, { type: params.mimeType });

    try {
      const result = await openai.audio.transcriptions.create({
        file,
        model: env.VOICE_STT_MODEL,
        language: params.language?.slice(0, 2) || undefined,
        response_format: "verbose_json",
      });

      const text = (result.text ?? "").trim();
      if (!text) {
        throw new AiProviderError("Speech recognition returned an empty transcript. Please try again.");
      }

      const segments =
        "segments" in result && Array.isArray(result.segments)
          ? result.segments.map((s) => ({
              startMs: Math.round((s.start ?? 0) * 1000),
              endMs: Math.round((s.end ?? 0) * 1000),
              text: s.text ?? "",
              speaker: "candidate" as const,
            }))
          : [
              {
                startMs: 0,
                endMs: Math.round((params.durationSeconds ?? 0) * 1000),
                text,
                speaker: "candidate" as const,
              },
            ];

      const base: VoiceTranscript = {
        provider: "openai",
        language: params.language ?? "en",
        finalText: text.slice(0, 8000),
        rawText: text.slice(0, 8000),
        segments,
        durationSeconds: params.durationSeconds,
      };
      return enrichTranscriptAnalytics(base);
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      throw new AiProviderError(
        error instanceof Error ? error.message : "Speech recognition failed.",
        error
      );
    }
  }

  async synthesize(params: SynthesizeParams): Promise<SynthesizeResult> {
    const env = getServerEnv();
    const openai = getClient();
    const voice = (params.voice ?? env.VOICE_TTS_VOICE) as
      | "alloy"
      | "ash"
      | "ballad"
      | "coral"
      | "echo"
      | "fable"
      | "onyx"
      | "nova"
      | "sage"
      | "shimmer"
      | "verse";

    try {
      const response = await openai.audio.speech.create({
        model: env.VOICE_TTS_MODEL,
        voice,
        input: params.text.slice(0, 4000),
        response_format: "mp3",
      });
      const arrayBuffer = await response.arrayBuffer();
      return {
        audio: Buffer.from(arrayBuffer),
        mimeType: "audio/mpeg",
      };
    } catch (error) {
      throw new AiProviderError(
        error instanceof Error ? error.message : "Text-to-speech failed.",
        error
      );
    }
  }
}
