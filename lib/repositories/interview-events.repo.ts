import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { logger } from "@/lib/logger";

type Client = SupabaseClient<Database>;

export type InterviewEventStage = "planning" | "retrieving" | "evaluating" | "supervising";

export async function recordInterviewEvent(
  supabase: Client,
  sessionId: string,
  stage: InterviewEventStage,
  payload: Record<string, unknown> = {}
): Promise<void> {
  try {
    const { error } = await supabase.from("interview_events").insert({
      session_id: sessionId,
      stage,
      payload: payload as Json,
    });
    if (error) {
      logger.warn({ err: error.message, sessionId, stage }, "Could not persist interview event");
    }
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : String(error), sessionId, stage },
      "Could not persist interview event"
    );
  }
}
