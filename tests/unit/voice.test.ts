import { describe, expect, it } from "vitest";
import {
  countFillerWords,
  countLongPauses,
  enrichTranscriptAnalytics,
  estimateWpm,
} from "@/lib/voice/analytics";
import { MockVoiceProvider } from "@/lib/voice/mock-provider";
import { voiceTranscriptSchema } from "@/types/domain/voice";

describe("voice analytics", () => {
  it("counts common filler words", () => {
    expect(countFillerWords("Um, I would like, uh, start with profiling")).toBeGreaterThanOrEqual(2);
  });

  it("estimates WPM from duration", () => {
    const text = "one two three four five six seven eight nine ten";
    expect(estimateWpm(text, 10)).toBe(60);
    expect(estimateWpm(text, 1)).toBeUndefined();
  });

  it("counts long pauses between segments", () => {
    expect(
      countLongPauses([
        { startMs: 0, endMs: 1000 },
        { startMs: 3000, endMs: 4000 },
      ])
    ).toBe(1);
  });

  it("enriches a transcript with analytics fields", () => {
    const enriched = enrichTranscriptAnalytics({
      provider: "mock",
      language: "en",
      finalText: "Um I measured LCP and INP after memoizing hot paths",
      segments: [{ startMs: 0, endMs: 12_000, text: "…", speaker: "candidate" }],
      durationSeconds: 12,
    });
    expect(enriched.fillerWordCount).toBeGreaterThanOrEqual(1);
    expect(enriched.wpm).toBeGreaterThan(0);
    expect(voiceTranscriptSchema.parse(enriched).finalText.length).toBeGreaterThan(0);
  });
});

describe("MockVoiceProvider", () => {
  const provider = new MockVoiceProvider();

  it("returns a schema-valid transcript deterministically for the same audio size", async () => {
    const audio = Buffer.alloc(1200);
    const a = await provider.transcribe({ audio, mimeType: "audio/webm", durationSeconds: 15 });
    const b = await provider.transcribe({ audio, mimeType: "audio/webm", durationSeconds: 15 });
    expect(a.finalText).toBe(b.finalText);
    expect(a.provider).toBe("mock");
    expect(voiceTranscriptSchema.parse(a).segments.length).toBeGreaterThan(0);
  });

  it("synthesizes a playable WAV buffer", async () => {
    const result = await provider.synthesize({ text: "Hello candidate" });
    expect(result.mimeType).toBe("audio/wav");
    expect(result.audio.byteLength).toBeGreaterThan(40);
    expect(result.audio.toString("utf8", 0, 4)).toBe("RIFF");
  });
});
