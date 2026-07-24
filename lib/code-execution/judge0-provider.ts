import "server-only";
import { getServerEnv } from "@/lib/env";
import { AiProviderError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { JUDGE0_LANGUAGE_IDS } from "@/lib/code-execution/languages";
import type {
  CodeExecutionProvider,
  ExecutionStatus,
  RunCodeParams,
  RunCodeResult,
} from "@/lib/code-execution/provider";

interface Judge0SubmissionResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status?: { id: number; description: string };
}

function mapJudge0Status(id: number | undefined): ExecutionStatus {
  switch (id) {
    case 3:
      return "accepted";
    case 4:
      return "wrong_answer";
    case 5:
      return "time_limit";
    case 6:
      return "compilation_error";
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return "runtime_error";
    case 13:
      return "internal_error";
    case 14:
      return "wrong_answer"; // Wrong Answer / Runtime may vary by version
    default:
      return "internal_error";
  }
}

/**
 * Judge0 CE client. Uses `wait=true` when available so a single POST returns
 * the finished result; falls back to a short poll otherwise.
 */
export class Judge0CodeExecutionProvider implements CodeExecutionProvider {
  readonly name = "judge0" as const;

  async run(params: RunCodeParams): Promise<RunCodeResult> {
    const env = getServerEnv();
    if (!env.JUDGE0_URL) {
      throw new AiProviderError("JUDGE0_URL is not configured.");
    }

    const base = env.JUDGE0_URL.replace(/\/$/, "");
    const languageId = JUDGE0_LANGUAGE_IDS[params.language];
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (env.JUDGE0_AUTH_TOKEN) {
      headers[env.JUDGE0_AUTH_HEADER] = env.JUDGE0_AUTH_TOKEN;
    }

    const body = {
      source_code: params.sourceCode,
      language_id: languageId,
      stdin: params.stdin,
      expected_output: params.expectedOutput,
      cpu_time_limit: params.timeLimitMs ? params.timeLimitMs / 1000 : 2,
      memory_limit: params.memoryLimitMb ? params.memoryLimitMb * 1000 : 256000,
    };

    try {
      const res = await fetch(`${base}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        logger.error({ status: res.status, text }, "Judge0 submission failed");
        throw new AiProviderError(`Judge0 returned HTTP ${res.status}.`);
      }

      const data = (await res.json()) as Judge0SubmissionResponse;
      return {
        stdout: data.stdout ?? "",
        stderr: data.stderr ?? data.message ?? "",
        compileOutput: data.compile_output ?? undefined,
        status: mapJudge0Status(data.status?.id),
        timeMs: data.time ? Math.round(parseFloat(data.time) * 1000) : null,
        memoryKb: data.memory ?? null,
      };
    } catch (err) {
      if (err instanceof AiProviderError) throw err;
      logger.error({ err }, "Judge0 request error");
      throw new AiProviderError("Failed to reach the Judge0 execution service.");
    }
  }
}
