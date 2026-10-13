# InterviewForge

The all-in-one AI interview practice platform — adaptive questions, voice & coding rounds, honest rubric scoring, and personalised improvement plans.

[![Live](https://img.shields.io/badge/Live-interviewforge.co.in-8B5CF6?style=flat&logoColor=white)](https://interviewforge.co.in/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![LangChain](https://img.shields.io/badge/LangChain.js-1C3C3C?style=flat&logo=langchain&logoColor=white)](https://js.langchain.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph.js-FF4F4F?style=flat&logo=langchain&logoColor=white)](https://docs.langchain.com/oss/javascript/langgraph)
[![LangSmith](https://img.shields.io/badge/LangSmith-optional-2C6E49?style=flat&logo=langchain&logoColor=white)](https://smith.langchain.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_+_Auth-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat)](./LICENSE)

**Practice. Prepare. Perform. Succeed.** · Free & open source — self-host with your own keys.

**Docs:** [Setup](./docs/setup.md) · [Architecture](./docs/architecture.md) · [AI / voice / coding](./docs/ai-voice-coding.md) · [Product flows](./docs/product-flows.md) · [Testing](./docs/testing.md)  
**Support:** [Donate via Razorpay](https://rzp.io/rzp/FnEvT7Ff) · [Contributing](./CONTRIBUTING.md)

InterviewForge simulates a live interview with an AI that asks follow-ups, adapts difficulty, tracks topic coverage, and gives feedback that’s actually useful — not empty praise. Interviews are orchestrated with **LangGraph.js** and specialist LLM calls go through **LangChain.js** (`ChatOpenAI` + Zod). Practise across **21+ technology tracks**, choose **text** or **voice**, run **coding challenges**, and leave with a full report plus a 7- and 30-day study plan.

---

## Why InterviewForge?

Most “AI interview” tools either script a fixed quiz or cheerlead every answer. InterviewForge is built to feel closer to a real technical screen:

- **Adaptive questioning** — difficulty and follow-ups respond to what you actually said; the engine avoids repeating questions and watches remaining time.
- **Honest scoring** — answers are graded on technical accuracy, depth, clarity, and problem-solving with a clear rubric — never inflated praise.
- **Multiple modes** — text chat, **voice** (STT/TTS with editable transcript), and **coding** (Monaco + mock or Judge0 execution).
- **Personalization** — resume-based and job-description-based interviews, plus custom instructions when you need them.
- **Actionable outcomes** — overall score, hire-style recommendation, topic breakdown, and concrete 7-day / 30-day study plans.
- **Progress over time** — dashboard readiness, score trends, and “topics to improve” from your sessions.

Default AI interviewer persona: **Maya**, a Technical Architect with ~20 years of experience. The first turn always opens with a warm, deterministic welcome so every live session starts the same way.

---

## Features

### For candidates

| Feature | What you get |
| --- | --- |
| Interview wizard | Pick type (technical, behavioural, resume/JD-based, coding, mixed…), stack, difficulty, duration, and **text or voice** delivery |
| Adaptive AI interviewer | Follow-ups that probe gaps; no mid-interview score leaks |
| Voice interviews | TTS speaks questions; mic stays on until you pause or tap stop → transcript → edit → **Finish Answer** |
| Coding practice & rounds | Seeded challenges + Monaco editor; Run / Submit with mock fixtures or Judge0 |
| Dashboard | Readiness score, averages, interview count, score improvement chart, weak topics |
| Reports | Full post-session report with strengths, gaps, and study plans |
| Settings | Profile name + avatar for a named greeting |

### For admins

- Manage **technologies** and **topic** trees  
- Curate an optional **question bank** (including AI draft helper)  
- CRUD **coding challenges** and nested test cases (hidden tests stay server-side)  

### Technology tracks (examples)

JavaScript, TypeScript, React, Angular, Vue.js, Next.js, Node.js, Python, Java, C#, C++, PHP, SQL, System Design, DevOps & Cloud — and more, extensible by admins.

---

## Screenshots

<p align="center">
  <img src="docs/images/login.png" alt="InterviewForge login — Practice. Prepare. Perform. Succeed." width="800" />
</p>

<p align="center">
  <img src="docs/images/dashboard.png" alt="Candidate dashboard with readiness score and topics to improve" width="800" />
</p>

<p align="center">
  <img src="docs/images/voice-interview.png" alt="Voice interview with Maya, Technical Architect AI interviewer" width="800" />
</p>

<p align="center">
  <img src="docs/images/coding-challenges.png" alt="Coding challenges room with Monaco editor — Palindrome Number" width="800" />
</p>

---

## How a session works

```text
Start wizard → AI opens with Maya’s welcome
     → Answer (text or voice)
     → Rubric evaluation + optional follow-up
     → Next topic / question (adaptive)
     → End → Report + study plan
```

Coding-only interviews go straight to the coding room. **Mixed** runs a short text round, then hands off to coding.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| App / BFF | Next.js 16 App Router, TypeScript (strict), Tailwind, shadcn/ui |
| Auth & data | Supabase Auth, Postgres (RLS), Storage (resumes, avatars) |
| Interview orchestration | **LangGraph.js** (`@langchain/langgraph`) — compiled `StateGraph` (`prep` / `ask` / `grade` / `close`) |
| LLM | **LangChain.js** (`@langchain/openai`) — `ChatOpenAI.withStructuredOutput` + Zod |
| Observability | **LangSmith** (`langsmith`) — optional traces when `LANGSMITH_TRACING=true` |
| Retrieval | Query expansion, decomposition, multi-query → pgvector + lexical fallback |
| Voice | Swappable `mock` / `openai` (Whisper STT + TTS) |
| Code runs | Swappable `mock` / Judge0 |
| Tests | Vitest (unit + RLS) · Playwright (e2e) |

**Design rules:** never call the AI provider or service-role key from the client; the browser never imports `@langchain/*`; repositories own queries; services own business logic; every structured LLM response is Zod-validated.

Real AI / voice need your own `OPENAI_API_KEY`. Mock providers work offline for local demos and CI. Set `INTERVIEW_ENGINE=legacy` only if you need to skip LangGraph.

### LangChain + LangGraph (interview agents)

Default is `INTERVIEW_ENGINE=graph`. Next.js route handlers stay the BFF; they call `interview-engine`, which invokes the compiled graph. Packages on the server:

- [`@langchain/core`](https://www.npmjs.com/package/@langchain/core)
- [`@langchain/langgraph`](https://www.npmjs.com/package/@langchain/langgraph)
- [`@langchain/openai`](https://www.npmjs.com/package/@langchain/openai)
- [`langsmith`](https://www.npmjs.com/package/langsmith) (optional)

Specialists: planner, interviewer, technical / behavioural / coding evaluators, evidence validator, supervisor, report synthesizer. Details: [docs/architecture.md](./docs/architecture.md) · [docs/ai-voice-coding.md](./docs/ai-voice-coding.md).

---

## Prerequisites

- Node.js **22+**
- [pnpm](https://pnpm.io/) **10+**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Supabase CLI)
- Supabase CLI via the local `supabase` package (`npx supabase`)

---

## Quick start

```bash
cd interviewforge
pnpm install

pnpm db:start
cp .env.example .env.local
pnpm db:status
# Paste NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# and SUPABASE_SERVICE_ROLE_KEY into .env.local

pnpm db:reset
pnpm dev
```

Open [http://localhost:3100](http://localhost:3100).

Default in `.env.example` is `AI_PROVIDER=mock` (no OpenAI key). For real interviews:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
INTERVIEW_ENGINE=graph

VOICE_PROVIDER=openai
VOICE_TTS_VOICE=nova

CODE_EXECUTION_PROVIDER=judge0
JUDGE0_URL=https://ce.judge0.com

# Optional LangSmith traces for LangChain / LangGraph
# LANGSMITH_TRACING=true
# LANGSMITH_API_KEY=lsv2_...
# LANGSMITH_PROJECT=interviewforge
```

Full env list, hosted Supabase, and **Google OAuth** (“Continue with Google”): [docs/setup.md](./docs/setup.md).

---

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Next.js on port **3100** |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint |
| `pnpm db:start` / `db:stop` / `db:status` | Local Supabase |
| `pnpm db:reset` | Migrations + seed |
| `pnpm db:migrate` / `db:seed` / `db:types` | Migrate / seed / regenerate types |
| `pnpm judge0:up` / `judge0:down` / `judge0:logs` | Local Judge0 CE |
| `pnpm test:unit` / `test:integration` / `test:e2e` | Test suites |

---

## Architecture (short)

Next.js is the BFF. Live interviews run a **LangGraph** `StateGraph` (plan → retrieve → interview → evaluate → supervise → report). Each specialist call uses **LangChain** `ChatOpenAI.withStructuredOutput`. Resume/JD and the question bank are retrieved with expansion, decomposition, and multi-query — not stuffed whole into one prompt.

```
UI rooms  →  /api/interviews/*  →  interview-engine  →  LangGraph + LangChain  →  Supabase
                                                              ↘ LangSmith (optional)
```

See **[docs/architecture.md](./docs/architecture.md)** for the current architecture, **[docs/folder-structure.md](./docs/folder-structure.md)** for the tree, and **[docs/files/README.md](./docs/files/README.md)** for a file-by-file catalog.

---

## Roles & routes

| Role | Routes |
| --- | --- |
| Public | `/`, `/login`, `/register`, password reset |
| Candidate | `/onboarding`, `/dashboard`, `/settings`, `/interviews/*`, `/practice/*` |
| Admin | `/admin/dashboard`, technologies, topics, questions, challenges |

Promote to admin via `profiles.role_id` → `roles` row `admin`.

---

## Project status

InterviewForge is **usable end-to-end** for candidate practice (text, voice, coding) with mock or OpenAI backends. Recruiter org UI and paid billing metering are schema-ready but deferred. Self-host for free; use the [live site](https://interviewforge.co.in/) to try without setup.

Contributions and feedback are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License & support

[MIT](./LICENSE) © 2026 Vijayan PP

Free to use, modify, and distribute.

If InterviewForge helps you prepare (or ship your own fork), you can [support development](https://rzp.io/rzp/FnEvT7Ff) — donations help cover API and hosting costs for the public demo and maintenance.
