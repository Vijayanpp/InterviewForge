import {
  queryExpansionSchema,
  type QueryExpansion,
} from "@/lib/agents/schemas/query";

const RELATED_TERMS: Record<string, string[]> = {
  performance: ["optimization", "latency", "throughput", "profiling"],
  api: ["endpoint", "response time", "p99", "rate limit"],
  database: ["indexing", "query plan", "n+1", "connection pooling"],
  frontend: ["bundle size", "rendering", "cls", "hydration"],
  react: ["reconciliation", "hooks", "virtual dom", "concurrent rendering"],
  security: ["authn", "authz", "owasp", "injection"],
};

export function expandQueryMock(query: string): QueryExpansion {
  const lower = query.toLowerCase();
  const terms = new Set<string>();
  for (const [key, extras] of Object.entries(RELATED_TERMS)) {
    if (lower.includes(key)) {
      extras.forEach((term) => terms.add(term));
    }
  }
  if (terms.size === 0) {
    terms.add("best practices");
    terms.add("trade-offs");
  }
  const termList = [...terms].slice(0, 8);
  return queryExpansionSchema.parse({
    originalQuery: query,
    expandedQuery: `${query} ${termList.join(" ")}`.trim(),
    terms: termList,
    reasoning: "Added stack-specific synonyms and related terms to improve recall.",
  });
}

export async function expandQuery(query: string): Promise<QueryExpansion> {
  const { invokeStructured } = await import("@/lib/agents/structured");
  return invokeStructured(queryExpansionSchema, "query_expansion", buildExpansionPrompt(query), () =>
    expandQueryMock(query)
  );
}

function buildExpansionPrompt(query: string): string {
  return `You are a query expansion specialist inside an interview coaching system.

USER QUERY
${query}

Expand the query with related technical terms, synonyms, and stack jargon that would appear in resumes, job descriptions, question banks, or documentation.

Rules:
1. Keep the original intent.
2. Do not answer the question.
3. Do not invent companies or facts.
4. Prefer terms useful for retrieval (latency, N+1, rubric, STAR, system design).
5. Return 3-8 terms plus one expandedQuery string.

Return structured query expansion.`;
}
