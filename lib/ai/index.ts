import "server-only";
import { resolveAiProviderName } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { AiProvider } from "@/lib/ai/provider";
import { MockAiProvider } from "@/lib/ai/mock-provider";
import { OpenAiProvider } from "@/lib/ai/openai-provider";

let cachedProvider: AiProvider | undefined;

/**
 * Resolves the active `AiProvider`. When `AI_PROVIDER=openai`, this is
 * fail-closed (throws if the API key is missing) so live interviews never
 * silently fall back to hardcoded mock templates. Mock remains available
 * only when `AI_PROVIDER=mock` (tests/CI).
 */
export function getAiProvider(): AiProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = resolveAiProviderName();
  cachedProvider = providerName === "openai" ? new OpenAiProvider() : new MockAiProvider();
  logger.info({ provider: cachedProvider.name }, "AI provider ready");
  return cachedProvider;
}

/** Test helper — clears the cached provider between Vitest cases. */
export function resetAiProviderCache(): void {
  cachedProvider = undefined;
}

export type { AiProvider } from "@/lib/ai/provider";
export * from "@/lib/ai/schemas";
