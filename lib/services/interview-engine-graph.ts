import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { getAiProvider } from "@/lib/ai";
import { updateSession } from "@/lib/repositories/interview-sessions.repo";
import {
  createSessionQuestion,
  getQuestionById,
  listQuestionsForSession,
} from "@/lib/repositories/interview-questions.repo";
import { createAnswer } from "@/lib/repositories/candidate-answers.repo";
import { createEvaluation, listEvaluationsForSession } from "@/lib/repositories/answer-evaluations.repo";
import {
  createReport,
  getReportBySessionId,
  listCompletedReportsForCandidateAndTechnology,
} from "@/lib/repositories/interview-reports.repo";
import { getLatestSessionSubmission } from "@/lib/repositories/code-submissions.repo";
import { topicCoverageAverages, updateTopicCoverage, type TopicRunningScore } from "@/lib/services/scoring";
import type { VoiceTranscript } from "@/types/domain/voice";
import { formatCommunicationNotes } from "@/lib/voice/analytics";
import { toCandidateFacingQuestion, type InterviewSession } from "@/types/domain/interview";
import type { InterviewReport, QuestionFeedbackItem } from "@/types/domain/report";
import type { ExperienceLevel } from "@/types/domain/enums";
import { interviewPlanSchema, type InterviewPlan } from "@/lib/agents/schemas/query";
import { buildGraphInput } from "@/lib/graph/inputs";
import { invokeInterviewGraph } from "@/lib/graph/workflow";
import { logger } from "@/lib/logger";
import {
  assertOwnedInProgressOrDraft,
  buildEmptySessionReport,
  extractCodingScore,
  hireFromCodingScore,
  loadPersonalizationContext,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  minutesElapsed,
  MIXED_TEXT_QUESTIONS,
  resolveSessionContext,
  type StartSessionResult,
  type SubmitAnswerResult,
} from "@/lib/services/interview-engine-legacy";
import { recordInterviewEvent } from "@/lib/repositories/interview-events.repo";

type Client = SupabaseClient<Database>;

function sessionConfig(session: InterviewSession): Record<string, unknown> {
  return session.config && typeof session.config === "object" && !Array.isArray(session.config)
    ? { ...(session.config as Record<string, unknown>) }
    : {};
}

function readPlan(session: InterviewSession): InterviewPlan | null {
  const agent = sessionConfig(session).agent;
  if (!agent || typeof agent !== "object") return null;
  const parsed = interviewPlanSchema.safeParse((agent as { plan?: unknown }).plan);
  return parsed.success ? parsed.data : null;
}

async function persistAgentConfig(
  supabase: Client,
  session: InterviewSession,
  patch: { plan?: InterviewPlan | null; retrieval?: unknown }
): Promise<void> {
  const next = sessionConfig(session);
  const agent = {
    ...((next.agent as Record<string, unknown> | undefined) ?? {}),
    ...(patch.plan ? { plan: patch.plan } : {}),
    ...(patch.retrieval ? { retrieval: patch.retrieval } : {}),
  };
  await updateSession(supabase, session.id, {
    config: { ...next, agent } as unknown as Json,
  });
}

export async function startSessionGraph(
  supabase: Client,
  sessionId: string,
  candidateId: string
): Promise<StartSessionResult> {
  const session = await assertOwnedInProgressOrDraft(supabase, sessionId, candidateId);

  if (session.status === "in_progress") {
    const questions = await listQuestionsForSession(supabase, sessionId);
    const current = questions[session.current_question_index];
    if (current) return { session, question: toCandidateFacingQuestion(current) };
  }

  if (session.status !== "draft") {
    throw new ConflictError("This interview session has already been started or completed.");
  }

  const { technologyName, topicNames } = await resolveSessionContext(supabase, session);
  const personalization = await loadPersonalizationContext(supabase, session);

  const base = {
    sessionId,
    conversationId: sessionId,
    candidateId,
    interviewType: session.interview_type,
    technology: technologyName,
    topics: topicNames,
    experienceLevel: session.experience_level,
    difficulty: session.difficulty,
    remainingMinutes: session.duration_minutes,
    questionsAsked: 0,
    minQuestions: MIN_QUESTIONS,
    maxQuestions: MAX_QUESTIONS,
    mixedTextQuestions: MIXED_TEXT_QUESTIONS,
    previousQuestions: [] as string[],
    topicCoverage: [],
    ...personalization,
    skipOpening: false,
  };

  const prep = await invokeInterviewGraph(buildGraphInput({ ...base, turnMode: "prep" }), sessionId);
  await persistAgentConfig(supabase, session, {
    plan: prep.interviewPlan,
    retrieval: prep.retrievalTrace,
  });
  await recordInterviewEvent(supabase, sessionId, "planning", {
    goal: prep.interviewGoal,
    plan: prep.interviewPlan,
  });

  const asked = await invokeInterviewGraph(
    buildGraphInput({ ...base, turnMode: "ask", interviewPlan: prep.interviewPlan }),
    sessionId
  );

  const generated = asked.generatedQuestion;
  if (!generated) {
    throw new Error("Interview graph did not produce an opening question.");
  }

  const question = await createSessionQuestion(supabase, {
    sessionId,
    technologyId: session.technology_ids[0]!,
    topicId: session.topic_ids[0] ?? null,
    experienceLevel: session.experience_level,
    orderIndex: 0,
    question: generated,
  });

  const updated = await updateSession(supabase, sessionId, {
    status: "in_progress",
    started_at: new Date().toISOString(),
    current_question_index: 0,
  });

  return { session: updated, question: toCandidateFacingQuestion(question) };
}

