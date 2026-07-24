import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { getAiProvider } from "@/lib/ai";
import {
  getSessionById,
  updateSession,
  type SessionWithReport,
} from "@/lib/repositories/interview-sessions.repo";
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
import { getTechnologiesByIds, getTopicsByIds } from "@/lib/repositories/technologies.repo";
import { getLatestSessionSubmission } from "@/lib/repositories/code-submissions.repo";
import {
  decideNextAction,
  toOverallScore,
  topicCoverageAverages,
  updateTopicCoverage,
  type TopicRunningScore,
} from "@/lib/services/scoring";
import type { VoiceTranscript } from "@/types/domain/voice";
import { formatCommunicationNotes } from "@/lib/voice/analytics";
import { getResumeById, getJobDescriptionById } from "@/lib/repositories/documents.repo";
import { getProfileById } from "@/lib/repositories/profiles.repo";
import { toCandidateFacingQuestion, type CandidateFacingQuestion, type InterviewSession } from "@/types/domain/interview";
import type { InterviewReport, QuestionFeedbackItem } from "@/types/domain/report";
import type { ExperienceLevel, HireRecommendation } from "@/types/domain/enums";

type Client = SupabaseClient<Database>;

const MIN_QUESTIONS = 4;
const MAX_QUESTIONS = 12;
/** Mixed interviews: text round, then one coding challenge. */
const MIXED_TEXT_QUESTIONS = 2;

async function loadPersonalizationContext(supabase: Client, session: InterviewSession) {
  const [resume, jobDescription, profile] = await Promise.all([
    session.resume_id ? getResumeById(supabase, session.resume_id) : Promise.resolve(null),
    session.job_description_id
      ? getJobDescriptionById(supabase, session.job_description_id)
      : Promise.resolve(null),
    getProfileById(supabase, session.candidate_id),
  ]);

  return {
    targetCompany: session.target_company,
    customInstructions: session.custom_instructions,
    resumeText: resume?.parsed_text ?? null,
    jobDescriptionText: jobDescription?.content ?? null,
    candidateName: profile?.full_name?.trim() || null,
  };
}

async function assertOwnedInProgressOrDraft(
  supabase: Client,
  sessionId: string,
  candidateId: string
): Promise<InterviewSession> {
  const session = await getSessionById(supabase, sessionId);
  if (!session) throw new NotFoundError("Interview session not found.");
  if (session.candidate_id !== candidateId) throw new ForbiddenError();
  return session;
}

async function resolveSessionContext(supabase: Client, session: InterviewSession) {
  const [technologies, topics] = await Promise.all([
    getTechnologiesByIds(supabase, session.technology_ids),
    getTopicsByIds(supabase, session.topic_ids),
  ]);

  const technologyName = technologies[0]?.name ?? "General Programming";
  const topicNames = topics.map((t) => t.name);

  return { technologies, topics, technologyName, topicNames };
}

function minutesElapsed(startedAt: string | null): number {
  if (!startedAt) return 0;
  return (Date.now() - new Date(startedAt).getTime()) / 60_000;
}

export interface StartSessionResult {
  session: InterviewSession;
  question: CandidateFacingQuestion;
}

