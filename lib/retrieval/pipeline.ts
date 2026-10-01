import { expandQuery, expandQueryMock } from "@/lib/agents/query-expander";
import { decomposeQuery, decomposeQueryMock } from "@/lib/agents/query-decomposer";
import { generateSearchQueries, generateSearchQueriesMock } from "@/lib/agents/multi-query-generator";
import { deduplicateDocuments } from "@/lib/retrieval/deduplication";
import { rerankDocuments, rerankDocumentsMock } from "@/lib/retrieval/reranker";
import { getFallbackDocumentStore } from "@/lib/retrieval/stores/memory";
import { mockEmbed } from "@/lib/retrieval/similarity";
import type {
  DocumentStore,
  RetrievalFilters,
  RetrievalTrace,
  RetrievedDocument,
  SubQuestionRetrieval,
} from "@/lib/retrieval/types";

export interface RetrievalPipelineOptions {
  stores?: DocumentStore[];
  maxSubQuestions?: number;
  queriesPerQuestion?: number;
  topKPerQuestion?: number;
  finalTopK?: number;
  filters?: RetrievalFilters;
  sessionDocuments?: RetrievedDocument[];
  useLlm?: boolean;
}

async function searchStores(
  stores: DocumentStore[],
  query: string,
  topK: number,
  filters?: RetrievalFilters
): Promise<RetrievedDocument[]> {
  const embedding = mockEmbed(query);
  const batches = await Promise.all(
    stores.map((store) =>
      store.search({ query, embedding, topK, filters }).catch(() => [] as RetrievedDocument[])
    )
  );
  return batches.flat();
}

export async function retrieveForQuestion(
  question: string,
  options: RetrievalPipelineOptions = {}
): Promise<SubQuestionRetrieval> {
  const queriesPerQuestion = options.queriesPerQuestion ?? 3;
  const topK = options.topKPerQuestion ?? 5;
  const stores = options.stores ?? [getFallbackDocumentStore()];
  const useLlm = options.useLlm ?? true;

  const multiQuery = useLlm
    ? await generateSearchQueries(question, queriesPerQuestion)
    : generateSearchQueriesMock(question, queriesPerQuestion);

  const queries = multiQuery.queries.map((item) => item.query);
  if (queries.length === 0) queries.push(question);

  const rawDocuments: RetrievedDocument[] = [];
  if (options.sessionDocuments?.length) {
    rawDocuments.push(...options.sessionDocuments);
  }

  const searched = await Promise.all(
    queries.map((query) => searchStores(stores, query, topK, options.filters))
  );
  for (const batch of searched) rawDocuments.push(...batch);

  const uniqueDocuments = deduplicateDocuments(rawDocuments);
  const documents = useLlm
    ? await rerankDocuments(question, uniqueDocuments, topK)
    : rerankDocumentsMock(question, uniqueDocuments, topK);

  return {
    question,
    searchQueries: queries,
    rawDocumentCount: rawDocuments.length,
    uniqueDocumentCount: uniqueDocuments.length,
    documents,
  };
}

/**
 * Full interview retrieval: expand → decompose → multi-query → parallel
 * retrieve → dedup → rerank. Ports Business-Research `research_retrieval_pipeline`.
 */
export async function interviewRetrievalPipeline(
  objective: string,
  options: RetrievalPipelineOptions = {}
): Promise<RetrievalTrace> {
  const maxSubQuestions = options.maxSubQuestions ?? 4;
  const finalTopK = options.finalTopK ?? 8;
  const useLlm = options.useLlm ?? true;

  const expansion = useLlm ? await expandQuery(objective) : expandQueryMock(objective);
  const decomposition = useLlm
    ? await decomposeQuery(expansion.expandedQuery || objective, maxSubQuestions)
    : decomposeQueryMock(expansion.expandedQuery || objective, maxSubQuestions);

  const subQuestions = decomposition.subQuestions.map((item) => item.question);
  if (subQuestions.length === 0) subQuestions.push(objective);

  const questionResults: SubQuestionRetrieval[] = [];
  const allRanked: RetrievedDocument[] = [];

  for (const question of subQuestions) {
    const result = await retrieveForQuestion(question, options);
    questionResults.push(result);
    allRanked.push(...result.documents);
  }

  const unique = deduplicateDocuments(allRanked);
  const documents = useLlm
    ? await rerankDocuments(objective, unique, finalTopK)
    : rerankDocumentsMock(objective, unique, finalTopK);

  return {
    objective,
    expandedQuery: expansion.expandedQuery,
    expansionTerms: expansion.terms,
    requiresDecomposition: decomposition.requiresDecomposition,
    decompositionReasoning: decomposition.reasoning,
    subQuestions,
    questionResults,
    documents,
  };
}

export function formatEvidence(documents: RetrievedDocument[], limit = 6): string {
  if (documents.length === 0) return "(no retrieved evidence)";
  return documents
    .slice(0, limit)
    .map(
      (document, index) =>
        `[${index + 1}] (${document.sourceType}) ${document.title}\n${document.content.slice(0, 600)}`
    )
    .join("\n\n");
}
