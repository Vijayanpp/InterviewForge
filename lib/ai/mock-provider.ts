import type {
  AiProvider,
  EvaluateAnswerParams,
  GenerateCodingChallengeParams,
  GenerateFollowUpParams,
  GenerateQuestionParams,
  GenerateReportParams,
  GenerateStudyPlanParams,
} from "@/lib/ai/provider";
import type {
  GeneratedCodingChallenge,
  GeneratedEvaluation,
  GeneratedQuestion,
  GeneratedReport,
  GeneratedStudyPlan,
} from "@/lib/ai/schemas";
import {
  generatedCodingChallengeSchema,
  generatedEvaluationSchema,
  generatedQuestionSchema,
  generatedReportSchema,
  generatedStudyPlanSchema,
} from "@/lib/ai/schemas";
import { defaultStarterCode, type CodingLanguage } from "@/lib/code-execution/languages";
import { buildOpeningQuestion, shouldUseOpeningQuestion } from "@/lib/ai/opening-question";
import type { QuestionType } from "@/types/domain/enums";

const QUESTION_TYPE_ROTATION: QuestionType[] = [
  "conceptual",
  "scenario_based",
  "debugging",
  "output_prediction",
  "code_review",
  "architecture",
];

function pickTopic(params: GenerateQuestionParams): string {
  if (params.topicCoverage.length > 0) {
    const weakest = [...params.topicCoverage].sort((a, b) => a.score - b.score)[0];
    if (weakest) return weakest.topic;
  }
  return params.topics[0] ?? params.technology;
}

function buildQuestion(
  technology: string,
  topic: string,
  difficulty: GenerateQuestionParams["difficulty"],
  questionType: QuestionType,
  index: number
): GeneratedQuestion {
  const prompts: Record<QuestionType, string> = {
    conceptual: `Explain how ${topic} works in ${technology} and why it matters in production code.`,
    scenario_based: `You're building a feature that relies on ${topic} in ${technology}. Walk through your approach, including trade-offs.`,
    debugging: `A teammate's ${technology} code misuses ${topic} and is causing a subtle bug in production. How would you investigate and fix it?`,
    output_prediction: `Given a small ${technology} snippet that exercises ${topic}, what would the output be, and why?`,
    code_review: `Review a pull request that introduces ${topic} in a ${technology} codebase. What would you flag?`,
    architecture: `How would you architect a system component that depends heavily on ${topic} within a ${technology} stack, at scale?`,
    multiple_choice: `Which statement about ${topic} in ${technology} is correct?`,
    behavioural: `Tell me about a time you had to learn ${topic} quickly to ship a ${technology} feature.`,
    project_experience: `Describe a project where ${topic} in ${technology} was central to the solution.`,
    system_design: `Design a system where ${topic} is a first-class concern, using ${technology} where relevant.`,
    coding_challenge: `Write a short ${technology} function that demonstrates correct use of ${topic}.`,
  };

  return {
    title: `${topic} — Question ${index + 1}`,
    body: prompts[questionType],
    questionType,
    difficulty,
    expectedConcepts: [topic, `${technology} best practices`, "trade-offs", "edge cases"],
    idealAnswer: `A strong answer covers ${topic} in ${technology} with trade-offs and a concrete example.`,
    rubric: {
      technicalAccuracyWeight: 0.4,
      depthWeight: 0.25,
      clarityWeight: 0.15,
      completenessWeight: 0.2,
      notes: `Mock rubric for ${topic}.`,
    },
  };
}

