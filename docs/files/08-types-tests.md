# `types/` and `tests/`

## Types

| File | Purpose |
| --- | --- |
| [`types/database.ts`](../../types/database.ts) | Generated Supabase `Database` (includes `knowledge_chunks`, `interview_events`, `match_knowledge_chunks`) |
| [`types/domain/index.ts`](../../types/domain/index.ts) | Re-exports |
| [`types/domain/enums.ts`](../../types/domain/enums.ts) | Mirrors Postgres enums (roles, interview types, prompt names) |
| [`types/domain/interview.ts`](../../types/domain/interview.ts) | Session / question / answer Zod + wizard schemas |
| [`types/domain/report.ts`](../../types/domain/report.ts) | Report view types |
| [`types/domain/documents.ts`](../../types/domain/documents.ts) | Resume / JD |
| [`types/domain/question-bank.ts`](../../types/domain/question-bank.ts) | Bank CRUD |
| [`types/domain/technology.ts`](../../types/domain/technology.ts) | Tech + topics |
| [`types/domain/coding.ts`](../../types/domain/coding.ts) | Challenges + tests |
| [`types/domain/voice.ts`](../../types/domain/voice.ts) | Transcript payload |
| [`types/domain/profile.ts`](../../types/domain/profile.ts) | Profile |
| [`types/domain/avatar.ts`](../../types/domain/avatar.ts) | Avatar |
| [`types/domain/assessment.ts`](../../types/domain/assessment.ts) | Recruiter assessments |
| [`types/domain/db-helpers.ts`](../../types/domain/db-helpers.ts) | `Tables<>` helper |

Regenerate DB types after schema changes: `pnpm db:types`.

## Tests

| File | Purpose |
| --- | --- |
| [`tests/unit/setup-env.ts`](../../tests/unit/setup-env.ts) | Dummy Supabase env so `getServerEnv` works |
| [`tests/stubs/server-only.ts`](../../tests/stubs/server-only.ts) | Vitest alias for `server-only` |
| [`tests/unit/query-agents.test.ts`](../../tests/unit/query-agents.test.ts) | Expansion, decomposition, multi-query mocks |
| [`tests/unit/retrieval-pipeline.test.ts`](../../tests/unit/retrieval-pipeline.test.ts) | Chunk, dedup, in-memory retrieve |
| [`tests/unit/supervisor-graph.test.ts`](../../tests/unit/supervisor-graph.test.ts) | Hard caps + routing |
| [`tests/unit/interview-graph.test.ts`](../../tests/unit/interview-graph.test.ts) | Prep → ask Maya opening |
| [`tests/unit/scoring.test.ts`](../../tests/unit/scoring.test.ts) | Weights + `decideNextAction` |
| [`tests/unit/ai-schemas.test.ts`](../../tests/unit/ai-schemas.test.ts) | Zod AI schemas |
| [`tests/unit/mock-ai-provider.test.ts`](../../tests/unit/mock-ai-provider.test.ts) | Mock provider |
| [`tests/unit/opening-question.test.ts`](../../tests/unit/opening-question.test.ts) | Greeting helper |
| [`tests/unit/voice.test.ts`](../../tests/unit/voice.test.ts) | Voice analytics / mock STT |
| [`tests/unit/coding-execution.test.ts`](../../tests/unit/coding-execution.test.ts) | Mock Judge0 + scoring |
| [`tests/integration/setup-env.ts`](../../tests/integration/setup-env.ts) | Loads `.env.local` |
| [`tests/integration/rls.test.ts`](../../tests/integration/rls.test.ts) | Postgres RLS |
| [`tests/e2e/interview-flow.spec.ts`](../../tests/e2e/interview-flow.spec.ts) | Playwright text flow |
| [`tests/e2e/voice-interview.spec.ts`](../../tests/e2e/voice-interview.spec.ts) | Playwright voice smoke |

```bash
pnpm test:unit
pnpm test:integration   # needs supabase start
pnpm test:e2e           # app on :3100
```
