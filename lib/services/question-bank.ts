import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { NotFoundError } from "@/lib/errors";
import { getAiProvider } from "@/lib/ai";
import { getTechnologiesByIds, getTopicsByIds } from "@/lib/repositories/technologies.repo";
import { createQuestionBankEntry } from "@/lib/repositories/question-bank.repo";
import type { GenerateQuestionDraftInput, QuestionBankEntry } from "@/types/domain/question-bank";

type Client = SupabaseClient<Database>;

/**
 * Generates a single question draft via the active `AiProvider` and saves
 * it to the bank with `status="draft"` so an admin must review/approve it
 * before it can ever be served to a candidate (see the RLS policy on
 * `interview_questions`, which only exposes `status="approved"` rows).
 */
export async function generateQuestionDraft(
  supabase: Client,
  input: GenerateQuestionDraftInput,
  createdBy: string
): Promise<QuestionBankEntry> {
  const [technologies, topics] = await Promise.all([
    getTechnologiesByIds(supabase, [input.technologyId]),
    input.topicId ? getTopicsByIds(supabase, [input.topicId]) : Promise.resolve([]),
  ]);

  const technology = technologies[0];
  if (!technology) throw new NotFoundError("Technology not found.");
  const topic = topics[0];

  const provider = getAiProvider();
  const generated = await provider.generateQuestion({
    interviewType: "technical",
    technology: technology.name,
    topics: topic ? [topic.name] : [],
    experienceLevel: input.experienceLevel,
    difficulty: input.difficulty,
    previousQuestions: [],
    topicCoverage: [],
    remainingMinutes: 30,
    skipOpening: true,
  });

  const entry = await createQuestionBankEntry(
    supabase,
    {
      technologyId: input.technologyId,
      topicId: input.topicId,
      experienceLevels: [input.experienceLevel],
      difficulty: generated.difficulty,
      questionType: generated.questionType,
      title: generated.title,
      body: generated.body,
      expectedConcepts: generated.expectedConcepts,
      rubric: {
        ...generated.rubric,
        notes: generated.rubric.notes ?? undefined,
      },
      maxScore: 10,
      status: "draft",
    },
    createdBy,
    "ai"
  );

  void import("@/lib/services/knowledge-ingest").then(({ ingestKnowledgeText }) =>
    ingestKnowledgeText(supabase, {
      sourceType: "question_bank",
      sourceId: entry.id,
      text: `${entry.title ?? ""}\n${entry.body}`,
      title: entry.title,
    })
  );

  return entry;
}
