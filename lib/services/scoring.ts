import type { HireRecommendation } from "@/types/domain/enums";

export interface CategoryScores {
  technicalAccuracy?: number;
  depth?: number;
  clarity?: number;
  completeness?: number;
  problemSolving?: number;
}

export const DEFAULT_CATEGORY_WEIGHTS: Required<CategoryScores> = {
  technicalAccuracy: 0.4,
  depth: 0.25,
  clarity: 0.15,
  completeness: 0.15,
  problemSolving: 0.05,
};

/**
 * Renormalized weighted average (0-10) across whichever category scores a
 * question type actually produced (e.g. a conceptual question may have no
 * `problemSolving` score). Falls back to a plain average if every weight
 * present sums to zero (shouldn't happen with the defaults, but keeps this
 * pure function total).
 */
export function computeWeightedScore(
  scores: CategoryScores,
  weights: CategoryScores = DEFAULT_CATEGORY_WEIGHTS
): number {
  const entries = Object.entries(scores).filter(
    ([, value]) => typeof value === "number" && Number.isFinite(value)
  ) as Array<[keyof CategoryScores, number]>;

  if (entries.length === 0) return 0;

  const totalWeight = entries.reduce((sum, [key]) => sum + (weights[key] ?? 0), 0);

  if (totalWeight <= 0) {
    const avg = entries.reduce((sum, [, value]) => sum + value, 0) / entries.length;
    return roundTo(avg, 1);
  }

  const weighted = entries.reduce((sum, [key, value]) => sum + value * (weights[key] ?? 0), 0);
  return roundTo(weighted / totalWeight, 1);
}

/** Average of per-question weighted scores (0-10 scale) -> overall score on a 0-100 scale. */
export function toOverallScore(weightedScores: number[]): number {
  if (weightedScores.length === 0) return 0;
  const avg = weightedScores.reduce((sum, s) => sum + s, 0) / weightedScores.length;
  return Math.round(avg * 10);
}

export function recommendationForScore(overallScore: number): HireRecommendation {
  if (overallScore >= 80) return "strong_hire";
  if (overallScore >= 65) return "hire";
  if (overallScore >= 45) return "borderline";
  return "not_ready_yet";
}

export interface TopicRunningScore {
  topic: string;
  totalScore: number;
  count: number;
}

/** Running per-topic average (0-10 scale), used to steer adaptive question selection. */
export function updateTopicCoverage(
  coverage: TopicRunningScore[],
  topic: string,
  weightedScore: number
): TopicRunningScore[] {
  const existing = coverage.find((entry) => entry.topic === topic);
  if (!existing) {
    return [...coverage, { topic, totalScore: weightedScore, count: 1 }];
  }
  return coverage.map((entry) =>
    entry.topic === topic
      ? { ...entry, totalScore: entry.totalScore + weightedScore, count: entry.count + 1 }
      : entry
  );
}

export function topicCoverageAverages(coverage: TopicRunningScore[]): Array<{ topic: string; score: number }> {
  return coverage.map((entry) => ({ topic: entry.topic, score: roundTo(entry.totalScore / entry.count, 1) }));
}

export interface AdaptiveDecisionInput {
  remainingMinutes: number;
  questionsAsked: number;
  minQuestions: number;
  maxQuestions: number;
  lastWeightedScore: number;
  wasFollowUp: boolean;
  followUpThreshold?: number;
}

export type AdaptiveDecision = "follow_up" | "next_question" | "end";

/**
 * Decides what the interview engine should do after grading an answer.
 * Kept pure and dependency-free so it's trivially unit-testable.
 */
export function decideNextAction(input: AdaptiveDecisionInput): AdaptiveDecision {
  const threshold = input.followUpThreshold ?? 6;

  if (input.remainingMinutes <= 0.5 || input.questionsAsked >= input.maxQuestions) {
    return "end";
  }

  if (
    !input.wasFollowUp &&
    input.lastWeightedScore < threshold &&
    input.questionsAsked < input.maxQuestions
  ) {
    return "follow_up";
  }

  if (input.questionsAsked >= input.minQuestions && input.remainingMinutes <= 1) {
    return "end";
  }

  return "next_question";
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
