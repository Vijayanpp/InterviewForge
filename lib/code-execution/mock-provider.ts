import type {
  CodeExecutionProvider,
  RunCodeParams,
  RunCodeResult,
  ExecutionStatus,
} from "@/lib/code-execution/provider";

/**
 * Deterministic stdin → expected stdout fixtures for seeded challenges.
 * Keys are challenge slugs. Used when `CODE_EXECUTION_PROVIDER=mock` so
 * local/CI grading works without Judge0.
 *
 * A submission "passes" a case when the mock decides the source looks like a
 * real solution (contains `SOLUTION` marker OR is longer than the starter
 * and doesn't look like a stub) AND the fixture maps stdin → expected output.
 * For unknown challenges, comparing against `expectedOutput` with the same
 * SOLUTION heuristic still works.
 */
const FIXTURES: Record<string, Record<string, string>> = {
  "two-sum": {
    "2 7 11 15\n9": "0 1",
    "3 2 4\n6": "1 2",
    "3 3\n6": "0 1",
  },
  "reverse-string": {
    hello: "olleh",
    InterviewForge: "egroFweivretnI",
    a: "a",
  },
  fizzbuzz: {
    "5": "1\n2\nFizz\n4\nBuzz",
    "15": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
  },
  "valid-parentheses": {
    "()": "true",
    "()[]{}": "true",
    "(]": "false",
    "([)]": "false",
    "{[]}": "true",
  },
  "palindrome-number": {
    "121": "true",
    "-121": "false",
    "10": "false",
  },
  "max-subarray": {
    "-2 1 -3 4 -1 2 1 -5 4": "6",
    "1": "1",
    "5 4 -1 7 8": "23",
  },
};

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").trimEnd();
}

function looksLikeSolution(sourceCode: string): boolean {
  const code = sourceCode.trim();
  if (code.includes("SOLUTION")) return true;
  // Reject common starter stubs that just throw / return empty.
  if (/throw new Error|NotImplemented|pass\s*$|TODO|FIXME/i.test(code) && code.length < 400) {
    return false;
  }
  return code.length >= 80;
}

function statusForMismatch(hasSolution: boolean): ExecutionStatus {
  return hasSolution ? "wrong_answer" : "runtime_error";
}

export class MockCodeExecutionProvider implements CodeExecutionProvider {
  readonly name = "mock" as const;

  async run(params: RunCodeParams): Promise<RunCodeResult> {
    const stdin = normalize(params.stdin);
    const hasSolution = looksLikeSolution(params.sourceCode);
    const started = Date.now();

    let expected =
      params.expectedOutput !== undefined ? normalize(params.expectedOutput) : undefined;

    if (expected === undefined && params.challengeSlug) {
      const map = FIXTURES[params.challengeSlug];
      if (map && stdin in map) {
        expected = normalize(map[stdin]!);
      }
    }

    // If we still don't know expected output, accept when SOLUTION marker present.
    if (expected === undefined) {
      if (hasSolution) {
        return {
          stdout: stdin,
          stderr: "",
          status: "accepted",
          timeMs: Date.now() - started,
          memoryKb: 1024,
        };
      }
      return {
        stdout: "",
        stderr: "Mock runner: source does not look like a completed solution.",
        status: "runtime_error",
        timeMs: Date.now() - started,
        memoryKb: 512,
      };
    }

    if (!hasSolution) {
      return {
        stdout: "",
        stderr: "Mock runner: incomplete solution (add a working implementation or SOLUTION marker).",
        status: statusForMismatch(false),
        timeMs: Date.now() - started,
        memoryKb: 512,
      };
    }

    // Deterministic "execution": produce the expected stdout when solution is present.
    // (Real execution happens only via Judge0.)
    const stdout = expected;
    const matches = normalize(stdout) === expected;

    return {
      stdout,
      stderr: matches ? "" : `Expected:\n${expected}\nGot:\n${stdout}`,
      status: matches ? "accepted" : "wrong_answer",
      timeMs: Date.now() - started + 5,
      memoryKb: 2048,
    };
  }
}

/** Exported for unit tests. */
export const MOCK_CODING_FIXTURES = FIXTURES;
