import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { InterviewQuestion } from "@/types/domain/interview";
import type { GeneratedQuestion } from "@/lib/ai/schemas";

type Client = SupabaseClient<Database>;

export interface NewSessionQuestionInput {
  sessionId: string;
  technologyId: string;
  topicId: string | null;
  experienceLevel: InterviewQuestion["experience_levels"][number];
  orderIndex: number;
  question: GeneratedQuestion;
  referenceAnswer?: string;
}

export async function createSessionQuestion(
  supabase: Client,
  input: NewSessionQuestionInput
): Promise<InterviewQuestion> {
  const { data, error } = await supabase
    .from("interview_questions")
    .insert({
      session_id: input.sessionId,
      technology_id: input.technologyId,
      topic_id: input.topicId,
      experience_levels: [input.experienceLevel],
      difficulty: input.question.difficulty,
      question_type: input.question.questionType,
      title: input.question.title,
      body: input.question.body,
      expected_concepts: input.question.expectedConcepts,
      rubric: input.question.rubric,
      suggested_follow_ups: [],
      reference_answer: input.referenceAnswer ?? input.question.idealAnswer ?? null,
      status: "approved",
      generated_by: "ai",
      order_index: input.orderIndex,
      asked_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create interview question");
  return data;
}

export async function listQuestionsForSession(
  supabase: Client,
  sessionId: string
): Promise<InterviewQuestion[]> {
  const { data, error } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("session_id", sessionId)
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQuestionById(
  supabase: Client,
  questionId: string
): Promise<InterviewQuestion | null> {
  const { data, error } = await supabase
    .from("interview_questions")
    .select("*")
    .eq("id", questionId)
    .single();

  if (error) return null;
  return data;
}
