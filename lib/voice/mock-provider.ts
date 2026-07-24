import type { VoiceTranscript } from "@/types/domain/voice";
import { enrichTranscriptAnalytics } from "@/lib/voice/analytics";
import type {
  SynthesizeParams,
  SynthesizeResult,
  TranscribeParams,
  VoiceProvider,
} from "@/lib/voice/provider";

/** Minimal valid WAV (silence) — enough for browsers/tests to play without error. */
function silentWav(durationMs = 400): Buffer {
  const sampleRate = 8000;
  const numSamples = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  return buffer;
}

const MOCK_TRANSCRIPTS = [
  "I would start by profiling with the React DevTools Profiler to find expensive renders, then memoize hot paths with useMemo and React.memo, and measure Core Web Vitals before and after.",
  "In my last role I reduced main-thread work by code-splitting routes, deferring non-critical effects, and caching API responses. We tracked LCP and INP as primary metrics.",
  "I focus on avoiding unnecessary re-renders, virtualizing long lists, and keeping state close to where it is consumed so updates stay local.",
];

/**
 * Deterministic STT/TTS for local/CI. Transcript text is picked from a fixed
 * pool based on audio byte length so tests stay stable.
 */
export class MockVoiceProvider implements VoiceProvider {
  readonly name = "mock" as const;

  async transcribe(params: TranscribeParams): Promise<VoiceTranscript> {
    const idx = params.audio.byteLength % MOCK_TRANSCRIPTS.length;
    const text = MOCK_TRANSCRIPTS[idx]!;
    const durationSeconds = params.durationSeconds ?? Math.max(8, Math.round(params.audio.byteLength / 1600));
    const base: VoiceTranscript = {
      provider: "mock",
      language: params.language ?? "en",
      finalText: text,
      rawText: text,
      segments: [
        {
          startMs: 0,
          endMs: Math.round(durationSeconds * 1000),
          text,
          speaker: "candidate",
        },
      ],
      durationSeconds,
    };
    return enrichTranscriptAnalytics(base);
  }

  async synthesize(_params: SynthesizeParams): Promise<SynthesizeResult> {
    return {
      audio: silentWav(500),
      mimeType: "audio/wav",
    };
  }
}
