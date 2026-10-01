import { multiQueryResultSchema, type MultiQueryResult } from "@/lib/agents/schemas/query";

const ANGLES = [
  { suffix: "", angle: "Direct phrasing" },
  { suffix: "interview question expected answer", angle: "Interview / rubric terminology" },
  { suffix: "production best practices trade-offs", angle: "Production / architecture terminology" },
  { suffix: "common pitfalls debugging", angle: "Failure-mode terminology" },
] as const;

export function generateSearchQueriesMock(question: string, maxQueries = 4): MultiQueryResult {
  const queries = ANGLES.slice(0, Math.max(2, Math.min(maxQueries, ANGLES.length))).map(
    (item, index) => ({
      id: `sq${index + 1}`,
      query: item.suffix ? `${question} ${item.suffix}` : question,
      angle: item.angle,
    })
  );

  return multiQueryResultSchema.parse({
    originalQuestion: question,
    queries,
  });
}

export async function generateSearchQueries(
  question: string,
  maxQueries = 4
): Promise<MultiQueryResult> {
  const { invokeStructured } = await import("@/lib/agents/structured");
  return invokeStructured(
    multiQueryResultSchema,
    "multi_query",
    buildMultiQueryPrompt(question, maxQueries),
    () => generateSearchQueriesMock(question, maxQueries)
  );
}

function buildMultiQueryPrompt(question: string, maxQueries: number): string {
  return `You are a search query generation specialist inside an interview platform.

RESEARCH QUESTION
${question}

Convert ONE question into ${Math.min(maxQueries, 4)} semantically different retrieval queries.
Purpose: improve recall across a question bank, resume chunks, job descriptions, and topic notes.

Rules:
1. Generate between 2 and ${maxQueries} queries.
2. Every query must stay relevant.
3. Use meaningfully different angles (category, feature, failure mode, interview rubric).
4. Do not answer the question.
5. Do not invent companies or facts.
6. Avoid superficial one-word tweaks.

Return structured multi-query output.`;
}