export async function startSession(
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
  const provider = getAiProvider();
  const personalization = await loadPersonalizationContext(supabase, session);

  const generated = await provider.generateQuestion({
    interviewType: session.interview_type,
    technology: technologyName,
    topics: topicNames,
    experienceLevel: session.experience_level,
    difficulty: session.difficulty,
    previousQuestions: [],
    topicCoverage: [],
    remainingMinutes: session.duration_minutes,
    ...personalization,
  });

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

export interface SubmitAnswerResult {
  action: "follow_up" | "next_question" | "ended" | "coding";
  nextQuestion?: CandidateFacingQuestion;
  report?: InterviewReport;
}

export async function submitAnswer(
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

  const provider = getAiProvider();
  const communicationNotes = input.transcript
    ? formatCommunicationNotes(input.transcript)
    : "";
  const evaluation = await provider.evaluateAnswer({
    questionType: question.question_type,
    difficulty: question.difficulty,
    questionBody: question.body,
    expectedConcepts: (question.expected_concepts as string[]) ?? [],
    referenceAnswer: question.reference_answer,
    candidateAnswer: communicationNotes
      ? `${input.answerText}\n\n[${communicationNotes}]`
      : input.answerText,
  });

  await createEvaluation(supabase, {
    answerId: answer.id,
    evaluation,
    modelUsed: provider.name,
  });

  const { technologyName, topicNames } = await resolveSessionContext(supabase, session);
  const allQuestions = await listQuestionsForSession(supabase, sessionId);
  const previousQuestions = allQuestions.map((q) => q.body);

  let topicCoverage: TopicRunningScore[] = [];
  const evaluations = await listEvaluationsForSession(supabase, sessionId);
  for (const evalRow of evaluations) {
    const topicName = evalRow.candidate_answers.interview_questions.topics?.name ?? technologyName;
    topicCoverage = updateTopicCoverage(topicCoverage, topicName, evalRow.weighted_score);
  }

  const remainingMinutes = Math.max(0, session.duration_minutes - minutesElapsed(session.started_at));
  const wasFollowUp = question.title?.startsWith("Follow-up:") ?? false;

  const decision = decideNextAction({
    remainingMinutes,
    questionsAsked: allQuestions.length,
    minQuestions: MIN_QUESTIONS,
    maxQuestions: MAX_QUESTIONS,
    lastWeightedScore: evaluation.weightedScore,
    wasFollowUp,
  });

  // Mixed: after a short text round, hand off to the coding room.
  if (
    session.interview_type === "mixed" &&
    allQuestions.length >= MIXED_TEXT_QUESTIONS &&
    decision !== "follow_up"
  ) {
    return { action: "coding" as const };
  }

  if (decision === "end") {
    const report = await endSession(supabase, sessionId, candidateId, "topics_exhausted");
    return { action: "ended", report };
  }

  const nextIndex = allQuestions.length;
  const personalization = await loadPersonalizationContext(supabase, session);
  const generated =
    decision === "follow_up"
      ? await provider.generateFollowUp({
          interviewType: session.interview_type,
          technology: technologyName,
          topics: topicNames,
          experienceLevel: session.experience_level,
          difficulty: session.difficulty,
          previousQuestions,
          topicCoverage: topicCoverageAverages(topicCoverage),
          remainingMinutes,
          lastQuestionBody: question.body,
          lastCandidateAnswer: input.answerText,
          lastEvaluationSummary: evaluation.improvementAdvice,
          ...personalization,
        })
      : await provider.generateQuestion({
          interviewType: session.interview_type,
          technology: technologyName,
          topics: topicNames,
          experienceLevel: session.experience_level,
          difficulty: session.difficulty,
          previousQuestions,
          topicCoverage: topicCoverageAverages(topicCoverage),
          remainingMinutes,
          ...personalization,
        });

  const nextQuestionRow = await createSessionQuestion(supabase, {
    sessionId,
    technologyId: session.technology_ids[0]!,
    topicId: session.topic_ids[0] ?? null,
    experienceLevel: session.experience_level,
    orderIndex: nextIndex,
    question: generated,
  });

  await updateSession(supabase, sessionId, { current_question_index: nextIndex });

  return {
    action: decision === "follow_up" ? "follow_up" : "next_question",
    nextQuestion: toCandidateFacingQuestion(nextQuestionRow),
  };
}

export async function endSession(
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

  const provider = getAiProvider();
  const codingSubmission = await getLatestSessionSubmission(supabase, sessionId);
  const codingScore = extractCodingScore(codingSubmission);

  let report =
    questionEvaluations.length > 0
      ? await provider.generateReport({
          interviewType: session.interview_type,
          technology: technologyName,
          topics: topicNames,
          experienceLevel: session.experience_level as ExperienceLevel,
          questionEvaluations,
          previousSessions: previousReports.map((p) => ({
            sessionId: p.sessionId,
            overallScore: p.overallScore,
            endedAt: p.endedAt,
          })),
        })
      : buildEmptySessionReport(session.interview_type, technologyName);

  if (codingScore != null) {
    report = {
      ...report,
      codingScore,
      // Coding-only (or coding-first) sessions: overall reflects the coding round.
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
    modelUsed: provider.name,
  });

  await updateSession(supabase, sessionId, {
    status: "completed",
    ended_at: new Date().toISOString(),
  });

  return savedReport;
}

function buildEmptySessionReport(interviewType: InterviewSession["interview_type"], technology: string) {
  return {
    overallScore: 0,
    hireRecommendation: "not_ready_yet" as const,
    recommendationRationale: "No questions were answered during this session.",
    technicalScore: null,
    communicationScore: null,
    problemSolvingScore: null,
    codingScore: null,
    topicScores: [],
    strengths: [],
    weaknesses: [],
    criticalGaps: [],
    sevenDayPlan: [],
    thirtyDayPlan: [],
    recommendedNext: {
      interviewType,
      technology,
      topics: [],
      reason: "Try again and answer at least one question to get a personalized report.",
    },
    comparisonWithPrevious: null,
  };
}

function extractCodingScore(
  submission: Awaited<ReturnType<typeof getLatestSessionSubmission>>
): number | null {
  if (!submission) return null;
  const fromEval = (submission.evaluation as { score?: number } | null)?.score;
  if (typeof fromEval === "number" && Number.isFinite(fromEval)) {
    return Math.min(100, Math.max(0, fromEval));
  }
  if (submission.total_test_count > 0) {
    return Math.round((submission.passed_test_count / submission.total_test_count) * 10000) / 100;
  }
  return null;
}

function hireFromCodingScore(score: number): HireRecommendation {
  if (score >= 85) return "strong_hire";
  if (score >= 70) return "hire";
  if (score >= 50) return "borderline";
  return "not_ready_yet";
}

export { toOverallScore };
export type { SessionWithReport };
