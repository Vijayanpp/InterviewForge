import "server-only";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

let configured = false;

/**
 * Mirror Business-Research LangSmith env so LangChain + LangGraph
 * emit traces when a key is present. No-op in mock/CI.
 */
export function configureLangSmith(): void {
  if (configured) return;
  configured = true;

  const env = getServerEnv();
  if (!env.LANGSMITH_TRACING || !env.LANGSMITH_API_KEY?.trim()) {
    return;
  }

  process.env.LANGSMITH_TRACING = "true";
  process.env.LANGCHAIN_TRACING_V2 = "true";
  process.env.LANGSMITH_API_KEY = env.LANGSMITH_API_KEY;
  process.env.LANGCHAIN_API_KEY = env.LANGSMITH_API_KEY;
  process.env.LANGSMITH_PROJECT = env.LANGSMITH_PROJECT;
  process.env.LANGCHAIN_PROJECT = env.LANGSMITH_PROJECT;
  process.env.LANGSMITH_ENDPOINT = env.LANGSMITH_ENDPOINT;
  process.env.LANGCHAIN_ENDPOINT = env.LANGSMITH_ENDPOINT;

  logger.info({ project: env.LANGSMITH_PROJECT }, "LangSmith tracing enabled");
}

export function isLangSmithEnabled(): boolean {
  const env = getServerEnv();
  return Boolean(env.LANGSMITH_TRACING && env.LANGSMITH_API_KEY?.trim());
}
