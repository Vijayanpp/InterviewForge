import "server-only";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";

import { getServerEnv } from "@/lib/env";
import { AiProviderError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { loadPublishedPrompt, renderPromptTemplate } from "@/lib/ai/prompt-loader";
import { buildOpeningQuestion, shouldUseOpeningQuestion } from "@/lib/ai/opening-question";
import type {
  AiProvider,
  EvaluateAnswerParams,
  GenerateCodingChallengeParams,
  GenerateFollowUpParams,
  GenerateQuestionParams,
  GenerateReportParams,
  GenerateStudyPlanParams,
} from "@/lib/ai/provider";
import {
  generatedCodingChallengeSchema,
  generatedEvaluationSchema,
  generatedQuestionSchema,
  generatedReportSchema,
  generatedStudyPlanSchema,
  type GeneratedCodingChallenge,
  type GeneratedEvaluation,
  type GeneratedQuestion,
  type GeneratedReport,
  type GeneratedStudyPlan,
} from "@/lib/ai/schemas";
import type { PromptName } from "@/types/domain/enums";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  const env = getServerEnv();
  if (!env.OPENAI_API_KEY) {
    throw new AiProviderError("OPENAI_API_KEY is not configured.");
  }
  client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}

function stringifyContext(value: unknown): string {
  if (value === undefined || value === null) return "(none)";
  if (typeof value === "string") return value || "(none)";
  return JSON.stringify(value, null, 2);
}

async function buildSystemPrompt(
  promptName: PromptName,
  variables: Record<string, unknown>
): Promise<{ system: string; modelSettings: { model?: string; temperature?: number; max_tokens?: number } }> {
  const prompt = await loadPublishedPrompt(promptName);
  let system = renderPromptTemplate(prompt.content, variables);

  // Prepend the interviewer persona so every question/eval feels like a live interview.
  if (promptName === "question_generator" || promptName === "answer_evaluator") {
    try {
      const persona = await loadPublishedPrompt("interviewer");
      const personaText = renderPromptTemplate(persona.content, variables);
      system = `${personaText}\n\n---\n\n${system}`;
    } catch {
      // Persona prompt optional if not published yet.
    }
  }

  return { system, modelSettings: prompt.modelSettings };
}

/**
 * Loads the published prompt, renders it with `variables`, calls the OpenAI
 * chat completions API constrained to `schema` via structured outputs, and
 * validates the parsed result against the same Zod schema. Retries once on
 * a validation failure before surfacing a typed `AiProviderError`.
 */
