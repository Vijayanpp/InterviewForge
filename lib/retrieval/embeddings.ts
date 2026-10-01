import "server-only";
import OpenAI from "openai";
import { getServerEnv, resolveAiProviderName } from "@/lib/env";
import { mockEmbed } from "@/lib/retrieval/similarity";

export { EMBEDDING_DIMENSIONS, cosineSimilarity, mockEmbed } from "@/lib/retrieval/similarity";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;
  const env = getServerEnv();
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required for embeddings.");
  }
  client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return client;
}

export async function embedText(text: string): Promise<number[]> {
  if (resolveAiProviderName() === "mock") {
    return mockEmbed(text);
  }
  const env = getServerEnv();
  const response = await getClient().embeddings.create({
    model: env.OPENAI_EMBEDDING_MODEL,
    input: text.slice(0, 8000),
  });
  return response.data[0]?.embedding ?? mockEmbed(text);
}
