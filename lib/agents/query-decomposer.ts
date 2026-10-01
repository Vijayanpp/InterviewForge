import {
  queryDecompositionSchema,
  type QueryDecomposition,
} from "@/lib/agents/schemas/query";

const COMPLEXITY_HINTS =
  /\b(and|vs|versus|compare|comparison|plus|also|including|as well as|,)\b/i;

export function decomposeQueryMock(objective: string, maxQuestions = 5): QueryDecomposition {
  const clauses = objective
    .split(/[.;]|(?:\b(?:and|vs|versus|compare|including)\b)/i)
    .map((part) => part.replace(/[?,]/g, "").trim())
    .filter((part) => part.length > 12);

  const unique = [...new Set(clauses)].slice(0, maxQuestions);
  const requiresDecomposition = unique.length > 1 || COMPLEXITY_HINTS.test(objective);

  if (!requiresDecomposition) {
    return queryDecompositionSchema.parse({
      originalObjective: objective,
      requiresDecomposition: false,
      reasoning: "Objective is a single focused interview dimension.",
      subQuestions: [
        {
          id: "q1",
          question: objective.trim(),
          purpose: "Retrieve evidence for the original interview objective.",
        },
      ],
    });
  }

  const subQuestions = (unique.length > 0 ? unique : [objective]).slice(0, maxQuestions).map(
    (question, index) => ({
      id: `q${index + 1}`,
      question: question.charAt(0).toUpperCase() + question.slice(1),
      purpose: "Cover one atomic dimension of the interview objective.",
    })
  );

  return queryDecompositionSchema.parse({
    originalObjective: objective,
    requiresDecomposition: true,
    reasoning: "Objective contains multiple interview dimensions that should be retrieved independently.",
    subQuestions,
  });
}

export async function decomposeQuery(
  objective: string,
  maxQuestions = 5
): Promise<QueryDecomposition> {
  const { invokeStructured } = await import("@/lib/agents/structured");
  return invokeStructured(
    queryDecompositionSchema,
    "query_decomposition",
    buildDecomposePrompt(objective, maxQuestions),
    () => decomposeQueryMock(objective, maxQuestions)
  );
}

function buildDecomposePrompt(objective: string, maxQuestions: number): string {
  return `You are a query decomposition specialist inside an interview platform.

INTERVIEW OBJECTIVE
${objective}

Determine whether this objective should be broken into smaller atomic questions.

If it is simple, set requiresDecomposition=false and create one focused sub-question.
If it contains multiple concepts, comparisons, or dimensions, set requiresDecomposition=true
and create at most ${maxQuestions} atomic questions.

Rules:
1. Each sub-question investigates ONE dimension.
2. Sub-questions must collectively cover the objective.
3. Do not create duplicates or unrelated questions.
4. Do not answer the questions.
5. Questions should be suitable for later retrieval over resumes, JDs, and a question bank.

Useful interview dimensions: fundamentals, system design, debugging, behavioural STAR, company/role fit, coding, trade-offs.

Return structured query decomposition.`;
}
