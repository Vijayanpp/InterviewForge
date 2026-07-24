-- InterviewForge — 0005: interview templates, sessions, questions, answers, evaluations
-- This is the heart of the text-interview MVP.

create table public.interview_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  interview_type interview_type not null,
  technology_ids uuid[] not null default '{}',
  topic_ids uuid[] not null default '{}',
  experience_level experience_level not null,
  difficulty difficulty_level not null default 'medium',
  duration_minutes integer not null default 30 check (duration_minutes > 0 and duration_minutes <= 240),
  is_public boolean not null default false,
  status content_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index interview_templates_public_idx on public.interview_templates (is_public) where deleted_at is null;

create trigger set_updated_at
  before update on public.interview_templates
  for each row execute function public.set_updated_at();

create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  template_id uuid references public.interview_templates (id) on delete set null,
  interview_type interview_type not null,
  mode interview_mode not null default 'text',
  technology_ids uuid[] not null default '{}',
  topic_ids uuid[] not null default '{}',
  experience_level experience_level not null,
  difficulty difficulty_level not null default 'medium',
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 240),
  target_company text,
  custom_instructions text check (custom_instructions is null or char_length(custom_instructions) <= 2000),
  resume_id uuid references public.resumes (id) on delete set null,
  job_description_id uuid references public.job_descriptions (id) on delete set null,
  config jsonb not null default '{}'::jsonb,
  status session_status not null default 'draft',
  current_question_index integer not null default 0,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interview_sessions_technology_ids_not_empty check (array_length(technology_ids, 1) > 0)
);

create index interview_sessions_candidate_id_idx on public.interview_sessions (candidate_id);
create index interview_sessions_status_idx on public.interview_sessions (status);

create trigger set_updated_at
  before update on public.interview_sessions
  for each row execute function public.set_updated_at();

-- interview_questions serves a dual purpose, matching the spec's flat table
-- list (no separate "question bank" table):
--   * session_id IS NULL  -> a reusable question-bank entry (admin/AI authored,
--     goes through draft/approved/rejected/archived moderation via `status`)
--   * session_id IS NOT NULL -> a concrete question instance asked inside a
--     session, optionally sourced from a bank entry via source_question_id,
--     or fully ad-hoc AI-generated (source_question_id IS NULL).
create table public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.interview_sessions (id) on delete cascade,
  source_question_id uuid references public.interview_questions (id) on delete set null,
  technology_id uuid not null references public.technologies (id) on delete restrict,
  topic_id uuid references public.topics (id) on delete set null,
  experience_levels experience_level[] not null default '{}',
  difficulty difficulty_level not null default 'medium',
  question_type question_type not null default 'conceptual',
  title text,
  body text not null check (char_length(body) <= 4000),
  expected_concepts jsonb not null default '[]'::jsonb,
  rubric jsonb not null default '{}'::jsonb,
  max_score numeric(4, 1) not null default 10,
  suggested_follow_ups jsonb not null default '[]'::jsonb,
  reference_answer text,
  status content_status not null default 'approved',
  generated_by text not null default 'admin' check (generated_by in ('admin', 'ai', 'system')),
  order_index integer,
  asked_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interview_questions_bank_requires_no_session_order
    check (session_id is not null or order_index is null)
);

create index interview_questions_session_id_idx on public.interview_questions (session_id);
create index interview_questions_bank_idx
  on public.interview_questions (technology_id, topic_id, difficulty, status)
  where session_id is null and deleted_at is null;
create index interview_questions_body_trgm_idx on public.interview_questions using gin (body gin_trgm_ops);

create trigger set_updated_at
  before update on public.interview_questions
  for each row execute function public.set_updated_at();

create table public.candidate_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.interview_questions (id) on delete cascade,
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  answer_text text not null check (char_length(answer_text) <= 8000),
  transcript jsonb,
  is_retry boolean not null default false,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index candidate_answers_session_id_idx on public.candidate_answers (session_id);
create index candidate_answers_question_id_idx on public.candidate_answers (question_id);

