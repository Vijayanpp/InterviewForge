# `supabase/` — schema and seed

Apply with `pnpm db:reset` (migrate + seed) or `pnpm db:migrate`.

## Config

| File | Purpose |
| --- | --- |
| [`config.toml`](../../supabase/config.toml) | Local CLI (Auth, API, Storage) |
| [`scripts/seed.mjs`](../../scripts/seed.mjs) | Applies seed SQL in order |

## Migrations (order)

| File | Purpose |
| --- | --- |
| [`20250101000001_extensions_and_helpers.sql`](../../supabase/migrations/20250101000001_extensions_and_helpers.sql) | pgcrypto, pg_trgm, enums, `set_updated_at` |
| [`…00002_roles_and_profiles.sql`](../../supabase/migrations/20250101000002_roles_and_profiles.sql) | Roles, profiles, RLS helpers |
| [`…00003_technologies_and_topics.sql`](../../supabase/migrations/20250101000003_technologies_and_topics.sql) | Catalog |
| [`…00004_resumes_and_job_descriptions.sql`](../../supabase/migrations/20250101000004_resumes_and_job_descriptions.sql) | Docs + storage bucket |
| [`…00005_interview_core.sql`](../../supabase/migrations/20250101000005_interview_core.sql) | Sessions, questions, answers, evaluations |
| [`…00006_coding_challenges.sql`](../../supabase/migrations/20250101000006_coding_challenges.sql) | Challenges, tests, submissions |
| [`…00007_interview_reports.sql`](../../supabase/migrations/20250101000007_interview_reports.sql) | Reports |
| [`…00008_recruiter_platform.sql`](../../supabase/migrations/20250101000008_recruiter_platform.sql) | Orgs, assessments, invites |
| [`…00009_billing.sql`](../../supabase/migrations/20250101000009_billing.sql) | Plans (metering deferred) |
| [`…00010_ai_prompts_and_audit.sql`](../../supabase/migrations/20250101000010_ai_prompts_and_audit.sql) | Prompt versions |
| [`…00011_grants.sql`](../../supabase/migrations/20250101000011_grants.sql) | Table grants for `authenticated` |
| [`…00012`–`00017`](../../supabase/migrations/) | Prompt patches: coding generator, anti-bias, resume/JD, greeting, Maya, avatars |
| [`…00018_proctoring.sql`](../../supabase/migrations/20250101000018_proctoring.sql) | Events + recordings |
| [`…00019_knowledge_and_interview_events.sql`](../../supabase/migrations/20250101000019_knowledge_and_interview_events.sql) | `vector`, `knowledge_chunks`, `match_knowledge_chunks`, `interview_events` |

## Seed

| File | Purpose |
| --- | --- |
| [`01_technologies.sql`](../../supabase/seed/01_technologies.sql) | 21+ stacks |
| [`02_javascript.sql`](../../supabase/seed/02_javascript.sql) | JS topics / sample questions |
| [`03_react.sql`](../../supabase/seed/03_react.sql) | React |
| [`04_angular.sql`](../../supabase/seed/04_angular.sql) | Angular |
| [`05_python.sql`](../../supabase/seed/05_python.sql) | Python |
| [`06_css3.sql`](../../supabase/seed/06_css3.sql) | CSS |
| [`07_ai_prompt_versions.sql`](../../supabase/seed/07_ai_prompt_versions.sql) | Published prompts |
| [`08_subscription_plans.sql`](../../supabase/seed/08_subscription_plans.sql) | Plan rows |
| [`09_coding_challenges.sql`](../../supabase/seed/09_coding_challenges.sql) | Seeded challenges |

After prompt or knowledge migrations, restart `pnpm dev` so in-process caches reload.
