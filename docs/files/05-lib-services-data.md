# `lib/services` and `lib/repositories`

Services own workflow. Repositories own SQL. Neither renders UI.

## Interview engine (BFF adapter)

| File | Purpose |
| --- | --- |
| [`lib/services/interview-engine.ts`](../../lib/services/interview-engine.ts) | Public `startSession` / `submitAnswer` / `endSession`; switches on `INTERVIEW_ENGINE` |
| [`lib/services/interview-engine-graph.ts`](../../lib/services/interview-engine-graph.ts) | Invokes LangGraph, persists Q/A/eval/report/events, stores plan on `session.config.agent` |
| [`lib/services/interview-engine-legacy.ts`](../../lib/services/interview-engine-legacy.ts) | Pre-graph engine (single `AiProvider` + `decideNextAction`); rollback path |
| [`lib/services/scoring.ts`](../../lib/services/scoring.ts) | Weighted scores, topic coverage, `decideNextAction` hard caps |
| [`lib/services/knowledge-ingest.ts`](../../lib/services/knowledge-ingest.ts) | Chunk + embed + upsert `knowledge_chunks` (resume, JD, bank) |
| [`lib/services/question-bank.ts`](../../lib/services/question-bank.ts) | Admin AI draft (`skipOpening: true`) + ingest |
| [`lib/services/dashboard-service.ts`](../../lib/services/dashboard-service.ts) | Candidate dashboard aggregates |
| [`lib/services/coding-engine.ts`](../../lib/services/coding-engine.ts) | Run / submit against test cases |
| [`lib/services/coding-scoring.ts`](../../lib/services/coding-scoring.ts) | Weighted coding score |
| [`lib/services/coding-practice.ts`](../../lib/services/coding-practice.ts) | Persist AI-generated practice challenges |

## Repositories

| File | Table / job |
| --- | --- |
| [`interview-sessions.repo.ts`](../../lib/repositories/interview-sessions.repo.ts) | Sessions; `config` holds agent plan |
| [`interview-questions.repo.ts`](../../lib/repositories/interview-questions.repo.ts) | Live questions |
| [`question-bank.repo.ts`](../../lib/repositories/question-bank.repo.ts) | Bank rows (`session_id IS NULL`) |
| [`candidate-answers.repo.ts`](../../lib/repositories/candidate-answers.repo.ts) | Answers |
| [`answer-evaluations.repo.ts`](../../lib/repositories/answer-evaluations.repo.ts) | Grades |
| [`interview-reports.repo.ts`](../../lib/repositories/interview-reports.repo.ts) | Reports |
| [`interview-events.repo.ts`](../../lib/repositories/interview-events.repo.ts) | Graph stage traces (best-effort) |
| [`knowledge-chunks.repo.ts`](../../lib/repositories/knowledge-chunks.repo.ts) | Vector chunks |
| [`documents.repo.ts`](../../lib/repositories/documents.repo.ts) | Resumes + job descriptions |
| [`profiles.repo.ts`](../../lib/repositories/profiles.repo.ts) | Profiles |
| [`technologies.repo.ts`](../../lib/repositories/technologies.repo.ts) | Tech catalog |
| [`topics.repo.ts`](../../lib/repositories/topics.repo.ts) | Topics |
| [`coding-challenges.repo.ts`](../../lib/repositories/coding-challenges.repo.ts) | Challenges |
| [`coding-test-cases.repo.ts`](../../lib/repositories/coding-test-cases.repo.ts) | Test cases |
| [`code-submissions.repo.ts`](../../lib/repositories/code-submissions.repo.ts) | Submissions |
| [`assessments.repo.ts`](../../lib/repositories/assessments.repo.ts) | Recruiter assessments / invites |
| [`admin-stats.repo.ts`](../../lib/repositories/admin-stats.repo.ts) | Admin dashboard counts |

## Server actions

| File | Purpose |
| --- | --- |
| [`lib/actions/admin-actions.ts`](../../lib/actions/admin-actions.ts) | Admin CRUD + AI draft + bank ingest |
| [`lib/actions/recruiter-actions.ts`](../../lib/actions/recruiter-actions.ts) | Org, assessments, invites |
| [`lib/actions/profile-actions.ts`](../../lib/actions/profile-actions.ts) | Profile updates |
| [`lib/actions/onboarding-actions.ts`](../../lib/actions/onboarding-actions.ts) | Onboarding write |
