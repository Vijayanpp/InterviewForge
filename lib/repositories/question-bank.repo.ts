import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  CreateQuestionBankEntryInput,
  QuestionBankEntry,
  UpdateQuestionBankEntryInput,
} from "@/types/domain/question-bank";
import type { ContentStatus } from "@/types/domain/enums";

type Client = SupabaseClient<Database>;

export interface QuestionBankFilters {
  technologyId?: string;
  topicId?: string;
  status?: ContentStatus;
}

/** Bank entries are `interview_questions` rows with `session_id IS NULL`. */
export async function listQuestionBankEntries(
  supabase: Client,
  filters: QuestionBankFilters = {}
): Promise<QuestionBankEntry[]> {
  let query = supabase
    .from("interview_questions")
    .select("*")
    .is("session_id", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.technologyId) query = query.eq("technology_id", filters.technologyId);
  if (filters.topicId) query = query.eq("topic_id", filters.topicId);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQuestionBankEntryById(
  supabase: Client,
  id: string
): Promise<QuestionBankEntry | null> {
  const { data, error } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("id", id)
    .is("session_id", null)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

export async function createQuestionBankEntry(
  supabase: Client,
  input: CreateQuestionBankEntryInput,
  createdBy: string,
  generatedBy: "admin" | "ai" = "admin"
): Promise<QuestionBankEntry> {
  const { data, error } = await supabase
    .from("interview_questions")
    .insert({
      session_id: null,
      technology_id: input.technologyId,
      topic_id: input.topicId,
      experience_levels: input.experienceLevels,
      difficulty: input.difficulty,
      question_type: input.questionType,
      title: input.title ?? null,
      body: input.body,
      expected_concepts: input.expectedConcepts,
      rubric: input.rubric,
      max_score: input.maxScore,
      reference_answer: input.referenceAnswer ?? null,
      status: input.status,
      generated_by: generatedBy,
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create question");
  return data;
}

export async function updateQuestionBankEntry(
  supabase: Client,
  id: string,
  input: UpdateQuestionBankEntryInput
): Promise<QuestionBankEntry> {
  const patch: Database["public"]["Tables"]["interview_questions"]["Update"] = {};
  if (input.technologyId !== undefined) patch.technology_id = input.technologyId;
  if (input.topicId !== undefined) patch.topic_id = input.topicId;
  if (input.experienceLevels !== undefined) patch.experience_levels = input.experienceLevels;
  if (input.difficulty !== undefined) patch.difficulty = input.difficulty;
  if (input.questionType !== undefined) patch.question_type = input.questionType;
  if (input.title !== undefined) patch.title = input.title ?? null;
  if (input.body !== undefined) patch.body = input.body;
  if (input.expectedConcepts !== undefined) patch.expected_concepts = input.expectedConcepts;
  if (input.rubric !== undefined) patch.rubric = input.rubric;
  if (input.maxScore !== undefined) patch.max_score = input.maxScore;
  if (input.referenceAnswer !== undefined) patch.reference_answer = input.referenceAnswer ?? null;
  if (input.status !== undefined) patch.status = input.status;

  const { data, error } = await supabase
    .from("interview_questions")
    .update(patch)
    .eq("id", id)
    .is("session_id", null)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update question");
  return data;
}

export async function setQuestionBankStatus(
  supabase: Client,
  id: string,
  status: ContentStatus
): Promise<QuestionBankEntry> {
  const { data, error } = await supabase
    .from("interview_questions")
    .update({ status })
    .eq("id", id)
    .is("session_id", null)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to update question status");
  return data;
}

export async function softDeleteQuestionBankEntry(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase
    .from("interview_questions")
    .update({ deleted_at: new Date().toISOString(), status: "archived" })
    .eq("id", id)
    .is("session_id", null);

  if (error) throw new Error(error.message);
}
