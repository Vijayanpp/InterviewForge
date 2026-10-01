import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import type { KnowledgeSourceType } from "@/lib/retrieval/types";
import { logger } from "@/lib/logger";

type Client = SupabaseClient<Database>;

export interface KnowledgeChunkInsert {
  sourceType: KnowledgeSourceType;
  sourceId?: string | null;
  candidateId?: string | null;
  sessionId?: string | null;
  content: string;
  metadata?: Record<string, unknown>;
  embedding: number[];
}

export async function replaceKnowledgeChunks(
  supabase: Client,
  sourceType: KnowledgeSourceType,
  sourceId: string,
  chunks: KnowledgeChunkInsert[]
): Promise<void> {
  try {
    await supabase.from("knowledge_chunks").delete().eq("source_type", sourceType).eq("source_id", sourceId);
    if (chunks.length === 0) return;
    const { error } = await supabase.from("knowledge_chunks").insert(
      chunks.map((chunk) => ({
        source_type: chunk.sourceType,
        source_id: chunk.sourceId ?? sourceId,
        candidate_id: chunk.candidateId ?? null,
        session_id: chunk.sessionId ?? null,
        content: chunk.content,
        metadata: (chunk.metadata ?? {}) as Json,
        embedding: chunk.embedding as unknown as string,
      }))
    );
    if (error) {
      logger.warn({ err: error.message, sourceType, sourceId }, "Failed to insert knowledge chunks");
    }
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : String(error), sourceType, sourceId },
      "Failed to replace knowledge chunks"
    );
  }
}
