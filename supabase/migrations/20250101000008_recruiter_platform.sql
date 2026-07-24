-- InterviewForge — 0008: recruiter organizations, assessments
-- Schema only in this phase (no UI yet — see Phase 6 in the roadmap).
-- Included now so later phases are additive, not migrations that reshape
-- existing tables.

create table public.recruiter_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  branding jsonb not null default '{}'::jsonb,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.recruiter_organizations
  for each row execute function public.set_updated_at();

create table public.recruiter_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.recruiter_organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('owner', 'admin', 'member')),
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.recruiter_organizations (id) on delete cascade,
  title text not null,
  job_role text,
  technology_ids uuid[] not null default '{}',
  topic_ids uuid[] not null default '{}',
  question_ids uuid[] not null default '{}',
  coding_challenge_ids uuid[] not null default '{}',
  duration_minutes integer not null default 45 check (duration_minutes > 0),
  expires_at timestamptz,
  candidate_limit integer check (candidate_limit is null or candidate_limit > 0),
  passing_score numeric(5, 2) check (passing_score is null or (passing_score >= 0 and passing_score <= 100)),
  anti_cheating_settings jsonb not null default '{}'::jsonb,
  branding jsonb not null default '{}'::jsonb,
  invitation_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  status content_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assessments_organization_id_idx on public.assessments (organization_id);

create trigger set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

create table public.assessment_candidates (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  candidate_id uuid references public.profiles (id) on delete set null,
  candidate_email text not null,
  session_id uuid references public.interview_sessions (id) on delete set null,
  status assessment_candidate_status not null default 'invited',
  recruiter_notes text,
  score numeric(5, 2) check (score is null or (score >= 0 and score <= 100)),
  invited_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (assessment_id, candidate_email)
);

create index assessment_candidates_assessment_id_idx on public.assessment_candidates (assessment_id);

-- ---------------------------------------------------------------------------
-- RLS: organization membership gated. No candidate-facing UI reads these
-- tables in this phase, but policies are correct from day one.
-- ---------------------------------------------------------------------------
alter table public.recruiter_organizations enable row level security;
alter table public.recruiter_members enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_candidates enable row level security;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.recruiter_members m
    where m.organization_id = org_id and m.profile_id = auth.uid()
  ) or public.is_admin();
$$;

create policy "org members read organization" on public.recruiter_organizations
  for select to authenticated using (public.is_org_member(id));

create policy "org owner manages organization" on public.recruiter_organizations
  for all to authenticated using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "org members read membership" on public.recruiter_members
  for select to authenticated using (public.is_org_member(organization_id));

create policy "org admins manage membership" on public.recruiter_members
  for all to authenticated using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "org members read assessments" on public.assessments
  for select to authenticated using (public.is_org_member(organization_id));

create policy "org members manage assessments" on public.assessments
  for all to authenticated using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));

create policy "org members read assessment candidates" on public.assessment_candidates
  for select to authenticated using (
    exists (select 1 from public.assessments a where a.id = assessment_id and public.is_org_member(a.organization_id))
    or candidate_id = auth.uid()
  );

create policy "org members manage assessment candidates" on public.assessment_candidates
  for insert to authenticated with check (
    exists (select 1 from public.assessments a where a.id = assessment_id and public.is_org_member(a.organization_id))
  );

create policy "org members update assessment candidates" on public.assessment_candidates
  for update to authenticated using (
    exists (select 1 from public.assessments a where a.id = assessment_id and public.is_org_member(a.organization_id))
    or candidate_id = auth.uid()
  )
  with check (
    exists (select 1 from public.assessments a where a.id = assessment_id and public.is_org_member(a.organization_id))
    or candidate_id = auth.uid()
  );