function scoreAnswer(params: EvaluateAnswerParams): GeneratedEvaluation {
  const answer = params.candidateAnswer.trim();
  const lowerAnswer = answer.toLowerCase();

  const hits = params.expectedConcepts.filter((concept) =>
    lowerAnswer.includes(concept.toLowerCase().split(" ")[0] ?? "")
  ).length;

  const lengthSignal = Math.min(answer.length / 400, 1);
  const conceptSignal = params.expectedConcepts.length > 0 ? hits / params.expectedConcepts.length : 0.5;
  const base = 3 + lengthSignal * 3 + conceptSignal * 4;
  const weightedScore = Math.max(0, Math.min(10, Math.round(base * 10) / 10));

  const missingPoints = params.expectedConcepts.filter(
    (concept) => !lowerAnswer.includes(concept.toLowerCase().split(" ")[0] ?? "")
  );

  return {
    scores: {
      technicalAccuracy: weightedScore,
      depth: Math.max(0, weightedScore - 0.5),
      clarity: Math.min(10, weightedScore + 0.3),
      completeness: conceptSignal * 10,
      problemSolving: null,
    },
    weightedScore,
    strengths:
      answer.length > 40
        ? ["Communicated a clear line of reasoning.", "Addressed the core of the question."]
        : ["Attempted the question."],
    missingPoints: missingPoints.length > 0 ? missingPoints : [],
    incorrectStatements: [],
    idealAnswer: `A strong answer would cover: ${params.expectedConcepts.join(", ")}, with a concrete example.`,
    improvementAdvice:
      missingPoints.length > 0
        ? `Try to explicitly address: ${missingPoints.join(", ")}.`
        : "Solid answer — consider adding a concrete example next time for extra depth.",
    followUpQuestion:
      weightedScore < 6 ? `Can you go a bit deeper on ${params.expectedConcepts[0] ?? "this topic"}?` : null,
    evaluatorConfidence: 0.75,
  };
}

export class MockAiProvider implements AiProvider {
  readonly name = "mock" as const;

  async generateQuestion(params: GenerateQuestionParams): Promise<GeneratedQuestion> {
    if (shouldUseOpeningQuestion(params)) {
      return buildOpeningQuestion(params);
    }
    const topic = pickTopic(params);
    const index = params.previousQuestions.length;
    const questionType = QUESTION_TYPE_ROTATION[index % QUESTION_TYPE_ROTATION.length]!;
    const question = buildQuestion(params.technology, topic, params.difficulty, questionType, index);
    return generatedQuestionSchema.parse(question);
  }

  async generateFollowUp(params: GenerateFollowUpParams): Promise<GeneratedQuestion> {
    const topic = pickTopic(params);
    const question = buildQuestion(
      params.technology,
      topic,
      params.difficulty,
      "scenario_based",
      params.previousQuestions.length
    );
    return generatedQuestionSchema.parse({
      ...question,
      title: `Follow-up: ${topic}`,
      body: `Following up on your last answer — ${question.body}`,
    });
  }

  async evaluateAnswer(params: EvaluateAnswerParams): Promise<GeneratedEvaluation> {
    return generatedEvaluationSchema.parse(scoreAnswer(params));
  }

  async generateReport(params: GenerateReportParams): Promise<GeneratedReport> {
    const evaluations = params.questionEvaluations;
    const overallScore =
      evaluations.length > 0
        ? Math.round(
            (evaluations.reduce((sum, e) => sum + e.weightedScore, 0) / evaluations.length) * 10
          )
        : 50;

    const topicMap = new Map<string, { total: number; count: number }>();
    for (const evaluation of evaluations) {
      const name = evaluation.topicName ?? params.technology;
      const existing = topicMap.get(name) ?? { total: 0, count: 0 };
      existing.total += evaluation.weightedScore * 10;
      existing.count += 1;
      topicMap.set(name, existing);
    }

    const topicScores = Array.from(topicMap.entries()).map(([topicName, { total, count }]) => ({
      topicId: null,
      topicName,
      score: Math.round(total / count),
    }));

    const weakestAreas = [...topicScores].sort((a, b) => a.score - b.score).slice(0, 3);
    const strongestAreas = [...topicScores].sort((a, b) => b.score - a.score).slice(0, 3);

    const hireRecommendation =
      overallScore >= 80
        ? "strong_hire"
        : overallScore >= 65
          ? "hire"
          : overallScore >= 45
            ? "borderline"
            : "not_ready_yet";

    const previous = params.previousSessions[0];

    const report: GeneratedReport = {
      overallScore,
      hireRecommendation,
      recommendationRationale: `Based on ${evaluations.length} answered question(s) averaging ${overallScore}/100 for a ${params.experienceLevel} ${params.technology} candidate.`,
      technicalScore: overallScore,
      communicationScore: Math.max(0, overallScore - 5),
      problemSolvingScore: overallScore,
      codingScore: null,
      topicScores,
      strengths: strongestAreas.map((t) => `Strong performance in ${t.topicName} (${t.score}/100).`),
      weaknesses: weakestAreas.map((t) => `Needs improvement in ${t.topicName} (${t.score}/100).`),
      criticalGaps: weakestAreas.filter((t) => t.score < 50).map((t) => t.topicName),
      sevenDayPlan: buildStudyPlan(weakestAreas.map((t) => t.topicName), 7),
      thirtyDayPlan: buildStudyPlan(weakestAreas.map((t) => t.topicName), 30),
      recommendedNext: {
        interviewType: params.interviewType,
        technology: params.technology,
        topics: weakestAreas.map((t) => t.topicName),
        reason: "Focus your next session on the topics where you scored lowest this time.",
      },
      comparisonWithPrevious: previous
        ? {
            previousSessionId: previous.sessionId,
            previousScore: previous.overallScore,
            currentScore: overallScore,
            delta: overallScore - previous.overallScore,
            narrative:
              overallScore >= previous.overallScore
                ? `Improved by ${overallScore - previous.overallScore} points since your last ${params.technology} interview.`
                : `Down ${previous.overallScore - overallScore} points from your last ${params.technology} interview — review the topics below.`,
          }
        : null,
    };

    return generatedReportSchema.parse(report);
  }

