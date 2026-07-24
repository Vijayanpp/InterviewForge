-- InterviewForge — 0007: final interview reports

create table public.interview_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  overall_score numeric(5, 2) not null check (overall_score >= 0 and overall_score <= 100),
  hire_recommendation hire_recommendation not null,
  recommendation_rationale text not null,
  technical_score numeric(5, 2) check (technical_score >= 0 and technical_score <= 100),
  communication_score numeric(5, 2) check (communication_score >= 0 and communication_score <= 100),
  problem_solving_score numeric(5, 2) check (problem_solving_score >= 0 and problem_solving_score <= 100),
  coding_score numeric(5, 2) check (coding_score >= 0 and coding_score <= 100),
  confidence_score numeric(3, 2) not null default 0.7 check (confidence_score >= 0 and confidence_score <= 1),
  topic_scores jsonb not null default '[]'::jsonb,
  strongest_areas jsonb not null default '[]'::jsonb,
  weakest_areas jsonb not null default '[]'::jsonb,
  critical_gaps jsonb not null default '[]'::jsonb,
  questions_answered_well jsonb not null default '[]'::jsonb,
  questions_answered_poorly jsonb not null default '[]'::jsonb,
  question_feedback jsonb not null default '[]'::jsonb, -- question-by-question detail
  coding_analysis jsonb not null default '[]'::jsonb,
  recommended_topics jsonb not null default '[]'::jsonb,
  seven_day_plan jsonb not null default '[]'::jsonb,
  thirty_day_plan jsonb not null default '[]'::jsonb,
  recommended_next jsonb not null default '{}'::jsonb,
  comparison_with_previous jsonb not null default '{}'::jsonb,
  model_used text,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index interview_reports_session_id_key on public.interview_reports (session_id);

alter table public.interview_reports enable row level security;

create policy "candidates read own reports" on public.interview_reports
  for select to authenticated using (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_id and (s.candidate_id = auth.uid() or public.is_admin() or public.is_interviewer_or_admin())
    )
  );

create policy "system inserts reports for own sessions" on public.interview_reports
  for insert to authenticated with check (
    exists (select 1 from public.interview_sessions s where s.id = session_id and s.candidate_id = auth.uid())
  );
