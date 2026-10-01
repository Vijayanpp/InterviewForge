export const KNOWLEDGE_SOURCE_TYPES = [
  "resume",
  "job_description",
  "question_bank",
  "topic_knowledge",
  "session_summary",
] as const;

export type KnowledgeSourceType = (typeof KNOWLEDGE_SOURCE_TYPES)[number];

export interface RetrievedDocument {
  id: string;
  sourceType: KnowledgeSourceType | "web" | "session_context";
  sourceId: string | null;
  title: string;
  content: string;
  sourceQuery: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface SubQuestionRetrieval {
  question: string;
  searchQueries: string[];
  rawDocumentCount: number;
  uniqueDocumentCount: number;
  documents: RetrievedDocument[];
}

export interface RetrievalTrace {
  objective: string;
  expandedQuery: string | null;
  expansionTerms: string[];
  requiresDecomposition: boolean;
  decompositionReasoning: string;
  subQuestions: string[];
  questionResults: SubQuestionRetrieval[];
  documents: RetrievedDocument[];
}

export interface RetrievalFilters {
  candidateId?: string | null;
  sessionId?: string | null;
  sourceTypes?: KnowledgeSourceType[];
  technology?: string | null;
}

export interface DocumentStore {
  search(input: {
    query: string;
    embedding?: number[];
    topK: number;
    filters?: RetrievalFilters;
  }): Promise<RetrievedDocument[]>;
}
