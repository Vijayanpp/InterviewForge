# Setup

## Prerequisites

- Node.js **22+**
- [pnpm](https://pnpm.io/) **10+**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Supabase CLI + optional Judge0)
- Supabase CLI via the repo package (`npx supabase` / `pnpm db:*`)

## Local development

```bash
cd interviewforge
pnpm install

pnpm db:start                 # Postgres + Auth + Storage on Docker
cp .env.example .env.local
pnpm db:status                # copy URL + anon + service_role into .env.local

pnpm db:reset                 # migrations + seed
# or: pnpm db:migrate && pnpm db:seed

pnpm dev                      # http://localhost:3100
```

### Recommended local providers

| Concern | Safe default | Real API |
| --- | --- | --- |
| Chat AI | `AI_PROVIDER=mock` | `openai` + `OPENAI_API_KEY` |
| Voice | `VOICE_PROVIDER=mock` | `openai` (same key) |
| Code run | `CODE_EXECUTION_PROVIDER=mock` | `judge0` + `JUDGE0_URL` |

`AI_PROVIDER=openai` and `VOICE_PROVIDER=openai` are **fail-closed**: missing `OPENAI_API_KEY` errors on live use (no silent mock fallback).

Clones should start with the `.env.example` defaults (`AI_PROVIDER=mock`, `VOICE_PROVIDER=mock`) so the app runs without a paid API key.

## Hosted Supabase

Point `.env.local` at your project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_URL=http://localhost:3100
```

Apply schema:

```bash
# Preferred when linked:
npx supabase link --project-ref <project-ref>
npx supabase db push

# Or with a session-mode pooler URL (region-specific):
npx supabase db push --db-url "postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

Seed hosted separately if needed (local `pnpm db:seed` targets local Docker by default). After prompt migrations, **restart** `pnpm dev` so the in-process prompt cache reloads.

## Environment variables

Full list: [`.env.example`](../.env.example). Validated in [`lib/env.ts`](../lib/env.ts).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; bypasses RLS — never expose to the client |
| `AI_PROVIDER` | `mock` \| `openai` |
| `OPENAI_API_KEY` | OpenAI key for chat + voice when providers are openai |
| `OPENAI_MODEL` | Default chat model (e.g. `gpt-4o-mini`) |
| `CODE_EXECUTION_PROVIDER` | `mock` \| `judge0` |
| `JUDGE0_URL` | Judge0 CE endpoint |
| `JUDGE0_AUTH_TOKEN` / `JUDGE0_AUTH_HEADER` | Optional Judge0 auth |
| `VOICE_PROVIDER` | `mock` \| `openai` |
| `VOICE_STT_MODEL` | Whisper model (default `whisper-1`) |
| `VOICE_TTS_MODEL` | TTS model (default `gpt-4o-mini-tts`) |
| `VOICE_TTS_VOICE` | TTS voice (default `nova`) |
| `VOICE_MAX_ANSWER_SECONDS` | Max recording length |
| `VOICE_SILENCE_MS` | Silence auto-stop threshold |
| `VOICE_MAX_UPLOAD_BYTES` | Max audio upload size |
| `APP_URL` | Public app origin (local: `http://localhost:3100`) |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` | API rate limits |
| `LOG_LEVEL` | Pino level |

## Judge0 (optional)

```bash
pnpm judge0:up                # docker/judge0 → http://localhost:2358
# CODE_EXECUTION_PROVIDER=judge0
# JUDGE0_URL=http://localhost:2358
```

On Windows Docker Desktop the isolate sandbox often fails; prefer `https://ce.judge0.com` or a Linux host.

## Production Docker image

App image expects an existing Supabase project (does not bundle Postgres):

```bash
docker compose -f docker/docker-compose.yml --env-file .env.local up --build
```

Uses Next.js `output: "standalone"`.

## Admin access

Promote a user by setting `profiles.role_id` to the `admin` row in `roles` (Supabase Studio or SQL).
