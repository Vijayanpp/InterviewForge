import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AnswerEvaluation } from "@/types/domain/interview";
import type { GeneratedEvaluation } from "@/lib/ai/schemas";

type Client = SupabaseClient<Database>;

export async function createEvaluation(
  supabase: Client,
  input: {
    answerId: string;
    evaluation: GeneratedEvaluation;
    modelUsed: string;
    promptVersionId?: string | null;
  }
): Promise<AnswerEvaluation> {
  const { data, error } = await supabase
    .from("answer_evaluations")
    .insert({
      answer_id: input.answerId,
      scores: input.evaluation.scores,
      weighted_score: input.evaluation.weightedScore,
      strengths: input.evaluation.strengths,
      missing_points: input.evaluation.missingPoints,
      incorrect_statements: input.evaluation.incorrectStatements,
      ideal_answer: input.evaluation.idealAnswer,
      improvement_advice: input.evaluation.improvementAdvice,
      follow_up_question: input.evaluation.followUpQuestion,
      evaluator_confidence: input.evaluation.evaluatorConfidence,
      model_used: input.modelUsed,
      prompt_version_id: input.promptVersionId ?? null,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to save answer evaluation");
  return data;
}

export interface EvaluationWithContext extends AnswerEvaluation {
  candidate_answers: {
    id: string;
    answer_text: string;
    question_id: string;
    interview_questions: {
      id: string;
      body: string;
      topic_id: string | null;
      topics: { name: string } | null;
    };
  };
}

export async function listEvaluationsForSession(
  supabase: Client,
  sessionId: string
): Promise<EvaluationWithContext[]> {
  const { data, error } = await supabase
    .from("answer_evaluations")
    .select(
      "*, candidate_answers!inner(id, answer_text, question_id, session_id, interview_questions(id, body, topic_id, topics(name)))"
    )
    .eq("candidate_answers.session_id", sessionId);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as EvaluationWithContext[];
}
