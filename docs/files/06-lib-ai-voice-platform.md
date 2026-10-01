# `lib/ai`, voice, platform helpers

## AI providers

| File | Purpose |
| --- | --- |
| [`lib/ai/index.ts`](../../lib/ai/index.ts) | `getAiProvider()` factory (cached) |
| [`lib/ai/provider.ts`](../../lib/ai/provider.ts) | Capability interface |
| [`lib/ai/openai-provider.ts`](../../lib/ai/openai-provider.ts) | OpenAI structured outputs for questions/evals/reports |
| [`lib/ai/mock-provider.ts`](../../lib/ai/mock-provider.ts) | Deterministic offline twin |
| [`lib/ai/schemas.ts`](../../lib/ai/schemas.ts) | Zod I/O for questions, evaluations, reports, coding challenges |
| [`lib/ai/prompt-loader.ts`](../../lib/ai/prompt-loader.ts) | Published rows from `ai_prompt_versions` |
| [`lib/ai/opening-question.ts`](../../lib/ai/opening-question.ts) | Maya’s deterministic first turn |

Graph interviewer/evaluators still use `AiProvider` for the live question/eval schemas. Query/plan/supervisor agents use LangChain `invokeStructured`.

## Voice and code execution

| File | Purpose |
| --- | --- |
| [`lib/voice/index.ts`](../../lib/voice/index.ts) | `getVoiceProvider()` |
| [`lib/voice/provider.ts`](../../lib/voice/provider.ts) | STT/TTS contract |
| [`lib/voice/openai-provider.ts`](../../lib/voice/openai-provider.ts) | Whisper + TTS |
| [`lib/voice/mock-provider.ts`](../../lib/voice/mock-provider.ts) | Silent WAV + fixture transcript |
| [`lib/voice/analytics.ts`](../../lib/voice/analytics.ts) | WPM / fillers (not LLM) |
| [`lib/code-execution/index.ts`](../../lib/code-execution/index.ts) | `getCodeExecutionProvider()` |
| [`lib/code-execution/provider.ts`](../../lib/code-execution/provider.ts) | Run contract |
| [`lib/code-execution/judge0-provider.ts`](../../lib/code-execution/judge0-provider.ts) | Remote sandbox |
| [`lib/code-execution/mock-provider.ts`](../../lib/code-execution/mock-provider.ts) | Fixture grader |
| [`lib/code-execution/languages.ts`](../../lib/code-execution/languages.ts) | Language ids + starter code |

## Auth, Supabase, HTTP

| File | Purpose |
| --- | --- |
| [`lib/env.ts`](../../lib/env.ts) | Zod env; `resolveAiProviderName`, `resolveInterviewEngine` |
| [`lib/auth/require-role.ts`](../../lib/auth/require-role.ts) | Session + role gate |
| [`lib/auth/actions.ts`](../../lib/auth/actions.ts) | Sign in/up, password reset |
| [`lib/supabase/browser-client.ts`](../../lib/supabase/browser-client.ts) | Browser anon client |
| [`lib/supabase/server-client.ts`](../../lib/supabase/server-client.ts) | Cookie session client (RLS) |
| [`lib/supabase/admin-client.ts`](../../lib/supabase/admin-client.ts) | Service role — server only |
| [`lib/supabase/middleware-client.ts`](../../lib/supabase/middleware-client.ts) | Proxy / middleware session |
| [`lib/api/handler.ts`](../../lib/api/handler.ts) | `withApiHandler` error mapping |
| [`lib/errors.ts`](../../lib/errors.ts) | Typed HTTP errors |
| [`lib/logger.ts`](../../lib/logger.ts) | Pino |
| [`lib/rate-limit.ts`](../../lib/rate-limit.ts) | In-process rate limit |
| [`lib/app-url.ts`](../../lib/app-url.ts) | Public origin (never Docker `0.0.0.0`) |
| [`lib/email/resend.ts`](../../lib/email/resend.ts) | Invite email (optional) |
| [`lib/proctoring/integrity.ts`](../../lib/proctoring/integrity.ts) | Integrity score from events |
| [`lib/validation/auth.ts`](../../lib/validation/auth.ts) | Auth form schemas |
| [`lib/store/wizard-store.ts`](../../lib/store/wizard-store.ts) | Zustand wizard persist |
| [`lib/utils.ts`](../../lib/utils.ts) | `cn()` class helper |
| [`lib/themes.ts`](../../lib/themes.ts) | Theme tokens |
| [`lib/brand.ts`](../../lib/brand.ts) | Brand strings |
