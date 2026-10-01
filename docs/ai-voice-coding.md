# AI, voice & coding providers

## AI (`lib/ai/`)

Factory: `getAiProvider()` ← `AI_PROVIDER`.

| Provider | Behavior |
| --- | --- |
| `mock` | Deterministic questions/evals/reports; no network |
| `openai` | Chat Completions + Zod structured outputs; requires `OPENAI_API_KEY` |

Capabilities: `generateQuestion`, `generateFollowUp`, `evaluateAnswer`, `generateReport`, `generateStudyPlan`, `generateCodingChallenge`.

## LangGraph interview agents (`lib/agents/`, `lib/graph/`)

Live interviews default to `INTERVIEW_ENGINE=graph`. Next.js route handlers stay the BFF; they call `interview-engine`, which invokes compiled LangGraph graphs (`prep` / `ask` / `grade` / `close`).

Specialist LLM calls go through LangChain `ChatOpenAI.withStructuredOutput`. Optional LangSmith tracing:

```env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...
LANGSMITH_PROJECT=interviewforge
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

Retrieval (Business-Research port, plus expansion):

1. **Query expansion** — same intent, richer terms
2. **Query decomposition** — split compound objectives
3. **Multi-query** — different wording / angles
4. Parallel retrieve (pgvector + question bank + session resume/JD + topic notes)
5. Dedup + rerank

Specialists: planner, interviewer, technical / behavioural / coding evaluators (wires unused `behavioural_evaluator` and `coding_evaluator` prompts when published), evidence validator, supervisor, report synthesizer.

Hard caps still come from `decideNextAction` (time / max questions). Set `INTERVIEW_ENGINE=legacy` to skip the graph.

Mock + `MemorySaver` keep CI offline. Client components never import `@langchain/*`.

### Prompts (not training)

Behavior is **prompt engineering**, not fine-tuning.

- Table: `ai_prompt_versions` (draft / published / archived)
- Loader: `lib/ai/prompt-loader.ts` (published rows, in-process cache)
- Seed: `supabase/seed/07_ai_prompt_versions.sql`
- Patches: migrations `12`–`14`, `16`–`17`

| Prompt name | Role |
| --- | --- |
| `interviewer` | Persona prepended to question/eval calls |
| `question_generator` | Next / follow-up question structure |
| `answer_evaluator` | Scoring + optional follow-up |
| `report_generator` | Final report |
| `study_plan_generator` | Improvement plan |
| `coding_challenge_generator` | Practice challenge authoring |

Per-prompt `model_settings` JSON can override `{ model, temperature, max_tokens }`; otherwise `OPENAI_MODEL` is used.

There is **no admin UI** to edit prompts yet — change via SQL / migrations, then restart the app (or invalidate prompt cache).

### Interviewer persona (Maya)

Published `interviewer` prompt: **Maya**, female Technical Architect with ~20 years experience (migration `…17_interviewer_persona_maya.sql`).

Default TTS voice: `VOICE_TTS_VOICE=nova`.

### First-turn greeting (deterministic)

Live interviews always open with a fixed welcome from [`lib/ai/opening-question.ts`](../lib/ai/opening-question.ts) when:

`previousQuestions.length === 0 && !skipOpening`

Used by both mock and OpenAI providers so greeting does not depend on the model following soft prompt text. Admin question-bank drafts set `skipOpening: true`.

Candidate first name comes from `profiles.full_name` via `interview-engine` → `candidateName`.

**Note:** Resuming an `in_progress` session reuses existing Q0 — start a **new** draft session to hear the greeting again.

### Changing the chat model

```env
OPENAI_MODEL=gpt-4o          # or another chat model your key can use
```

Or set `model_settings.model` on a published prompt row. Restart after env changes (`getAiProvider` is cached).

---

## Voice (`lib/voice/`)

Factory: `getVoiceProvider()` ← `VOICE_PROVIDER`.

| Provider | STT | TTS |
| --- | --- | --- |
| `mock` | Deterministic transcript | Silent WAV |
| `openai` | Whisper (`VOICE_STT_MODEL`) | OpenAI TTS (`VOICE_TTS_MODEL` / `VOICE_TTS_VOICE`) |

APIs: `/api/interviews/[id]/voice/transcribe`, `.../tts`.

Room UX ([`components/voice/`](../components/voice/)):

1. TTS speaks the question (auto-listen after speak).
2. Mic stays on until pause or mic stop → STT → **editable** draft.
3. Candidate taps **Finish Answer** to submit (no auto-submit on silence).

Scoring uses the same interview engine as text. Anti-bias rules in evaluator/report prompts forbid judging accent or demographics.

---

## Code execution (`lib/code-execution/`)

Factory: `getCodeExecutionProvider()` ← `CODE_EXECUTION_PROVIDER`.

| Provider | Behavior |
| --- | --- |
| `mock` | Fixture-based grading for seeded challenges |
| `judge0` | Remote sandbox via `JUDGE0_URL` |

Hidden tests and expected outputs stay server-side. Practice: `/practice`. Interview coding/mixed: `/interviews/[id]/coding`.
