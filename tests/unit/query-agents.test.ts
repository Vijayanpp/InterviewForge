import { describe, expect, it } from "vitest";
import { expandQueryMock } from "@/lib/agents/query-expander";
import { decomposeQueryMock } from "@/lib/agents/query-decomposer";
import { generateSearchQueriesMock } from "@/lib/agents/multi-query-generator";
import {
  multiQueryResultSchema,
  queryDecompositionSchema,
  queryExpansionSchema,
} from "@/lib/agents/schemas/query";

describe("query expansion", () => {
  it("adds related terms for a performance question", () => {
    const result = expandQueryMock("How do I fix a slow API?");
    expect(queryExpansionSchema.parse(result).terms.length).toBeGreaterThan(0);
    expect(result.expandedQuery.toLowerCase()).toContain("slow api");
  });

  it("falls back to generic terms when nothing matches", () => {
    const result = expandQueryMock("Tell me about yourself");
    expect(result.terms).toContain("best practices");
  });
});

describe("query decomposition", () => {
  it("keeps a simple objective as one question", () => {
    const result = decomposeQueryMock("Explain React hooks.");
    expect(queryDecompositionSchema.parse(result).requiresDecomposition).toBe(false);
    expect(result.subQuestions).toHaveLength(1);
  });

  it("splits a compound compare-and-contrast objective", () => {
    const result = decomposeQueryMock(
      "Compare React and Vue, explain their performance, learning curve, and enterprise suitability."
    );
    expect(result.requiresDecomposition).toBe(true);
    expect(result.subQuestions.length).toBeGreaterThan(1);
  });

  it("falls back to the original objective when splitting yields nothing", () => {
    const result = decomposeQueryMock("OK");
    expect(result.subQuestions[0]?.question).toBe("OK");
  });
});

describe("multi-query generation", () => {
  it("creates multiple retrieval angles for one question", () => {
    const result = generateSearchQueriesMock("How can I improve application performance?", 4);
    expect(multiQueryResultSchema.parse(result).queries.length).toBeGreaterThanOrEqual(2);
    const unique = new Set(result.queries.map((item) => item.query));
    expect(unique.size).toBe(result.queries.length);
  });
});
