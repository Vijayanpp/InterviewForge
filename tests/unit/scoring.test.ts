import { describe, expect, it } from "vitest";
import {
  computeWeightedScore,
  decideNextAction,
  recommendationForScore,
  toOverallScore,
  topicCoverageAverages,
  updateTopicCoverage,
  DEFAULT_CATEGORY_WEIGHTS,
} from "@/lib/services/scoring";

describe("computeWeightedScore", () => {
  it("returns 0 when no scores are present", () => {
    expect(computeWeightedScore({})).toBe(0);
  });

  it("computes the default-weighted average across all five categories", () => {
    const score = computeWeightedScore({
      technicalAccuracy: 8,
      depth: 7,
      clarity: 9,
      completeness: 6,
      problemSolving: 5,
    });
    // (8*0.4 + 7*0.25 + 9*0.15 + 6*0.15 + 5*0.05) / 1 = 7.5
    expect(score).toBeCloseTo(7.5, 1);
  });

  it("renormalizes weights when a category is missing (e.g. conceptual questions)", () => {
    const score = computeWeightedScore({ technicalAccuracy: 10, depth: 10, clarity: 10, completeness: 10 });
    // Missing problemSolving (0.05 weight): total weight = 0.95, weighted sum = 9.5 -> 10
    expect(score).toBeCloseTo(10, 1);
  });

  it("falls back to a plain average if custom weights are all zero", () => {
    const score = computeWeightedScore(
      { technicalAccuracy: 4, depth: 8 },
      { technicalAccuracy: 0, depth: 0 }
    );
    expect(score).toBe(6);
  });

  it("clamps to one decimal place", () => {
    const score = computeWeightedScore({ technicalAccuracy: 7.777 }, { technicalAccuracy: 1 });
    expect(score).toBe(7.8);
  });

  it("uses the exported default weights (sanity check they sum to 1)", () => {
    const total = Object.values(DEFAULT_CATEGORY_WEIGHTS).reduce((sum, w) => sum + w, 0);
    expect(total).toBeCloseTo(1, 5);
  });
});

describe("toOverallScore", () => {
  it("returns 0 for an empty list", () => {
    expect(toOverallScore([])).toBe(0);
  });

  it("scales a 0-10 average up to a 0-100 score", () => {
    expect(toOverallScore([8, 6, 7])).toBe(70);
  });

  it("rounds to the nearest integer", () => {
    expect(toOverallScore([7.25])).toBe(73);
  });
});

describe("recommendationForScore", () => {
  it.each([
    [95, "strong_hire"],
    [80, "strong_hire"],
    [79, "hire"],
    [65, "hire"],
    [64, "borderline"],
    [45, "borderline"],
    [44, "not_ready_yet"],
    [0, "not_ready_yet"],
  ] as const)("maps score %i to %s", (score, expected) => {
    expect(recommendationForScore(score)).toBe(expected);
  });
});

describe("updateTopicCoverage / topicCoverageAverages", () => {
  it("creates a new entry for a topic seen for the first time", () => {
    const coverage = updateTopicCoverage([], "Closures", 8);
    expect(coverage).toEqual([{ topic: "Closures", totalScore: 8, count: 1 }]);
  });

  it("accumulates scores for a topic seen multiple times", () => {
    let coverage = updateTopicCoverage([], "Closures", 8);
    coverage = updateTopicCoverage(coverage, "Closures", 6);
    expect(coverage).toEqual([{ topic: "Closures", totalScore: 14, count: 2 }]);
  });

  it("keeps separate running totals per topic", () => {
    let coverage = updateTopicCoverage([], "Closures", 8);
    coverage = updateTopicCoverage(coverage, "Hooks", 4);
    expect(coverage).toHaveLength(2);
  });

  it("averages per topic and rounds to one decimal", () => {
    let coverage = updateTopicCoverage([], "Closures", 7);
    coverage = updateTopicCoverage(coverage, "Closures", 8);
    const averages = topicCoverageAverages(coverage);
    expect(averages).toEqual([{ topic: "Closures", score: 7.5 }]);
  });
});

describe("decideNextAction", () => {
  const base = {
    remainingMinutes: 20,
    questionsAsked: 2,
    minQuestions: 4,
    maxQuestions: 12,
    lastWeightedScore: 8,
    wasFollowUp: false,
  };

  it("ends the interview when time is essentially up", () => {
    expect(decideNextAction({ ...base, remainingMinutes: 0.2 })).toBe("end");
  });

  it("ends the interview when the max question count is reached", () => {
    expect(decideNextAction({ ...base, questionsAsked: 12 })).toBe("end");
  });

  it("asks a follow-up when the last score is below the threshold and it wasn't already a follow-up", () => {
    expect(decideNextAction({ ...base, lastWeightedScore: 4 })).toBe("follow_up");
  });

  it("does not chain a second follow-up in a row", () => {
    expect(decideNextAction({ ...base, lastWeightedScore: 4, wasFollowUp: true })).toBe("next_question");
  });

  it("respects a custom follow-up threshold", () => {
    expect(decideNextAction({ ...base, lastWeightedScore: 7, followUpThreshold: 8 })).toBe("follow_up");
  });

  it("ends once the minimum question count is met and little time remains", () => {
    expect(
      decideNextAction({ ...base, questionsAsked: 4, remainingMinutes: 0.9, lastWeightedScore: 9 })
    ).toBe("end");
  });

  it("otherwise continues to the next question", () => {
    expect(decideNextAction(base)).toBe("next_question");
  });
});
