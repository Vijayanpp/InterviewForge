import { describe, expect, it } from "vitest";
import { chunkText } from "@/lib/retrieval/chunking";
import { deduplicateDocuments } from "@/lib/retrieval/deduplication";
import { interviewRetrievalPipeline } from "@/lib/retrieval/pipeline";
import { rerankDocumentsMock } from "@/lib/retrieval/reranker";
import { MemoryDocumentStore } from "@/lib/retrieval/stores/memory";
import { mockEmbed } from "@/lib/retrieval/similarity";
import type { RetrievedDocument } from "@/lib/retrieval/types";

function doc(id: string, content: string): RetrievedDocument {
  return {
    id,
    sourceType: "topic_knowledge",
    sourceId: null,
    title: id,
    content,
    sourceQuery: "q",
  };
}

describe("chunking and dedup", () => {
  it("returns a single chunk for short text", () => {
    expect(chunkText("Hello world").length).toBe(1);
  });

  it("splits long text with overlap", () => {
    const text = "word ".repeat(400);
    const chunks = chunkText(text, 80, 20);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("drops duplicate documents", () => {
    const unique = deduplicateDocuments([
      doc("a", "Same content here"),
      doc("b", "Same content here"),
      doc("c", "Different content"),
    ]);
    expect(unique).toHaveLength(2);
  });
});

describe("retrieval pipeline", () => {
  it("expands, decomposes, multi-queries, and reranks from an in-memory store", async () => {
    const store = new MemoryDocumentStore([
      {
        ...doc("latency", "Reduce API latency with caching, connection pooling, and avoiding N+1 queries."),
        embedding: mockEmbed("api latency caching n+1"),
      },
      {
        ...doc("css", "CSS specificity and cascade rules for styling web pages."),
        embedding: mockEmbed("css cascade specificity"),
      },
    ]);

    const result = await interviewRetrievalPipeline(
      "How can I improve application performance and reduce API latency?",
      { stores: [store], useLlm: false, finalTopK: 2 }
    );

    expect(result.expandedQuery).toBeTruthy();
    expect(result.subQuestions.length).toBeGreaterThan(0);
    expect(result.questionResults[0]?.searchQueries.length).toBeGreaterThan(1);
    expect(result.documents.length).toBeGreaterThan(0);
    expect(result.documents[0]?.content.toLowerCase()).toMatch(/latency|caching|n\+1/);
  });

  it("reranks documents toward the question terms", () => {
    const ranked = rerankDocumentsMock("database indexes", [doc("a", "database indexes and query plans"), doc("b", "css flexbox")], 1);
    expect(ranked[0]?.id).toBe("a");
  });
});
