import { describe, expect, it } from "vitest";
import { MockCodeExecutionProvider } from "@/lib/code-execution/mock-provider";
import { computeWeightedScore } from "@/lib/services/coding-scoring";
import { toCandidateFacingChallenge } from "@/types/domain/coding";
import type { CodingChallenge, CodingTestCase } from "@/types/domain/coding";

describe("MockCodeExecutionProvider", () => {
  const provider = new MockCodeExecutionProvider();

  it("rejects incomplete starter stubs", async () => {
    const result = await provider.run({
      language: "javascript",
      sourceCode: 'throw new Error("TODO");\n',
      stdin: "hello",
      expectedOutput: "olleh",
      challengeSlug: "reverse-string",
    });
    expect(result.status).not.toBe("accepted");
  });

  it("accepts SOLUTION marker and returns fixture stdout for reverse-string", async () => {
    const result = await provider.run({
      language: "javascript",
      sourceCode: "// SOLUTION\nfunction reverse(s){ return s.split('').reverse().join(''); }\n",
      stdin: "hello",
      challengeSlug: "reverse-string",
    });
    expect(result.status).toBe("accepted");
    expect(result.stdout.trim()).toBe("olleh");
  });

  it("grades two-sum fixtures by slug", async () => {
    const result = await provider.run({
      language: "python",
      sourceCode: "SOLUTION\n" + "x".repeat(80),
      stdin: "2 7 11 15\n9",
      challengeSlug: "two-sum",
    });
    expect(result.status).toBe("accepted");
    expect(result.stdout.trim()).toBe("0 1");
  });

  it("accepts long non-stub source against expectedOutput", async () => {
    const result = await provider.run({
      language: "javascript",
      sourceCode: "function reverse(s){ return [...s].reverse().join(''); }\n".repeat(3),
      stdin: "ab",
      expectedOutput: "ba",
    });
    expect(result.status).toBe("accepted");
    expect(result.stdout.trim()).toBe("ba");
  });

  it("is deterministic across runs", async () => {
    const params = {
      language: "javascript" as const,
      sourceCode: "SOLUTION\n" + "y".repeat(80),
      stdin: "()",
      challengeSlug: "valid-parentheses",
    };
    const a = await provider.run(params);
    const b = await provider.run(params);
    expect(a.status).toBe(b.status);
    expect(a.stdout).toBe(b.stdout);
  });
});

describe("computeWeightedScore (coding)", () => {
  const cases = [
    { id: "a", weight: 1 },
    { id: "b", weight: 1 },
    { id: "c", weight: 2 },
  ] as Pick<CodingTestCase, "id" | "weight">[];

  it("returns 0 for empty cases", () => {
    expect(computeWeightedScore([], new Set())).toBe(0);
  });

  it("scores by weight", () => {
    // pass a + c = weight 3 / 4 = 75
    expect(computeWeightedScore(cases, new Set(["a", "c"]))).toBe(75);
  });

  it("returns 100 when all pass", () => {
    expect(computeWeightedScore(cases, new Set(["a", "b", "c"]))).toBe(100);
  });
});

describe("toCandidateFacingChallenge", () => {
  const challenge = {
    id: "11111111-1111-1111-1111-111111111111",
    technology_id: null,
    topic_id: null,
    title: "Reverse String",
    slug: "reverse-string",
    problem_statement: "Reverse it",
    difficulty: "easy",
    examples: [{ input: "ab", output: "ba" }],
    constraints: null,
    starter_code: { javascript: "// ..." },
    supported_languages: ["javascript"],
    expected_time_complexity: "O(n)",
    expected_space_complexity: "O(n)",
    rubric: {},
    time_limit_ms: 2000,
    memory_limit_mb: 256,
    status: "approved",
    created_by: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as CodingChallenge;

  it("strips hidden-test data and only exposes visibleTestCount", () => {
    const dto = toCandidateFacingChallenge(challenge, 2);
    expect(dto.visibleTestCount).toBe(2);
    expect(dto).not.toHaveProperty("testCases");
    expect(JSON.stringify(dto)).not.toMatch(/is_hidden|expected_output|isHidden/);
    expect(dto.slug).toBe("reverse-string");
    expect(dto.starterCode.javascript).toBe("// ...");
  });
});
