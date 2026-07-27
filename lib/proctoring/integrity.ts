import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { ProctorEventInput, ProctorRecordingMetaInput } from "@/types/domain/assessment";

type Client = SupabaseClient<Database>;

const CRITICAL = new Set(["multi_face", "fullscreen_exit", "no_face"]);
const WARNING = new Set(["tab_blur", "clipboard_blocked"]);

export function severityForEvent(eventType: string): "info" | "warning" | "critical" {
  if (CRITICAL.has(eventType)) return "critical";
  if (WARNING.has(eventType)) return "warning";
  return "info";
}

/** Simple integrity score: start at 100, deduct by severity. */
export function computeIntegrityScore(events: { event_type: string; severity: string }[]): {
  score: number;
  flagged: boolean;
  summary: { critical: number; warning: number; total: number };
} {
  let score = 100;
  let critical = 0;
  let warning = 0;

  for (const e of events) {
    if (e.severity === "critical" || CRITICAL.has(e.event_type)) {
      critical += 1;
      score -= 12;
    } else if (e.severity === "warning" || WARNING.has(e.event_type)) {
      warning += 1;
      score -= 4;
    }
  }

  score = Math.max(0, Math.min(100, score));
  return {
    score,
    flagged: critical >= 3 || score < 70,
    summary: { critical, warning, total: events.length },
  };
}

export async function insertProctorEvent(
  supabase: Client,
  input: ProctorEventInput,
  assessmentCandidateId?: string | null
) {
  const severity = input.severity === "info" ? severityForEvent(input.eventType) : input.severity;

  const { data, error } = await supabase
    .from("proctoring_events")
    .insert({
      session_id: input.sessionId,
      assessment_candidate_id: assessmentCandidateId ?? null,
      event_type: input.eventType,
      severity,
      payload: (input.payload ?? {}) as Json,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to insert proctoring event");
  return data;
}

export async function listProctorEvents(supabase: Client, sessionId: string) {
  const { data, error } = await supabase
    .from("proctoring_events")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function insertRecordingMeta(
  supabase: Client,
  input: ProctorRecordingMetaInput & { storagePath: string },
  assessmentCandidateId?: string | null
) {
  const { data, error } = await supabase
    .from("proctoring_recordings")
    .insert({
      session_id: input.sessionId,
      assessment_candidate_id: assessmentCandidateId ?? null,
      kind: input.kind,
      storage_path: input.storagePath,
      chunk_index: input.chunkIndex,
      mime_type: input.mimeType ?? null,
      byte_size: input.byteSize ?? null,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to insert recording meta");
  return data;
}

export async function listRecordings(supabase: Client, sessionId: string) {
  const { data, error } = await supabase
    .from("proctoring_recordings")
    .select("*")
    .eq("session_id", sessionId)
    .order("kind")
    .order("chunk_index");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function refreshIntegrityForSession(
  supabase: Client,
  sessionId: string,
  maxViolationsBeforeFlag: number
) {
  const events = await listProctorEvents(supabase, sessionId);
  const result = computeIntegrityScore(events);

  const criticalish = events.filter(
    (e) => e.severity === "critical" || CRITICAL.has(e.event_type)
  ).length;

  const flagged = result.flagged || criticalish >= maxViolationsBeforeFlag;

  const { data: ac } = await supabase
    .from("assessment_candidates")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (ac) {
    await supabase
      .from("assessment_candidates")
      .update({
        integrity_score: result.score,
        integrity_flagged: flagged,
        integrity_summary: result.summary as unknown as Json,
      })
      .eq("id", ac.id);
  }

  return { ...result, flagged };
}
