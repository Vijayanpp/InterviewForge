import "server-only";
import type { z } from "zod";
import { getChatModel, isMockAgentRuntime } from "@/lib/agents/model";
import { configureLangSmith } from "@/lib/agents/tracing";
import { AiProviderError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Structured LLM call used by specialist agents.
 * Live path: LangChain `ChatOpenAI.withStructuredOutput` (traces in LangSmith).
 * Mock path: never hits the network — callers must supply a fallback.
 */
export async function invokeStructured<T>(
  schema: z.ZodType<T>,
  schemaName: string,
  prompt: string,
  mockFactory: () => T
): Promise<T> {
  if (isMockAgentRuntime()) {
    return schema.parse(mockFactory());
  }

  configureLangSmith();

  const attempt = async (): Promise<T> => {
    const model = getChatModel().withStructuredOutput(schema, { name: schemaName });
    const result = await model.invoke(prompt);
    return schema.parse(result);
  };

  try {
    return await attempt();
  } catch (firstError) {
    logger.warn({ schemaName, err: (firstError as Error).message }, "Agent structured output failed, retrying");
    try {
      return await attempt();
    } catch (secondError) {
      logger.error({ schemaName, err: (secondError as Error).message }, "Agent structured output failed twice");
      throw new AiProviderError(`Invalid structured response for ${schemaName}.`);
    }
  }
}
