import "server-only";
import { resolveVoiceProviderName } from "@/lib/env";
import { logger } from "@/lib/logger";
import type { VoiceProvider } from "@/lib/voice/provider";
import { MockVoiceProvider } from "@/lib/voice/mock-provider";
import { OpenAiVoiceProvider } from "@/lib/voice/openai-provider";

let cachedProvider: VoiceProvider | undefined;

/**
 * Resolves the active `VoiceProvider`. When `VOICE_PROVIDER=openai`, this is
 * fail-closed (throws if OPENAI_API_KEY is missing) so voice interviews never
 * silently fall back to mock STT for live sessions.
 */
export function getVoiceProvider(): VoiceProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = resolveVoiceProviderName();
  cachedProvider =
    providerName === "openai" ? new OpenAiVoiceProvider() : new MockVoiceProvider();
  logger.info({ provider: cachedProvider.name }, "Voice provider ready");
  return cachedProvider;
}

/** Test helper — clears the cached provider between Vitest cases. */
export function resetVoiceProviderCache(): void {
  cachedProvider = undefined;
}

export type { VoiceProvider } from "@/lib/voice/provider";