  async generateStudyPlan(params: GenerateStudyPlanParams): Promise<GeneratedStudyPlan> {
    const focusAreas = params.criticalGaps.length > 0 ? params.criticalGaps : params.weakestAreas;
    return generatedStudyPlanSchema.parse({
      sevenDayPlan: buildStudyPlan(focusAreas, 7),
      thirtyDayPlan: buildStudyPlan(focusAreas, 30),
    });
  }

  async generateCodingChallenge(params: GenerateCodingChallengeParams): Promise<GeneratedCodingChallenge> {
    const languages: CodingLanguage[] =
      params.languages.length > 0 ? params.languages : ["javascript"];
    const starterCode = languages.map((language) => ({
      language,
      code: defaultStarterCode(language),
    }));

    return generatedCodingChallengeSchema.parse({
      title: params.difficulty === "hard" ? "Longest Unique Substring" : "Reverse Words",
      problemStatement:
        params.difficulty === "hard"
          ? "## Longest Substring Without Repeating Characters\n\nGiven a string `s`, find the length of the longest substring without repeating characters.\n\n### Input\nA single line containing the string.\n\n### Output\nA single integer — the length."
          : "## Reverse Words\n\nGiven a sentence, reverse the order of words (words separated by spaces).\n\n### Input\nA single line of text.\n\n### Output\nThe words in reverse order, separated by a single space.",
      difficulty: params.difficulty,
      examples:
        params.difficulty === "hard"
          ? [
              { input: "abcabcbb", output: "3", explanation: "The answer is \"abc\" with length 3." },
              { input: "bbbbb", output: "1", explanation: null },
            ]
          : [
              { input: "hello world", output: "world hello", explanation: null },
              { input: "Interview Forge", output: "Forge Interview", explanation: null },
            ],
      constraints: "1 <= input length <= 10^4",
      supportedLanguages: [...languages],
      starterCode,
      testCases:
        params.difficulty === "hard"
          ? [
              { input: "abcabcbb", expectedOutput: "3", isHidden: false, weight: 1 },
              { input: "bbbbb", expectedOutput: "1", isHidden: false, weight: 1 },
              { input: "pwwkew", expectedOutput: "3", isHidden: true, weight: 1.5 },
            ]
          : [
              { input: "hello world", expectedOutput: "world hello", isHidden: false, weight: 1 },
              { input: "Interview Forge", expectedOutput: "Forge Interview", isHidden: false, weight: 1 },
              { input: "a", expectedOutput: "a", isHidden: true, weight: 1 },
            ],
      expectedTimeComplexity: "O(n)",
      expectedSpaceComplexity: "O(n)",
    });
  }
}

function buildStudyPlan(focusAreas: string[], days: 7 | 30) {
  const areas = focusAreas.length > 0 ? focusAreas : ["core fundamentals"];
  const step = days === 7 ? 1 : 5;
  const items = [];
  for (let day = 1; day <= days; day += step) {
    const focus = areas[Math.floor((day / step) % areas.length)] ?? areas[0]!;
    items.push({
      day,
      focus: `Deepen understanding of ${focus}`,
      tasks: [
        `Read one in-depth article or docs section on ${focus}.`,
        `Build or extend a small example exercising ${focus}.`,
        `Write 3-5 flashcards / notes summarizing key gotchas in ${focus}.`,
      ],
    });
  }
  return items;
}
