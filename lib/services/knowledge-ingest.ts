import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { chunkText } from "@/lib/retrieval/chunking";
import { embedText } from "@/lib/retrieval/embeddings";
import { replaceKnowledgeChunks } from "@/lib/repositories/knowledge-chunks.repo";
import type { KnowledgeSourceType } from "@/lib/retrieval/types";
import { logger } from "@/lib/logger";

type Client = SupabaseClient<Database>;

export async function ingestKnowledgeText(
  supabase: Client,
  input: {
    sourceType: KnowledgeSourceType;
    sourceId: string;
    text: string;
    candidateId?: string | null;
    title?: string | null;
  }
): Promise<void> {
  const chunks = chunkText(input.text);
  if (chunks.length === 0) return;

  try {
    const embedded = await Promise.all(
      chunks.map(async (chunk) => ({
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        candidateId: input.candidateId ?? null,
        content: chunk.content,
        metadata: { title: input.title ?? input.sourceType, index: chunk.index },
        embedding: await embedText(chunk.content),
      }))
    );
    await replaceKnowledgeChunks(supabase, input.sourceType, input.sourceId, embedded);
  } catch (error) {
    logger.warn(
      { err: error instanceof Error ? error.message : String(error), sourceId: input.sourceId },
      "Knowledge ingest skipped"
    );
  }
}