export async function submitAnswerGraph(
  supabase: Client,
  sessionId: string,
  candidateId: string,
  input: {
    questionId: string;
    answerText: string;
    durationSeconds?: number;
    isRetry?: boolean;
    transcript?: VoiceTranscript;
  }
): Promise<SubmitAnswerResult> {
  const session = await assertOwnedInProgressOrDraft(supabase, sessionId, candidateId);
  if (session.status !== "in_progress") {
    throw new ConflictError("This interview session is not currently in progress.");
  }

  const question = await getQuestionById(supabase, input.questionId);
  if (!question || question.session_id !== sessionId) {
    throw new NotFoundError("Question not found for this session.");
  }

  const answer = await createAnswer(supabase, {
    questionId: question.id,
    sessionId,
    answerText: input.answerText,
    durationSeconds: input.durationSeconds,
    isRetry: input.isRetry,
    transcript: input.transcript,
  });

  const communicationNotes = input.transcript ? formatCommunicationNotes(input.transcript) : "";
  const { technologyName, topicNames } = await resolveSessionContext(supabase, session);
  const personalization = await loadPersonalizationContext(supabase, session);
  const allQuestions = await listQuestionsForSession(supabase, sessionId);

  let topicCoverage: TopicRunningScore[] = [];
  const evaluations = await listEvaluationsForSession(supabase, sessionId);
  for (const evalRow of evaluations) {
    const topicName = evalRow.candidate_answers.interview_questions.topics?.name ?? technologyName;
    topicCoverage = updateTopicCoverage(topicCoverage, topicName, evalRow.weighted_score);
  }

  const remainingMinutes = Math.max(0, session.duration_minutes - minutesElapsed(session.started_at));
  const graded = await invokeInterviewGraph(
    buildGraphInput({
      sessionId,
      conversationId: sessionId,
      candidateId,
      interviewType: session.interview_type,
      technology: technologyName,
      topics: topicNames,
      experienceLevel: session.experience_level,
      difficulty: session.difficulty,
      remainingMinutes,
      questionsAsked: allQuestions.length,
      minQuestions: MIN_QUESTIONS,
      maxQuestions: MAX_QUESTIONS,
      mixedTextQuestions: MIXED_TEXT_QUESTIONS,
      previousQuestions: allQuestions.map((row) => row.body),
      topicCoverage: topicCoverageAverages(topicCoverage),
      ...personalization,
      interviewPlan: readPlan(session),
      turnMode: "grade",
      lastQuestionBody: question.body,
      lastCandidateAnswer: communicationNotes
        ? `${input.answerText}\n\n[${communicationNotes}]`
        : input.answerText,
      questionType: question.question_type,
      expectedConcepts: (question.expected_concepts as string[]) ?? [],
      referenceAnswer: question.reference_answer,
      skipOpening: true,
    }),
    sessionId
  );

  const evaluation = graded.lastEvaluation;
  if (!evaluation) {
    throw new Error("Interview graph did not produce an evaluation.");
  }

  const provider = getAiProvider();
  await createEvaluation(supabase, {
    answerId: answer.id,
    evaluation,
    modelUsed: `${provider.name}+graph`,
  });
  await recordInterviewEvent(supabase, sessionId, "evaluating", {
    weightedScore: evaluation.weightedScore,
    decision: graded.supervisorDecision,
  });

  const decision = graded.supervisorDecision?.decision ?? "next_question";

  if (decision === "coding") {
    return { action: "coding" };
  }

  if (decision === "end") {
    const report = await endSessionGraph(supabase, sessionId, candidateId, "topics_exhausted");
    return { action: "ended", report };
  }

  const generated = graded.generatedQuestion;
  if (!generated) {
    logger.warn({ sessionId, decision }, "Graph supervisor asked for another question but none was generated");
    const report = await endSessionGraph(supabase, sessionId, candidateId, "topics_exhausted");
    return { action: "ended", report };
  }

  const nextIndex = allQuestions.length;
  const nextQuestionRow = await createSessionQuestion(supabase, {
    sessionId,
    technologyId: session.technology_ids[0]!,
    topicId: session.topic_ids[0] ?? null,
    experienceLevel: session.experience_level,
    orderIndex: nextIndex,
    question: generated,
  });

  await updateSession(supabase, sessionId, { current_question_index: nextIndex });
  await persistAgentConfig(supabase, session, { retrieval: graded.retrievalTrace });

  return {
    action: decision === "follow_up" || decision === "research_more" ? "follow_up" : "next_question",
    nextQuestion: toCandidateFacingQuestion(nextQuestionRow),
  };
}

