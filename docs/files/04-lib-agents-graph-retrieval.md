# `lib/agents`, `lib/graph`, `lib/retrieval`

Server-only interview intelligence. Client code must not import this tree.

## LangChain model and tracing

| File | Purpose |
| --- | --- |
| [`lib/agents/model.ts`](../../lib/agents/model.ts) | `getChatModel()` → LangChain `ChatOpenAI`; `isMockAgentRuntime()` |
| [`lib/agents/structured.ts`](../../lib/agents/structured.ts) | `invokeStructured` — `withStructuredOutput` + Zod; mock factory offline |
| [`lib/agents/tracing.ts`](../../lib/agents/tracing.ts) | Copies `LANGSMITH_*` into LangChain env so graphs and LLM calls trace |
| [`lib/agents/schemas/query.ts`](../../lib/agents/schemas/query.ts) | Zod: expansion, decomposition, multi-query, plan, supervisor, evidence |

## Query agents (recall)

| File | Purpose |
| --- | --- |
| [`lib/agents/query-expander.ts`](../../lib/agents/query-expander.ts) | Same intent, extra terms (`slow API` → latency, p99) |
| [`lib/agents/query-decomposer.ts`](../../lib/agents/query-decomposer.ts) | Split one compound objective into atomic questions |
| [`lib/agents/multi-query-generator.ts`](../../lib/agents/multi-query-generator.ts) | Several search phrasings / angles for one question |

Each file exports a **mock** function (unit-tested) and an async LLM wrapper.

## Specialist agents

| File | Purpose |
| --- | --- |
| [`lib/agents/planner.ts`](../../lib/agents/planner.ts) | Interview plan: phases, tasks, weak topics |
| [`lib/agents/interviewer.ts`](../../lib/agents/interviewer.ts) | Next / follow-up question (uses `AiProvider` + retrieved evidence) |
| [`lib/agents/evaluators/index.ts`](../../lib/agents/evaluators/index.ts) | Route by interview / question type |
| [`lib/agents/evaluators/technical.ts`](../../lib/agents/evaluators/technical.ts) | Rubric grade via `answer_evaluator` |
| [`lib/agents/evaluators/behavioural.ts`](../../lib/agents/evaluators/behavioural.ts) | STAR grade; published `behavioural_evaluator` when present |
| [`lib/agents/evaluators/coding.ts`](../../lib/agents/evaluators/coding.ts) | Code review grade; published `coding_evaluator` when present |
| [`lib/agents/evidence-validator.ts`](../../lib/agents/evidence-validator.ts) | Claims vs retrieved chunks |
| [`lib/agents/supervisor.ts`](../../lib/agents/supervisor.ts) | Next action; hard caps from `decideNextAction` always win |
| [`lib/agents/synthesizer.ts`](../../lib/agents/synthesizer.ts) | Report + study plan |
| [`lib/agents/research-engine.ts`](../../lib/agents/research-engine.ts) | Builds session resume/JD docs and runs the retrieval pipeline |

## LangGraph

| File | Purpose |
| --- | --- |
| [`lib/graph/state.ts`](../../lib/graph/state.ts) | `InterviewAnnotation` / `InterviewState` (port of BR `ResearchState`) |
| [`lib/graph/inputs.ts`](../../lib/graph/inputs.ts) | `buildGraphInput` — per-turn reset, keep plan/messages |
| [`lib/graph/routing.ts`](../../lib/graph/routing.ts) | Conditional edges: prep / ask / grade / close |
| [`lib/graph/checkpointer.ts`](../../lib/graph/checkpointer.ts) | In-process `MemorySaver`; `thread_id = sessionId` |
| [`lib/graph/workflow.ts`](../../lib/graph/workflow.ts) | Compile graph; `invokeInterviewGraph` with LangSmith run name/tags |

**Turn modes:** `prep` (plan + retrieve), `ask` (opening + first question), `grade` (evaluate + supervise), `close` (report).

## Retrieval

| File | Purpose |
| --- | --- |
| [`lib/retrieval/types.ts`](../../lib/retrieval/types.ts) | `RetrievedDocument`, `DocumentStore`, source types |
| [`lib/retrieval/pipeline.ts`](../../lib/retrieval/pipeline.ts) | expand → decompose → multi-query → parallel search → dedup → rerank |
| [`lib/retrieval/chunking.ts`](../../lib/retrieval/chunking.ts) | Overlapping text chunks |
| [`lib/retrieval/deduplication.ts`](../../lib/retrieval/deduplication.ts) | Source + content-prefix unique |
| [`lib/retrieval/similarity.ts`](../../lib/retrieval/similarity.ts) | Mock hash embeddings + cosine (no `server-only`) |
| [`lib/retrieval/embeddings.ts`](../../lib/retrieval/embeddings.ts) | OpenAI embeddings or mock |
| [`lib/retrieval/reranker.ts`](../../lib/retrieval/reranker.ts) | LLM rerank or lexical mock |
| [`lib/retrieval/stores/memory.ts`](../../lib/retrieval/stores/memory.ts) | In-memory store + seeded topic notes (CI) |
| [`lib/retrieval/stores/vector.ts`](../../lib/retrieval/stores/vector.ts) | `match_knowledge_chunks` RPC |
| [`lib/retrieval/stores/question-bank.ts`](../../lib/retrieval/stores/question-bank.ts) | Lexical approved bank questions |
| [`lib/retrieval/stores/web.ts`](../../lib/retrieval/stores/web.ts) | Reserved no-op for company/JD web search |
