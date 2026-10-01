import { cosineSimilarity, mockEmbed } from "@/lib/retrieval/similarity";
import type { DocumentStore, RetrievedDocument } from "@/lib/retrieval/types";

export interface MemoryDocument extends RetrievedDocument {
  embedding?: number[];
}

/** In-memory store used by unit tests and as a fallback when pgvector is empty. */
export class MemoryDocumentStore implements DocumentStore {
  constructor(private readonly documents: MemoryDocument[] = []) {}

  add(documents: MemoryDocument[]): void {
    this.documents.push(...documents);
  }

  async search(input: {
    query: string;
    embedding?: number[];
    topK: number;
  }): Promise<RetrievedDocument[]> {
    const queryEmbedding = input.embedding ?? mockEmbed(input.query);
    return this.documents
      .map((document) => {
        const embedding = document.embedding ?? mockEmbed(document.content);
        return {
          ...document,
          sourceQuery: input.query,
          score: cosineSimilarity(queryEmbedding, embedding),
        };
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, input.topK);
  }
}

let fallbackStore: MemoryDocumentStore | undefined;

export function getFallbackDocumentStore(): MemoryDocumentStore {
  if (!fallbackStore) {
    fallbackStore = new MemoryDocumentStore(seedTopicKnowledge());
  }
  return fallbackStore;
}

export function resetFallbackDocumentStore(): void {
  fallbackStore = new MemoryDocumentStore(seedTopicKnowledge());
}

export function seedTopicKnowledge(): MemoryDocument[] {
  const passages = [
    {
      title: "API latency",
      content:
        "Reduce API latency with caching, connection pooling, avoiding N+1 queries, pagination, and measuring p99. Profile before optimizing.",
    },
    {
      title: "Frontend performance",
      content:
        "Frontend performance improves with code splitting, image optimization, avoiding layout shift, memoization, and reducing hydration cost.",
    },
    {
      title: "Database optimization",
      content:
        "Database optimization uses indexes matching query predicates, explain plans, covering indexes, and avoiding unbounded scans.",
    },
    {
      title: "Behavioural STAR",
      content:
        "Behavioural answers should use Situation, Task, Action, Result. Interviewers look for ownership, trade-offs, and measurable outcomes.",
    },
    {
      title: "System design",
      content:
        "System design interviews cover requirements, APIs, data model, scaling, consistency, failure modes, and trade-offs versus over-engineering.",
    },
  ];

  return passages.map((passage, index) => ({
    id: `topic-${index + 1}`,
    sourceType: "topic_knowledge" as const,
    sourceId: null,
    title: passage.title,
    content: passage.content,
    sourceQuery: "",
    embedding: mockEmbed(`${passage.title} ${passage.content}`),
  }));
}