export async function endSessionGraph(
  supabase: Client,
  sessionId: string,
  candidateId: string,
  _reason: "candidate_ended" | "time_expired" | "topics_exhausted" = "candidate_ended"
): Promise<InterviewReport> {
  const session = await assertOwnedInProgressOrDraft(supabase, sessionId, candidateId);

  const existingReport = await getReportBySessionId(supabase, sessionId);
  if (existingReport) return existingReport;

  if (session.status === "completed") {
    throw new ConflictError("This interview session has already ended.");
  }

  const { technologyName, topicNames } = await resolveSessionContext(supabase, session);
  const evaluations = await listEvaluationsForSession(supabase, sessionId);
  const personalization = await loadPersonalizationContext(supabase, session);

  const questionEvaluations = evaluations.map((evalRow) => ({
    question: evalRow.candidate_answers.interview_questions.body,
    candidateAnswer: evalRow.candidate_answers.answer_text,
    weightedScore: evalRow.weighted_score,
    strengths: (evalRow.strengths as string[]) ?? [],
    missingPoints: (evalRow.missing_points as string[]) ?? [],
    topicName: evalRow.candidate_answers.interview_questions.topics?.name ?? null,
  }));

  const previousReports = await listCompletedReportsForCandidateAndTechnology(
    supabase,
    candidateId,
    session.technology_ids,
    sessionId
  );

  const close = await invokeInterviewGraph(
    buildGraphInput({
      sessionId,
      conversationId: sessionId,
      candidateId,
      interviewType: session.interview_type,
      technology: technologyName,
      topics: topicNames,
      experienceLevel: session.experience_level,
      difficulty: session.difficulty,
      remainingMinutes: 0,
      questionsAsked: evaluations.length,
      previousQuestions: questionEvaluations.map((item) => item.question),
      ...personalization,
      interviewPlan: readPlan(session),
      turnMode: "close",
      skipOpening: true,
      previousSessionSummaries: previousReports.map((item) => ({
        sessionId: item.sessionId,
        overallScore: item.overallScore,
        endedAt: item.endedAt,
      })),
    }),
    sessionId
  );

  const provider = getAiProvider();
  const codingSubmission = await getLatestSessionSubmission(supabase, sessionId);
  const codingScore = extractCodingScore(codingSubmission);

  let report =
    close.generatedReport && questionEvaluations.length === 0
      ? close.generatedReport
      : questionEvaluations.length > 0
        ? await provider.generateReport({
            interviewType: session.interview_type,
            technology: technologyName,
            topics: topicNames,
            experienceLevel: session.experience_level as ExperienceLevel,
            questionEvaluations,
            previousSessions: previousReports.map((item) => ({
              sessionId: item.sessionId,
              overallScore: item.overallScore,
              endedAt: item.endedAt,
            })),
          })
        : buildEmptySessionReport(session.interview_type, technologyName);

  if (codingScore != null) {
    report = {
      ...report,
      codingScore,
      ...(questionEvaluations.length === 0
        ? {
            overallScore: codingScore,
            hireRecommendation: hireFromCodingScore(codingScore),
            recommendationRationale:
              codingSubmission?.status === "accepted"
                ? "All coding tests passed."
                : `Coding score ${codingScore.toFixed(0)}% based on automated tests.`,
            strengths:
              codingScore >= 70
                ? ["Solved the coding challenge with solid test coverage"]
                : report.strengths,
            weaknesses:
              codingScore < 50
                ? ["Coding solution did not pass enough test cases"]
                : report.weaknesses,
          }
        : {}),
    };
  }

  const questionFeedback: QuestionFeedbackItem[] = evaluations.map((evalRow) => ({
    questionId: evalRow.candidate_answers.question_id,
    question: evalRow.candidate_answers.interview_questions.body,
    candidateAnswer: evalRow.candidate_answers.answer_text,
    score: evalRow.weighted_score,
    strengths: (evalRow.strengths as string[]) ?? [],
    missingPoints: (evalRow.missing_points as string[]) ?? [],
    idealAnswer: evalRow.ideal_answer ?? "",
    improvementAdvice: evalRow.improvement_advice ?? "",
  }));

  const confidenceScore =
    evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + Number(e.evaluator_confidence), 0) / evaluations.length
      : codingScore != null
        ? 0.7
        : 0.5;

  const savedReport = await createReport(supabase, {
    sessionId,
    report,
    questionFeedback: questionFeedback as unknown as Json,
    confidenceScore,
    modelUsed: `${provider.name}+graph`,
  });

  await updateSession(supabase, sessionId, {
    status: "completed",
    ended_at: new Date().toISOString(),
  });
  await recordInterviewEvent(supabase, sessionId, "supervising", {
    stage: "close",
    overallScore: savedReport.overall_score,
  });

  return savedReport;
}
