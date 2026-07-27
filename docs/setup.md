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

## Google OAuth (“Continue with Google”)

App code is already wired (`GoogleAuthButton` → `/auth/callback`). You only need Google Cloud + Supabase provider config.

### 1. Google Cloud OAuth client

1. Open [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**.
2. Configure the **OAuth consent screen** (External). While status is **Testing**, add your Google account under **Test users**.
3. **Create credentials** → **OAuth client ID** → Application type **Web application**.
4. Under **Authorized redirect URIs**, add the **Supabase** callback (not the Next.js URL):

| Environment | Redirect URI |
| --- | --- |
| Hosted Supabase | `https://<project-ref>.supabase.co/auth/v1/callback` |
| Local CLI (`pnpm db:start`) | `http://127.0.0.1:54321/auth/v1/callback` |

`<project-ref>` is the subdomain in `NEXT_PUBLIC_SUPABASE_URL` (e.g. `https://abcd.supabase.co` → `abcd`).

5. Copy the **Client ID** and **Client secret**.

### 2. Hosted Supabase

1. Dashboard → **Authentication** → **Providers** → **Google** → enable, paste Client ID + secret → Save.
2. **Authentication** → **URL Configuration**:
   - **Site URL**: your app origin (local Next: `http://localhost:3100`, or production URL).
   - **Redirect URLs** must include exact matches, for example:
     - `http://localhost:3100/auth/callback`
     - `https://<your-production-domain>/auth/callback`

### 3. Local Supabase CLI

[`supabase/config.toml`](../supabase/config.toml) enables Google via env substitution and allowlists port **3100**.

```bash
# In the same shell before starting local Supabase:
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"
pnpm db:start   # or restart if already running
```

On Windows PowerShell:

```powershell
$env:GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
$env:GOOGLE_CLIENT_SECRET="your-client-secret"
pnpm db:start
```

Google Cloud redirect URI for local must be `http://127.0.0.1:54321/auth/v1/callback`.

### 4. Verify

1. Open `http://localhost:3100/login` → **Continue with Google**.
2. Complete consent → land on `/dashboard` (or `/onboarding` if profile onboarding is incomplete).
3. Confirm rows in `auth.users` and `profiles` (Studio).

| Symptom | Likely cause |
| --- | --- |
| Toast: “Google sign-in is not available right now.” | Provider disabled or Client ID/secret wrong |
| Redirect to `/login?error=auth_callback_failed` | Site URL / Redirect URLs mismatch (port or path) |
| Google “redirect_uri_mismatch” | Wrong URI in Google Cloud (must be Supabase `/auth/v1/callback`) |

## Recruiter invites + proctoring

1. Apply migrations to hosted: `npx supabase db push` (or `pnpm db:migrate` for local). Includes `20250101000018_proctoring.sql`.
2. Optional email: set `RESEND_API_KEY` and `EMAIL_FROM` in `.env.local`. Without a key, invites still create links you can copy from the assessment page.
3. Become a recruiter: sign in → sidebar **Recruiter** → `/become-recruiter` → create organization.
4. Create assessment → Publish → invite emails → candidate opens `/invite/<token>` on Chrome/Edge (desktop) with camera + screen share allowed.

Proctoring records to private Storage bucket `proctoring`. Face detection uses MediaPipe in the browser (network required for model WASM).

## Environment variables

Full list: [`.env.example`](../.env.example). Validated in [`lib/env.ts`](../lib/env.ts).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; bypasses RLS — never expose to the client |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Local Supabase CLI only (`config.toml` `env(...)`); hosted uses Dashboard |
| `RESEND_API_KEY` | Optional; recruiter invite emails |
| `EMAIL_FROM` | From address for Resend (default Resend onboarding sender) |
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
