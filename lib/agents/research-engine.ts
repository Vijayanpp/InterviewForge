import { interviewRetrievalPipeline, formatEvidence } from "@/lib/retrieval/pipeline";
import { getFallbackDocumentStore } from "@/lib/retrieval/stores/memory";
import { chunkText } from "@/lib/retrieval/chunking";
import type { DocumentStore, RetrievedDocument, RetrievalTrace } from "@/lib/retrieval/types";
import type { InterviewState } from "@/lib/graph/state";

export function sessionContextDocuments(state: InterviewState): RetrievedDocument[] {
  const documents: RetrievedDocument[] = [];
  if (state.resumeText) {
    for (const chunk of chunkText(state.resumeText)) {
      documents.push({
        id: `resume-${chunk.index}`,
        sourceType: "resume",
        sourceId: state.sessionId,
        title: "Candidate resume",
        content: chunk.content,
        sourceQuery: "resume",
      });
    }
  }
  if (state.jobDescriptionText) {
    for (const chunk of chunkText(state.jobDescriptionText)) {
      documents.push({
        id: `jd-${chunk.index}`,
        sourceType: "job_description",
        sourceId: state.sessionId,
        title: "Job description",
        content: chunk.content,
        sourceQuery: "job description",
      });
    }
  }
  return documents;
}

export async function runSpecialistResearch(
  state: InterviewState,
  objective: string
): Promise<RetrievalTrace> {
  const sessionDocuments = sessionContextDocuments(state);
  const stores: DocumentStore[] = [getFallbackDocumentStore()];
  let useLlm = true;

  try {
    const { isMockAgentRuntime } = await import("@/lib/agents/model");
    useLlm = !isMockAgentRuntime();
    if (!isMockAgentRuntime()) {
      const { VectorDocumentStore } = await import("@/lib/retrieval/stores/vector");
      const { QuestionBankStore } = await import("@/lib/retrieval/stores/question-bank");
      stores.unshift(new VectorDocumentStore(), new QuestionBankStore());
    }
  } catch {
    useLlm = false;
  }

  return interviewRetrievalPipeline(objective, {
    stores,
    sessionDocuments,
    filters: { candidateId: state.candidateId, sessionId: state.sessionId },
    maxSubQuestions: 3,
    queriesPerQuestion: 2,
    topKPerQuestion: 4,
    finalTopK: 8,
    useLlm,
  });
}

export function evidenceForPrompt(state: InterviewState): string {
  return formatEvidence(state.retrievedEvidence);
}
