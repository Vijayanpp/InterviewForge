import pino from "pino";

const isEdgeRuntime = typeof (globalThis as { EdgeRuntime?: string }).EdgeRuntime !== "undefined";
const isProd = process.env.NODE_ENV === "production";

/**
 * Structured JSON logger. In development (Node runtime only — pino-pretty is
 * not Edge-compatible) logs are pretty-printed; in production and on the
 * Edge runtime we emit plain structured JSON that log aggregators can parse.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    !isProd && !isEdgeRuntime
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        }
      : undefined,
  base: { service: "interviewforge" },
});

export function createRequestLogger(requestId: string, extra?: Record<string, unknown>) {
  return logger.child({ requestId, ...extra });
}
