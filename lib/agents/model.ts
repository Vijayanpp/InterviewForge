import "server-only";
import { ChatOpenAI } from "@langchain/openai";
import { getServerEnv, resolveAiProviderName } from "@/lib/env";

/**
 * LangChain chat model factory — mirrors Business-Research `app/agents/base.py`.
 * Live interviews use ChatOpenAI; mock mode never constructs a network client.
 */
export function getChatModel(): ChatOpenAI {
  const env = getServerEnv();
  if (resolveAiProviderName() !== "openai" || !env.OPENAI_API_KEY) {
    throw new Error("getChatModel() requires AI_PROVIDER=openai and OPENAI_API_KEY.");
  }
  return new ChatOpenAI({
    model: env.OPENAI_MODEL,
    temperature: 0,
    apiKey: env.OPENAI_API_KEY,
  });
}

export function isMockAgentRuntime(): boolean {
  return resolveAiProviderName() === "mock";
}
