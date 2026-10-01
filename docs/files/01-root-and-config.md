# Root and config files

| File | Purpose |
| --- | --- |
| [`README.md`](../../README.md) | Product pitch, quick start, short architecture |
| [`CONTRIBUTING.md`](../../CONTRIBUTING.md) | How to contribute |
| [`LICENSE`](../../LICENSE) | MIT |
| [`AGENTS.md`](../../AGENTS.md) | Cursor/agent note: Next.js 16 docs may differ from training data |
| [`CLAUDE.md`](../../CLAUDE.md) | Forwards to `AGENTS.md` |
| [`package.json`](../../package.json) | Scripts (`dev` on port 3100, `db:*`, `test:*`, Judge0) and deps |
| [`pnpm-lock.yaml`](../../pnpm-lock.yaml) | Lockfile |
| [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) | Overrides only (not a multi-package workspace) |
| [`tsconfig.json`](../../tsconfig.json) | Strict TS, `@/*` → repo root |
| [`next.config.ts`](../../next.config.ts) | `output: "standalone"`; `serverExternalPackages` for LangChain / LangGraph / LangSmith |
| [`proxy.ts`](../../proxy.ts) | Next.js 16 proxy: refresh Supabase session, coarse RBAC by path prefix |
| [`components.json`](../../components.json) | shadcn/ui config |
| [`playwright.config.ts`](../../playwright.config.ts) | E2E against `http://localhost:3100` |
| [`vitest.config.ts`](../../vitest.config.ts) | Unit tests; aliases `@` and `server-only` stub |
| [`vitest.integration.config.ts`](../../vitest.integration.config.ts) | RLS tests against local Supabase |
| [`scripts/seed.mjs`](../../scripts/seed.mjs) | Runs `supabase/seed/*.sql` after migrate |
| [`docker/docker-compose.yml`](../../docker/docker-compose.yml) | Production-style app image |
| [`docker/judge0/docker-compose.yml`](../../docker/judge0/docker-compose.yml) | Local Judge0 CE |

**Env:** copy `.env.example` → `.env.local`. Validated in [`lib/env.ts`](../../lib/env.ts). Never put `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` in `NEXT_PUBLIC_*`.
