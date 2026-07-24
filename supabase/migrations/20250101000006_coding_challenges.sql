-- InterviewForge — 0006: coding challenges, test cases, submissions
-- Schema only in this phase. Execution against Judge0 (or another sandboxed
-- runner behind the CodeExecutionProvider interface) is wired up in the
-- Coding Challenges phase; code_submissions.status will stay 'pending'
-- until that provider is implemented.

create table public.coding_challenges (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid references public.technologies (id) on delete set null,
  topic_id uuid references public.topics (id) on delete set null,
  title text not null,
  slug text not null unique,
  problem_statement text not null,
  difficulty difficulty_level not null default 'medium',
  examples jsonb not null default '[]'::jsonb,
  constraints text,
  starter_code jsonb not null default '{}'::jsonb, -- { [language]: string }
  supported_languages text[] not null default '{}',
  expected_time_complexity text,
  expected_space_complexity text,
  rubric jsonb not null default '{}'::jsonb,
  time_limit_ms integer not null default 2000 check (time_limit_ms > 0),
  memory_limit_mb integer not null default 256 check (memory_limit_mb > 0),
  status content_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index coding_challenges_active_idx on public.coding_challenges (status, difficulty) where deleted_at is null;

create trigger set_updated_at
  before update on public.coding_challenges
  for each row execute function public.set_updated_at();

create table public.coding_test_cases (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.coding_challenges (id) on delete cascade,
  input text not null,
  expected_output text not null,
  is_hidden boolean not null default true,
  order_index integer not null default 0,
  weight numeric(4, 2) not null default 1,
  created_at timestamptz not null default now()
);

create index coding_test_cases_challenge_id_idx on public.coding_test_cases (challenge_id);

create table public.code_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.coding_challenges (id) on delete cascade,
  session_id uuid references public.interview_sessions (id) on delete set null,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  language text not null,
  source_code text not null check (char_length(source_code) <= 20000),
  status text not null default 'pending' check (
    status in ('pending', 'running', 'passed', 'failed', 'error', 'timeout')
  ),
  passed_test_count integer not null default 0,
  total_test_count integer not null default 0,
  time_complexity_estimate text,
  space_complexity_estimate text,
  execution_result jsonb not null default '{}'::jsonb,
  evaluation jsonb not null default '{}'::jsonb, -- code quality/readability/security rubric scores
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index code_submissions_candidate_id_idx on public.code_submissions (candidate_id);
create index code_submissions_session_id_idx on public.code_submissions (session_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.coding_challenges enable row level security;
alter table public.coding_test_cases enable row level security;
alter table public.code_submissions enable row level security;

create policy "approved challenges are readable" on public.coding_challenges
  for select to authenticated using (status = 'approved' or public.is_admin());

create policy "admins manage coding challenges" on public.coding_challenges
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Only VISIBLE (non-hidden) test cases are exposed to non-admins; hidden
-- cases stay server-side and are used only by the (future) execution service
-- via the admin/service-role client.
create policy "visible test cases are readable" on public.coding_test_cases
  for select to authenticated using (not is_hidden or public.is_admin());

create policy "admins manage test cases" on public.coding_test_cases
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "candidates read own submissions" on public.code_submissions
  for select to authenticated using (candidate_id = auth.uid() or public.is_admin());

create policy "candidates insert own submissions" on public.code_submissions
  for insert to authenticated with check (candidate_id = auth.uid());