create table public.answer_evaluations (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.candidate_answers (id) on delete cascade,
  scores jsonb not null default '{}'::jsonb,
  weighted_score numeric(5, 2) not null check (weighted_score >= 0 and weighted_score <= 10),
  strengths jsonb not null default '[]'::jsonb,
  missing_points jsonb not null default '[]'::jsonb,
  incorrect_statements jsonb not null default '[]'::jsonb,
  ideal_answer text,
  improvement_advice text,
  follow_up_question text,
  evaluator_confidence numeric(3, 2) not null default 0.7 check (evaluator_confidence >= 0 and evaluator_confidence <= 1),
  model_used text,
  prompt_version_id uuid,
  created_at timestamptz not null default now()
);

create unique index answer_evaluations_answer_id_key on public.answer_evaluations (answer_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.interview_templates enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_questions enable row level security;
alter table public.candidate_answers enable row level security;
alter table public.answer_evaluations enable row level security;

create policy "public templates readable by all authenticated" on public.interview_templates
  for select to authenticated using (is_public or created_by = auth.uid() or public.is_admin());

create policy "owners and admins manage templates" on public.interview_templates
  for all to authenticated using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

create policy "candidates read own sessions" on public.interview_sessions
  for select to authenticated using (
    candidate_id = auth.uid() or public.is_admin() or public.is_interviewer_or_admin()
  );

create policy "candidates manage own sessions" on public.interview_sessions
  for insert to authenticated with check (candidate_id = auth.uid());

create policy "candidates update own sessions" on public.interview_sessions
  for update to authenticated using (candidate_id = auth.uid() or public.is_admin())
  with check (candidate_id = auth.uid() or public.is_admin());

-- Question bank rows (session_id is null): readable by admins always; by
-- candidates/interviewers only when approved (never expose draft/rejected
-- content, and reference_answer/rubric are additionally stripped at the
-- service layer before reaching the client).
create policy "approved bank questions are readable" on public.interview_questions
  for select to authenticated using (
    (session_id is null and status = 'approved')
    or (session_id is not null and exists (
      select 1 from public.interview_sessions s
      where s.id = interview_questions.session_id
        and (s.candidate_id = auth.uid() or public.is_admin())
    ))
    or public.is_admin()
  );

create policy "admins manage bank questions" on public.interview_questions
  for insert to authenticated with check (session_id is null and public.is_admin());

create policy "admins update bank questions" on public.interview_questions
  for update to authenticated using (
    public.is_admin()
    or (session_id is not null and exists (
      select 1 from public.interview_sessions s
      where s.id = interview_questions.session_id and s.candidate_id = auth.uid()
    ))
  )
  with check (
    public.is_admin()
    or (session_id is not null and exists (
      select 1 from public.interview_sessions s
      where s.id = interview_questions.session_id and s.candidate_id = auth.uid()
    ))
  );

create policy "service role inserts session questions" on public.interview_questions
  for insert to authenticated with check (
    session_id is not null and exists (
      select 1 from public.interview_sessions s
      where s.id = interview_questions.session_id and s.candidate_id = auth.uid()
    )
  );

create policy "candidates read own answers" on public.candidate_answers
  for select to authenticated using (
    exists (select 1 from public.interview_sessions s where s.id = session_id and (s.candidate_id = auth.uid() or public.is_admin()))
  );

create policy "candidates insert own answers" on public.candidate_answers
  for insert to authenticated with check (
    exists (select 1 from public.interview_sessions s where s.id = session_id and s.candidate_id = auth.uid())
  );

create policy "candidates read own evaluations" on public.answer_evaluations
  for select to authenticated using (
    exists (
      select 1 from public.candidate_answers a
      join public.interview_sessions s on s.id = a.session_id
      where a.id = answer_id and (s.candidate_id = auth.uid() or public.is_admin())
    )
  );

create policy "system inserts evaluations for own sessions" on public.answer_evaluations
  for insert to authenticated with check (
    exists (
      select 1 from public.candidate_answers a
      join public.interview_sessions s on s.id = a.session_id
      where a.id = answer_id and s.candidate_id = auth.uid()
    )
  );
