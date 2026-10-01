-- InterviewForge — 0019: pgvector knowledge chunks + interview agent events

create extension if not exists vector;

create type knowledge_source_type as enum (
  'resume',
  'job_description',
  'question_bank',
  'topic_knowledge',
  'session_summary'
);

create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type knowledge_source_type not null,
  source_id uuid,
  candidate_id uuid references public.profiles (id) on delete cascade,
  session_id uuid references public.interview_sessions (id) on delete cascade,
  content text not null check (char_length(content) <= 8000),
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now()
);

create index knowledge_chunks_source_idx
  on public.knowledge_chunks (source_type, source_id);

create index knowledge_chunks_candidate_idx
  on public.knowledge_chunks (candidate_id)
  where candidate_id is not null;

create index knowledge_chunks_embedding_idx
  on public.knowledge_chunks
  using hnsw (embedding vector_cosine_ops);

alter table public.knowledge_chunks enable row level security;

create policy "knowledge chunks owner or admin read" on public.knowledge_chunks
  for select to authenticated
  using (
    public.is_admin()
    or candidate_id = auth.uid()
    or candidate_id is null
  );

create policy "knowledge chunks owner write" on public.knowledge_chunks
  for all to authenticated
  using (public.is_admin() or candidate_id = auth.uid())
  with check (public.is_admin() or candidate_id = auth.uid());

create or replace function public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_count integer default 8,
  filter_candidate uuid default null,
  filter_source knowledge_source_type default null
)
returns table (
  id uuid,
  source_type knowledge_source_type,
  source_id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
as $$
  select
    kc.id,
    kc.source_type,
    kc.source_id,
    kc.content,
    kc.metadata,
    (1 - (kc.embedding <=> query_embedding))::double precision as similarity
  from public.knowledge_chunks kc
  where kc.embedding is not null
    and (filter_candidate is null or kc.candidate_id = filter_candidate or kc.candidate_id is null)
    and (filter_source is null or kc.source_type = filter_source)
  order by kc.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

create table public.interview_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions (id) on delete cascade,
  stage text not null check (stage in ('planning', 'retrieving', 'evaluating', 'supervising')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index interview_events_session_idx
  on public.interview_events (session_id, created_at);

alter table public.interview_events enable row level security;

create policy "interview events via session owner" on public.interview_events
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.interview_sessions s
      where s.id = interview_events.session_id
        and s.candidate_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.interview_sessions s
      where s.id = interview_events.session_id
        and s.candidate_id = auth.uid()
    )
  );
