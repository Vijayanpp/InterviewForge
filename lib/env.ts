import { z } from "zod";

/**
 * Central environment variable contract for the whole app.
 *
 * Server-only secrets (service role key, AI provider keys) are intentionally
 * kept out of `NEXT_PUBLIC_*` land and must never be imported from a file
 * that ships to the client bundle. `lib/env.ts` itself is safe to import
 * anywhere because Next.js statically replaces `NEXT_PUBLIC_*` references
 * and `process.env` access to non-public vars is inlined to `undefined`
 * on the client, which the schema below will reject at build/boot time.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),

  CODE_EXECUTION_PROVIDER: z.enum(["mock", "judge0"]).default("mock"),
  JUDGE0_URL: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url().optional()
  ),
  JUDGE0_AUTH_TOKEN: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().optional()
  ),
  JUDGE0_AUTH_HEADER: z.string().default("X-Auth-Token"),

  VOICE_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  VOICE_STT_MODEL: z.string().default("whisper-1"),
  VOICE_TTS_MODEL: z.string().default("gpt-4o-mini-tts"),
  VOICE_TTS_VOICE: z.string().default("nova"),
  VOICE_MAX_ANSWER_SECONDS: z.coerce.number().int().positive().default(180),
  VOICE_SILENCE_MS: z.coerce.number().int().positive().default(2500),
  VOICE_MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(10_485_760),

  APP_URL: z.string().url().default("http://localhost:3100"),

  /** Optional — invite emails no-op / log-only when unset (local/dev). */
  RESEND_API_KEY: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().optional()
  ),
  EMAIL_FROM: z.string().default("InterviewForge <onboarding@resend.dev>"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | undefined;

/**
 * Lazily validates and caches process.env against the schema above.
 * Throws a descriptive error immediately (fail fast) instead of allowing
 * the app to boot in a half-configured state.
 */
export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration. Copy .env.example to .env.local and fill in the required values:\n${issues}`
    );
  }

  if (parsed.data.AI_PROVIDER === "openai" && !parsed.data.OPENAI_API_KEY?.trim()) {
    // Fail at resolveAiProviderName() when first used — keep boot soft for tooling.
    // eslint-disable-next-line no-console
    console.warn(
      "[env] AI_PROVIDER=openai but OPENAI_API_KEY is empty. Live interviews will fail until a key is set."
    );
  }

  if (parsed.data.CODE_EXECUTION_PROVIDER === "judge0" && !parsed.data.JUDGE0_URL) {
    // eslint-disable-next-line no-console
    console.warn(
      "[env] CODE_EXECUTION_PROVIDER=judge0 but JUDGE0_URL is not set. Falling back to the mock code execution provider."
    );
  }

  if (parsed.data.VOICE_PROVIDER === "openai" && !parsed.data.OPENAI_API_KEY?.trim()) {
    // eslint-disable-next-line no-console
    console.warn(
      "[env] VOICE_PROVIDER=openai but OPENAI_API_KEY is empty. Voice interviews will fail until a key is set."
    );
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/**
 * Public, client-safe subset of env vars. Only ever expose values here that
 * are prefixed with NEXT_PUBLIC_ and are safe to ship in the JS bundle.
 */
export function getClientEnv() {
  const schema = z.object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  });

  return schema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

/** Resolves the effective AI provider. OpenAI is fail-closed when requested. */
export function resolveAiProviderName(): "mock" | "openai" {
  const env = getServerEnv();
  if (env.AI_PROVIDER === "openai") {
    if (!env.OPENAI_API_KEY?.trim()) {
      throw new Error(
        'AI_PROVIDER=openai but OPENAI_API_KEY is missing. Add a key to .env.local — mock fallback is disabled for live interviews.'
      );
    }
    return "openai";
  }
  return "mock";
}

/** Resolves the effective code-execution provider, accounting for missing Judge0 config. */
export function resolveCodeExecutionProviderName(): "mock" | "judge0" {
  const env = getServerEnv();
  if (env.CODE_EXECUTION_PROVIDER === "judge0" && env.JUDGE0_URL) return "judge0";
  return "mock";
}

/** Resolves the effective voice provider. OpenAI is fail-closed when requested. */
export function resolveVoiceProviderName(): "mock" | "openai" {
  const env = getServerEnv();
  if (env.VOICE_PROVIDER === "openai") {
    if (!env.OPENAI_API_KEY?.trim()) {
      throw new Error(
        "VOICE_PROVIDER=openai but OPENAI_API_KEY is missing. Add a key to .env.local — mock fallback is disabled for live voice interviews."
      );
    }
    return "openai";
  }
  return "mock";
}
