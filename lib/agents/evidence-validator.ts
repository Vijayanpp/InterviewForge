import { validatedFindingSchema, type ValidatedFinding } from "@/lib/agents/schemas/query";
import type { GeneratedEvaluation } from "@/lib/ai/schemas";
import type { RetrievedDocument } from "@/lib/retrieval/types";

export function validateFindingMock(
  evaluation: GeneratedEvaluation,
  documents: RetrievedDocument[],
  agent = "technical_evaluator"
): ValidatedFinding {
  const haystack = documents.map((document) => document.content.toLowerCase()).join(" ");
  const claims = [
    ...evaluation.strengths.slice(0, 2).map((claim) => ({
      claim,
      supported: documents.length === 0 || haystack.length > 0,
      sourceIds: documents.slice(0, 2).map((document) => document.id),
      reasoning: documents.length ? "Aligned with retrieved interview context." : "No sources; accepted as grader judgment.",
    })),
    ...evaluation.missingPoints.slice(0, 2).map((claim) => ({
      claim,
      supported: true,
      sourceIds: documents.slice(0, 1).map((document) => document.id),
      reasoning: "Gap identified from the rubric / expected concepts.",
    })),
  ];

  return validatedFindingSchema.parse({
    agent,
    finding: evaluation.improvementAdvice,
    claims,
    supported: claims.every((claim) => claim.supported),
  });
}

export async function validateFinding(
  evaluation: GeneratedEvaluation,
  documents: RetrievedDocument[],
  agent = "technical_evaluator"
): Promise<ValidatedFinding> {
  const { invokeStructured } = await import("@/lib/agents/structured");
  const sources = documents
    .slice(0, 6)
    .map((document) => `ID: ${document.id}\nTITLE: ${document.title}\nCONTENT: ${document.content.slice(0, 800)}`)
    .join("\n\n");

  return invokeStructured(
    validatedFindingSchema,
    "validated_finding",
    `You are an evidence validation specialist for interview grading.

EVALUATION
${JSON.stringify({
  strengths: evaluation.strengths,
  missingPoints: evaluation.missingPoints,
  advice: evaluation.improvementAdvice,
})}

SOURCES
${sources || "(none)"}

For each important claim, mark whether the sources or the candidate answer rubric support it.
Do not invent sources. Return structured validated finding with agent="${agent}".`,
    () => validateFindingMock(evaluation, documents, agent)
  );
}
