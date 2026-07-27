-- InterviewForge — 00018: proctoring + per-candidate invite tokens
-- Extends recruiter assessments for heavy client-side proctoring (webcam/screen
-- recordings, violation events) and single-use invite links.

-- ---------------------------------------------------------------------------
-- assessment_candidates: per-invite token + integrity fields
-- ---------------------------------------------------------------------------
alter table public.assessment_candidates
  add column if not exists invite_token text,
  add column if not exists expires_at timestamptz,
  add column if not exists opened_at timestamptz,
  add column if not exists integrity_score numeric(5, 2),
  add column if not exists integrity_flagged boolean not null default false,
  add column if not exists integrity_summary jsonb not null default '{}'::jsonb;

update public.assessment_candidates
set invite_token = encode(gen_random_bytes(16), 'hex')
where invite_token is null;

alter table public.assessment_candidates
  alter column invite_token set not null,
  alter column invite_token set default encode(gen_random_bytes(16), 'hex');

create unique index if not exists assessment_candidates_invite_token_uidx
  on public.assessment_candidates (invite_token);

-- Optional mode for assessment-driven AI sessions (voice default for proctored UX).
alter table public.assessments
  add column if not exists interview_mode text not null default 'voice'
    check (interview_mode in ('text', 'voice', 'coding'));

-- ---------------------------------------------------------------------------
-- Proctoring events + recordings
-- ---------------------------------------------------------------------------
create table if not exists public.proctoring_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  assessment_candidate_id uuid references public.assessment_candidates (id) on delete set null,
  event_type text not null,
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'critical')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists proctoring_events_session_id_idx
  on public.proctoring_events (session_id, created_at);

create table if not exists public.proctoring_recordings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  assessment_candidate_id uuid references public.assessment_candidates (id) on delete set null,
  kind text not null check (kind in ('webcam', 'screen')),
  storage_path text not null,
  chunk_index integer not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  byte_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index if not exists proctoring_recordings_session_id_idx
  on public.proctoring_recordings (session_id, kind, chunk_index);

alter table public.proctoring_events enable row level security;
alter table public.proctoring_recordings enable row level security;

-- Candidate owns the interview session → can insert/read own events & recordings.
create policy "candidate read own proctoring events" on public.proctoring_events
  for select to authenticated using (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_id and s.candidate_id = auth.uid()
    )
    or exists (
      select 1 from public.assessment_candidates ac
      join public.assessments a on a.id = ac.assessment_id
      where ac.id = assessment_candidate_id and public.is_org_member(a.organization_id)
    )
  );

create policy "candidate insert own proctoring events" on public.proctoring_events
  for insert to authenticated with check (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_id and s.candidate_id = auth.uid()
    )
  );

create policy "candidate read own proctoring recordings" on public.proctoring_recordings
  for select to authenticated using (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_id and s.candidate_id = auth.uid()
    )
    or exists (
      select 1 from public.assessment_candidates ac
      join public.assessments a on a.id = ac.assessment_id
      where ac.id = assessment_candidate_id and public.is_org_member(a.organization_id)
    )
  );

create policy "candidate insert own proctoring recordings" on public.proctoring_recordings
  for insert to authenticated with check (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_id and s.candidate_id = auth.uid()
    )
  );

create policy "candidate update own proctoring recordings" on public.proctoring_recordings
  for update to authenticated using (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_id and s.candidate_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.interview_sessions s
      where s.id = session_id and s.candidate_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Private storage bucket for proctoring media
-- Path: {session_id}/{kind}/{chunk}.{ext}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proctoring',
  'proctoring',
  false,
  104857600,
  array['video/webm', 'video/mp4', 'audio/webm', 'application/octet-stream']
)
on conflict (id) do nothing;

drop policy if exists "proctoring candidate write" on storage.objects;
create policy "proctoring candidate write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'proctoring'
    and exists (
      select 1 from public.interview_sessions s
      where s.id::text = (storage.foldername(name))[1]
        and s.candidate_id = auth.uid()
    )
  );

drop policy if exists "proctoring candidate read" on storage.objects;
create policy "proctoring candidate read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'proctoring'
    and exists (
      select 1 from public.interview_sessions s
      where s.id::text = (storage.foldername(name))[1]
        and s.candidate_id = auth.uid()
    )
  );

drop policy if exists "proctoring org member read" on storage.objects;
create policy "proctoring org member read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'proctoring'
    and exists (
      select 1
      from public.interview_sessions s
      join public.assessment_candidates ac on ac.session_id = s.id
      join public.assessments a on a.id = ac.assessment_id
      where s.id::text = (storage.foldername(name))[1]
        and public.is_org_member(a.organization_id)
    )
  );
