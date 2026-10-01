# Folder structure

InterviewForge is a **single Next.js 16 app** (not an apps/packages monorepo). `pnpm-workspace.yaml` only pins dependency overrides.

Related: [Architecture](./architecture.md) · [File catalog](./files/README.md)

---

## Tree

```text
InterviewForge/
├── app/                    Next.js App Router — pages + BFF API
├── components/             UI by feature (not by atomic atom)
├── lib/                    Server logic, agents, data, providers
├── types/                  Generated DB types + domain Zod models
├── supabase/               Migrations, seed, local CLI config
├── tests/                  Unit, integration, e2e
├── docs/                   Product + engineering docs
├── docker/                 App compose + optional Judge0
├── scripts/                Seed runner
├── proxy.ts                Auth session refresh + coarse RBAC
├── next.config.ts          standalone output + LangChain externals
├── package.json            Root scripts and dependencies
└── README.md               Quick start
```

---

## What each top-level folder is for

| Folder | Owns | Does not own |
| --- | --- | --- |
| [`app/`](./files/02-app.md) | Routes, layouts, Route Handlers | Business rules, SQL, LLM calls |
| [`components/`](./files/03-components.md) | Screens and widgets | Secrets, LangGraph, service-role |
| [`lib/`](./files/04-lib-agents-graph-retrieval.md) | Agents, BFF services, repos, providers | JSX pages |
| [`types/`](./files/08-types-tests.md) | Zod + generated `Database` | Runtime logic |
| [`supabase/`](./files/07-supabase.md) | Schema, RLS, seed data | App code |
| [`tests/`](./files/08-types-tests.md) | Vitest + Playwright | Production UI |
| [`docs/`](./README.md) | Human documentation | Generated API refs |
| `docker/` | Container / Judge0 | Schema |

---

## `app/` — routes as pages, APIs as BFF

Route groups keep URLs clean (the group name is not in the path):

| Group | URL prefix | Audience |
| --- | --- | --- |
| `(marketing)` | `/` | Public landing |
| `(auth)` | `/login`, `/register`, … | Signed-out |
| `(onboarding)` | `/onboarding` | New candidates |
| `(candidate)` | `/dashboard`, `/interviews/*`, `/practice` | Candidates |
| `(admin)` | `/admin/*` | Admins |
| `(recruiter)` | `/recruiter/*` | Interviewers |
| `interviews/[sessionId]/` | `/interviews/:id/room\|voice\|coding` | Live rooms |
| `api/` | `/api/*` | BFF (never call LLMs from the browser) |
| `auth/` | `/auth/callback`, `/auth/confirm` | Supabase OAuth / email |

---

## `lib/` — layered server code

```text
lib/
├── agents/          LangChain specialists (planner, query, evaluators, supervisor)
├── graph/           LangGraph state, routing, compile, checkpointer
├── retrieval/       expand → decompose → multi-query → stores → rerank
├── ai/              AiProvider (mock/openai), prompts, opening greeting
├── voice/           STT/TTS
├── code-execution/  mock / Judge0
├── services/        interview-engine BFF, scoring, coding, ingest
├── repositories/    Supabase queries only
├── actions/         Server Actions (admin, recruiter, profile)
├── auth/            requireRole, auth actions
├── supabase/        browser / server / admin / middleware clients
├── api/             withApiHandler wrapper
├── proctoring/      integrity score
└── env.ts           validated server env
```

**Call direction (never invert):**

```text
app/api or actions  →  services  →  graph/agents or AiProvider
                                 →  repositories  →  Supabase
```

Client components may import `lib/store`, `lib/utils`, `types/domain`, and `components/*` only.

---

## `components/` — UI by feature

| Folder | Feature |
| --- | --- |
| `admin/` | Technologies, topics, question bank, challenges |
| `auth/` | Login, register, Google, password reset |
| `coding/` | Monaco rooms + AI challenge generator |
| `dashboard/` | Readiness cards, trends, weak topics |
| `interview-room/` | Text interview |
| `voice/` | Voice interview |
| `wizard/` | New-interview setup |
| `report/` | Post-session report |
| `recruiter/` | Assessments, invites, integrity |
| `proctoring/` | Webcam / screen shell |
| `layout/` | Sidebars and topbars |
| `ui/` | shadcn primitives |

---

## Conventions

1. **`import "server-only"`** on anything that can see API keys or LangGraph.
2. **Repositories** return rows. They do not call AI.
3. **Services** persist and orchestrate. They do not render UI.
4. **Agents** return Zod-validated objects. They do not write SQL.
5. **Pages** compose components and fetch via API / server actions.

See [File catalog](./files/README.md) for every source file.