async function runStructured<T>(
  promptName: PromptName,
  variables: Record<string, unknown>,
  schema: z.ZodType<T>,
  schemaName: string,
  userMessage: string
): Promise<T> {
  const { system, modelSettings } = await buildSystemPrompt(promptName, variables);
  const env = getServerEnv();

  const attempt = async (): Promise<T> => {
    const completion = await getClient().chat.completions.create({
      model: modelSettings.model ?? env.OPENAI_MODEL,
      temperature: modelSettings.temperature ?? 0.4,
      max_tokens: modelSettings.max_tokens ?? 800,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
      response_format: zodResponseFormat(schema, schemaName),
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from AI provider.");

    const parsedJson = JSON.parse(raw);
    return schema.parse(parsedJson);
  };

  try {
    return await attempt();
  } catch (firstError) {
    logger.warn({ promptName, err: (firstError as Error).message }, "AI structured output failed, retrying once");
    try {
      return await attempt();
    } catch (secondError) {
      logger.error({ promptName, err: (secondError as Error).message }, "AI structured output failed twice");
      throw new AiProviderError(
        `The AI provider returned an invalid response for "${promptName}" after a retry.`,
        { promptName }
      );
    }
  }
}

function questionUserMessage(params: GenerateQuestionParams, mode: "next" | "follow_up", followUp?: GenerateFollowUpParams): string {
  if (mode === "follow_up" && followUp) {
    return [
      "Generate ONE adaptive follow-up interview question as structured JSON.",
      "Do NOT reuse a canned template. Probe the specific gaps or vague claims in the candidate's last answer.",
      "",
      `Last question asked: ${followUp.lastQuestionBody}`,
      `Candidate's answer: ${followUp.lastCandidateAnswer}`,
      `Evaluation notes: ${followUp.lastEvaluationSummary}`,
      `Topics in scope: ${params.topics.join(", ") || params.technology}`,
      `Previous questions this session: ${stringifyContext(params.previousQuestions)}`,
      `Topic coverage so far: ${stringifyContext(params.topicCoverage)}`,
      `Minutes remaining: ${params.remainingMinutes}`,
      `Resume excerpt: ${stringifyContext(params.resumeText ? params.resumeText.slice(0, 4000) : null)}`,
      `Job description excerpt: ${stringifyContext(params.jobDescriptionText ? params.jobDescriptionText.slice(0, 4000) : null)}`,
    ].join("\n");
  }

  return [
    "Generate the NEXT live interview question as structured JSON.",
    "Invent a fresh, specific question for this candidate — never a generic placeholder like \"Explain how X works\".",
    "Prefer concrete scenarios, debugging prompts, or trade-off discussions calibrated to their experience level.",
    "",
    "FIRST TURN (when previousQuestions is empty AND this is a live interview, not a bank draft):",
    "- Greet warmly using the candidate name when available (otherwise say \"there\").",
    "- Briefly introduce yourself as Maya, their Technical Architect interviewer (about 20 years experience), in a friendly, professional tone.",
    "- Ask for a short self-introduction (background + what they are preparing for).",
    "- Keep sentences short and spoken-friendly. Do NOT ask a hard technical question on the first turn.",
    params.skipOpening
      ? "NOTE: skipOpening=true — do NOT produce a greeting; generate a normal technical question."
      : "",
    "",
    `Candidate name: ${params.candidateName || "(unknown)"}`,
    `Skip opening greeting: ${params.skipOpening ? "yes" : "no"}`,
    `Technology: ${params.technology}`,
    `Topics: ${params.topics.join(", ") || "(none selected — use core ${params.technology} topics)"}`,
    `Experience level: ${params.experienceLevel}`,
    `Difficulty: ${params.difficulty}`,
    `Interview type: ${params.interviewType}`,
    `Target company: ${params.targetCompany || "(none)"}`,
    `Custom instructions: ${params.customInstructions || "(none)"}`,
    `Resume excerpt: ${stringifyContext(params.resumeText ? params.resumeText.slice(0, 6000) : null)}`,
    `Job description excerpt: ${stringifyContext(params.jobDescriptionText ? params.jobDescriptionText.slice(0, 6000) : null)}`,
    `Previous questions (do not repeat): ${stringifyContext(params.previousQuestions)}`,
    `Topic coverage: ${stringifyContext(params.topicCoverage)}`,
    `Minutes remaining: ${params.remainingMinutes}`,
  ].join("\n");
}

export class OpenAiProvider implements AiProvider {
  readonly name = "openai" as const;

  async generateQuestion(params: GenerateQuestionParams): Promise<GeneratedQuestion> {
    if (shouldUseOpeningQuestion(params)) {
      return buildOpeningQuestion(params);
    }

    return runStructured(
      "question_generator",
      {
        experienceLevel: params.experienceLevel,
        technology: params.technology,
        topics: params.topics,
        difficulty: params.difficulty,
        interviewType: params.interviewType,
        previousQuestions: params.previousQuestions,
        topicCoverage: params.topicCoverage,
        remainingMinutes: params.remainingMinutes,
        targetCompany: params.targetCompany,
        customInstructions: params.customInstructions,
        resumeText: params.resumeText,
        jobDescriptionText: params.jobDescriptionText,
        candidateName: params.candidateName,
        skipOpening: params.skipOpening ?? false,
      },
      generatedQuestionSchema,
      "generated_question",
      questionUserMessage(params, "next")
    );
  }

  async generateFollowUp(params: GenerateFollowUpParams): Promise<GeneratedQuestion> {
    return runStructured(
      "question_generator",
      {
        experienceLevel: params.experienceLevel,
        technology: params.technology,
        topics: params.topics,
        difficulty: params.difficulty,
        interviewType: params.interviewType,
        previousQuestions: [...params.previousQuestions, params.lastQuestionBody],
        topicCoverage: params.topicCoverage,
        remainingMinutes: params.remainingMinutes,
        lastQuestionBody: params.lastQuestionBody,
        lastCandidateAnswer: params.lastCandidateAnswer,
        lastEvaluationSummary: params.lastEvaluationSummary,
        targetCompany: params.targetCompany,
        customInstructions: params.customInstructions,
        resumeText: params.resumeText,
        jobDescriptionText: params.jobDescriptionText,
        candidateName: params.candidateName,
      },
      generatedQuestionSchema,
      "generated_question",
      questionUserMessage(params, "follow_up", params)
    );
  }

  async evaluateAnswer(params: EvaluateAnswerParams): Promise<GeneratedEvaluation> {
    return runStructured(
      "answer_evaluator",
      {
        questionType: params.questionType,
        difficulty: params.difficulty,
        questionBody: params.questionBody,
        expectedConcepts: params.expectedConcepts,
        referenceAnswer:
          params.referenceAnswer ??
          "Not provided — grade against expected concepts and sound engineering judgment.",
        candidateAnswer: params.candidateAnswer,
        experienceLevel: "the candidate",
        technology: "the selected technology",
        topics: params.expectedConcepts,
        interviewType: "text",
      },
      generatedEvaluationSchema,
      "generated_evaluation",
      [
        "Evaluate this candidate answer rigorously and return structured JSON.",
        "Do not inflate scores. Cite concrete strengths and gaps from their words.",
        "",
        `Question: ${params.questionBody}`,
        `Candidate answer: ${params.candidateAnswer}`,
      ].join("\n")
    );
  }

  async generateReport(params: GenerateReportParams): Promise<GeneratedReport> {
    return runStructured(
      "report_generator",
      {
        interviewType: params.interviewType,
        technology: params.technology,
        topics: params.topics,
        experienceLevel: params.experienceLevel,
        questionEvaluations: params.questionEvaluations,
        previousSessions: params.previousSessions,
      },
      generatedReportSchema,
      "generated_report",
      "Produce the final interview report as structured JSON grounded in the per-question evaluations. Never invent evidence."
    );
  }

  async generateStudyPlan(params: GenerateStudyPlanParams): Promise<GeneratedStudyPlan> {
    return runStructured(
      "study_plan_generator",
      {
        technology: params.technology,
        weakestAreas: params.weakestAreas,
        criticalGaps: params.criticalGaps,
      },
      generatedStudyPlanSchema,
      "generated_study_plan",
      "Produce a concrete 7-day and 30-day study plan as structured JSON."
    );
  }

  async generateCodingChallenge(params: GenerateCodingChallengeParams): Promise<GeneratedCodingChallenge> {
    return runStructured(
      "coding_challenge_generator",
      {
        difficulty: params.difficulty,
        languages: params.languages,
        topicHint: params.topicHint ?? "general algorithms / data structures",
      },
      generatedCodingChallengeSchema,
      "generated_coding_challenge",
      [
        "Generate ONE original coding interview challenge as structured JSON.",
        "Include stdin/stdout style I/O so automated tests can grade solutions.",
        "Provide at least 2 visible and 1 hidden test cases with exact expected outputs.",
        "Starter code must compile/run as stubs that throw TODO — one entry per requested language.",
        "Do not reuse famous leetcode titles verbatim if possible; invent a clear variant.",
        "",
        `Difficulty: ${params.difficulty}`,
        `Languages: ${params.languages.join(", ")}`,
        `Topic hint: ${params.topicHint ?? "general algorithms"}`,
      ].join("\n")
    );
  }
}
