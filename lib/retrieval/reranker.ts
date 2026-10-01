import { rerankingResultSchema } from "@/lib/agents/schemas/query";
import type { RetrievedDocument } from "@/lib/retrieval/types";

export function rerankDocumentsMock(
  question: string,
  documents: RetrievedDocument[],
  topK: number
): RetrievedDocument[] {
  const terms = question.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2);
  return [...documents]
    .map((document) => {
      const haystack = `${document.title} ${document.content}`.toLowerCase();
      const lexical = terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
      const combined = (document.score ?? 0) * 0.6 + (terms.length ? lexical / terms.length : 0) * 0.4;
      return { ...document, score: combined };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, topK);
}

export async function rerankDocuments(
  researchQuestion: string,
  documents: RetrievedDocument[],
  topK = 8
): Promise<RetrievedDocument[]> {
  if (documents.length === 0) return [];
  const limitedTopK = Math.min(topK, documents.length);

  try {
    const { invokeStructured } = await import("@/lib/agents/structured");
    const { isMockAgentRuntime } = await import("@/lib/agents/model");
    if (isMockAgentRuntime()) {
      return rerankDocumentsMock(researchQuestion, documents, limitedTopK);
    }

    const context = documents
      .slice(0, 16)
      .map(
        (document, index) =>
          `DOCUMENT ID: ${document.id}\nTITLE: ${document.title}\nCONTENT: ${document.content.slice(0, 1200)}\nINDEX: ${index + 1}`
      )
      .join("\n\n");

    const result = await invokeStructured(
      rerankingResultSchema,
      "reranking_result",
      `Rerank these documents for the interview research question.\n\nQUESTION:\n${researchQuestion}\n\nDOCUMENTS:\n${context}\n\nReturn ids with scores 0-1. Only use provided ids.`,
      () => ({
        rankings: documents.slice(0, limitedTopK).map((document, index) => ({
          id: document.id,
          score: Math.max(0, 1 - index * 0.08),
          reason: "Mock fallback ranking",
        })),
      })
    );

    const byId = new Map(documents.map((document) => [document.id, document]));
    const ranked: RetrievedDocument[] = [];
    for (const item of result.rankings) {
      const document = byId.get(item.id);
      if (document) ranked.push({ ...document, score: item.score });
    }

    return (ranked.length > 0 ? ranked : rerankDocumentsMock(researchQuestion, documents, limitedTopK)).slice(
      0,
      limitedTopK
    );
  } catch {
    return rerankDocumentsMock(researchQuestion, documents, limitedTopK);
  }
}
