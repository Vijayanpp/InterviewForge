import type { CodingLanguage } from "@/lib/code-execution/languages";

export type ExecutionStatus =
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "compilation_error"
  | "time_limit"
  | "memory_limit"
  | "internal_error";

export interface RunCodeParams {
  language: CodingLanguage;
  sourceCode: string;
  stdin: string;
  /** Optional expected output — used by the mock provider for deterministic grading. */
  expectedOutput?: string;
  /** Optional challenge slug — mock fixtures can key off this. */
  challengeSlug?: string;
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

export interface RunCodeResult {
  stdout: string;
  stderr: string;
  status: ExecutionStatus;
  timeMs: number | null;
  memoryKb: number | null;
  compileOutput?: string;
}

/**
 * Swappable sandboxed runner. `MockCodeExecutionProvider` is the default
 * (zero-config, CI-safe). `Judge0CodeExecutionProvider` talks to a Judge0
 * CE / RapidAPI endpoint when configured.
 */
export interface CodeExecutionProvider {
  readonly name: "mock" | "judge0";
  run(params: RunCodeParams): Promise<RunCodeResult>;
}
