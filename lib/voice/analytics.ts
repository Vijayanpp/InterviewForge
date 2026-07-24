import type { VoiceTranscript } from "@/types/domain/voice";

const FILLER_WORDS = new Set([
  "um",
  "uh",
  "uhm",
  "er",
  "ah",
  "like",
  "youknow",
  "basically",
  "literally",
  "kinda",
  "sorta",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function countFillerWords(text: string): number {
  return tokenize(text).filter((w) => FILLER_WORDS.has(w.replace(/'/g, ""))).length;
}

/** Words per minute from final text + duration. Undefined if duration is too short. */
export function estimateWpm(text: string, durationSeconds?: number): number | undefined {
  if (!durationSeconds || durationSeconds < 3) return undefined;
  const words = tokenize(text).length;
  return Math.round((words / durationSeconds) * 60);
}

/** Count gaps between consecutive segments longer than `thresholdMs`. */
export function countLongPauses(
  segments: Array<{ startMs: number; endMs: number }>,
  thresholdMs = 1500
): number {
  if (segments.length < 2) return 0;
  let pauses = 0;
  for (let i = 1; i < segments.length; i++) {
    const gap = segments[i]!.startMs - segments[i - 1]!.endMs;
    if (gap >= thresholdMs) pauses += 1;
  }
  return pauses;
}

/** Attach filler / WPM / pause analytics onto a transcript (returns a copy). */
export function enrichTranscriptAnalytics(transcript: VoiceTranscript): VoiceTranscript {
  const duration =
    transcript.durationSeconds ??
    (transcript.segments.length > 0
      ? Math.max(...transcript.segments.map((s) => s.endMs)) / 1000
      : undefined);

  return {
    ...transcript,
    fillerWordCount: countFillerWords(transcript.finalText),
    wpm: estimateWpm(transcript.finalText, duration),
    longPauses: countLongPauses(transcript.segments),
    durationSeconds: duration,
  };
}

/**
 * Short communication summary for report context. Content-focused only —
 * never references accent, demographics, or appearance.
 */
export function formatCommunicationNotes(transcript: VoiceTranscript): string {
  const parts: string[] = [];
  if (transcript.fillerWordCount != null) {
    parts.push(`filler_words=${transcript.fillerWordCount}`);
  }
  if (transcript.wpm != null) {
    parts.push(`approx_wpm=${transcript.wpm}`);
  }
  if (transcript.longPauses != null) {
    parts.push(`long_pauses=${transcript.longPauses}`);
  }
  if (parts.length === 0) return "";
  return `Voice delivery signals (job-relevant pace/clarity only; ignore accent/demographics): ${parts.join(", ")}.`;
}
