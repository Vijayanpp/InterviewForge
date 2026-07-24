import "server-only";
import { resolveCodeExecutionProviderName } from "@/lib/env";
import type { CodeExecutionProvider } from "@/lib/code-execution/provider";
import { MockCodeExecutionProvider } from "@/lib/code-execution/mock-provider";
import { Judge0CodeExecutionProvider } from "@/lib/code-execution/judge0-provider";

let cachedProvider: CodeExecutionProvider | undefined;

/**
 * Resolves the active code-execution backend. Defaults to mock whenever
 * Judge0 is not configured, so local/CI never need a sandbox service.
 */
export function getCodeExecutionProvider(): CodeExecutionProvider {
  if (cachedProvider) return cachedProvider;

  const name = resolveCodeExecutionProviderName();
  cachedProvider =
    name === "judge0" ? new Judge0CodeExecutionProvider() : new MockCodeExecutionProvider();
  return cachedProvider;
}

export type { CodeExecutionProvider, RunCodeParams, RunCodeResult } from "@/lib/code-execution/provider";
export {
  CODING_LANGUAGES,
  CODING_LANGUAGE_LABELS,
  MONACO_LANGUAGE_IDS,
  isCodingLanguage,
  type CodingLanguage,
} from "@/lib/code-execution/languages";
