-- InterviewForge — 0010: versioned AI prompts + audit logs

create table public.ai_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_name text not null check (
    prompt_name in (
      'interviewer',
      'question_generator',
      'answer_evaluator',
      'coding_evaluator',
      'behavioural_evaluator',
      'report_generator',
      'study_plan_generator'
    )
  ),
  version integer not null,
  status prompt_status not null default 'draft',
  content text not null,
  model_settings jsonb not null default '{}'::jsonb, -- { model, temperature, max_tokens, ... }
  change_notes text,
  created_by uuid references public.profiles (id) on delete set null,
  published_by uuid references public.profiles (id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (prompt_name, version)
);

create index ai_prompt_versions_published_idx
  on public.ai_prompt_versions (prompt_name)
  where status = 'published';

-- Only one published version per prompt_name at a time.
create unique index ai_prompt_versions_one_published_per_name
  on public.ai_prompt_versions (prompt_name)
  where status = 'published';

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_actor_idx on public.audit_logs (actor_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.answer_evaluations
  add constraint answer_evaluations_prompt_version_id_fkey
  foreign key (prompt_version_id) references public.ai_prompt_versions (id) on delete set null;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.ai_prompt_versions enable row level security;
alter table public.audit_logs enable row level security;

create policy "published prompts readable by service context" on public.ai_prompt_versions
  for select to authenticated using (status = 'published' or public.is_admin());

create policy "only admins write prompt versions" on public.ai_prompt_versions
  for insert to authenticated with check (public.is_admin());

create policy "only admins update prompt versions" on public.ai_prompt_versions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Audit logs are append-only and admin-readable; nobody can update/delete
-- via the API (only insert, by any authenticated actor acting on their own
-- behalf, and select by admins).
create policy "admins read audit logs" on public.audit_logs
  for select to authenticated using (public.is_admin());

create policy "authenticated users write audit logs" on public.audit_logs
  for insert to authenticated with check (actor_id = auth.uid() or actor_id is null);
