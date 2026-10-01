import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { DocumentStore, RetrievedDocument } from "@/lib/retrieval/types";

/** Lexical fallback over approved bank questions (`pg_trgm` / ilike). */
export class QuestionBankStore implements DocumentStore {
  async search(input: { query: string; topK: number }): Promise<RetrievedDocument[]> {
    try {
      const admin = createSupabaseAdminClient();
      const needle = input.query.slice(0, 80);
      const { data, error } = await admin
        .from("interview_questions")
        .select("id, title, body, expected_concepts")
        .is("session_id", null)
        .is("deleted_at", null)
        .eq("status", "approved")
        .ilike("body", `%${needle.split(/\s+/).slice(0, 4).join("%")}%`)
        .limit(input.topK);

      if (error || !data) return [];

      return data.map((row) => ({
        id: `bank-${row.id}`,
        sourceType: "question_bank" as const,
        sourceId: row.id,
        title: row.title ?? "Question bank",
        content: row.body,
        sourceQuery: input.query,
        metadata: { expectedConcepts: row.expected_concepts },
      }));
    } catch {
      return [];
    }
  }
}
