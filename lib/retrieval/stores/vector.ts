import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { DocumentStore, RetrievedDocument, RetrievalFilters } from "@/lib/retrieval/types";
import { getFallbackDocumentStore } from "@/lib/retrieval/stores/memory";

interface MatchRow {
  id: string;
  source_type: RetrievedDocument["sourceType"];
  source_id: string | null;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

export class VectorDocumentStore implements DocumentStore {
  async search(input: {
    query: string;
    embedding?: number[];
    topK: number;
    filters?: RetrievalFilters;
  }): Promise<RetrievedDocument[]> {
    if (!input.embedding || input.embedding.length === 0) {
      return getFallbackDocumentStore().search(input);
    }

    try {
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin.rpc("match_knowledge_chunks", {
        query_embedding: input.embedding,
        match_count: input.topK,
        filter_candidate: input.filters?.candidateId ?? null,
        filter_source: input.filters?.sourceTypes?.[0] ?? null,
      });

      if (error || !data) {
        return getFallbackDocumentStore().search(input);
      }

      return (data as MatchRow[]).map((row) => ({
        id: row.id,
        sourceType: row.source_type,
        sourceId: row.source_id,
        title: typeof row.metadata?.title === "string" ? row.metadata.title : row.source_type,
        content: row.content,
        sourceQuery: input.query,
        score: row.similarity,
        metadata: row.metadata ?? undefined,
      }));
    } catch {
      return getFallbackDocumentStore().search(input);
    }
  }
}
