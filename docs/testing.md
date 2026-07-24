# Testing

## Commands

```bash
pnpm test:unit              # no network / no DB
pnpm test:unit:watch

pnpm db:start
pnpm test:integration       # RLS — needs local Supabase

# App on :3100 + local Supabase
pnpm test:e2e

pnpm test:all               # unit + integration + e2e
```

## Layout

| Layer | Config | Location |
| --- | --- | --- |
| Unit | `vitest.config.ts` | `tests/unit/` |
| Integration | `vitest.integration.config.ts` | `tests/integration/` |
| E2E | `playwright.config.ts` | `tests/e2e/` |

## What unit tests cover (high level)

- Scoring calculator and adaptive `decideNextAction`
- Zod schemas for AI structured outputs
- `MockAiProvider` determinism + opening greeting / `skipOpening`
- Shared `opening-question` helper
- Mock code executor fixtures and coding score weights
- Voice analytics + `MockVoiceProvider`
- Candidate DTOs strip hidden test data

## E2E notes

Playwright specs expect the app at `http://localhost:3100` and typically `AI_PROVIDER=mock` / `VOICE_PROVIDER=mock` for stable smoke runs. Specs include interview flow and voice interview smoke.
