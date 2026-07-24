-- InterviewForge — 0004: resumes and job descriptions
-- Files themselves live in private Supabase Storage buckets (see storage
-- policies below); these tables hold metadata + signed-URL references.
-- Content is private by default — never publicly readable.

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  file_path text not null,
  file_name text not null,
  mime_type text not null check (
    mime_type in ('application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain')
  ),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 10485760), -- 10MB cap
  parsed_text text,
  is_primary boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resumes_candidate_id_idx on public.resumes (candidate_id) where deleted_at is null;

create trigger set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

create table public.job_descriptions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  company text,
  source text not null default 'paste' check (source in ('paste', 'upload', 'url')),
  content text not null check (char_length(content) <= 20000),
  file_path text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index job_descriptions_candidate_id_idx on public.job_descriptions (candidate_id) where deleted_at is null;

create trigger set_updated_at
  before update on public.job_descriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: strictly owner + admin. Never candidate-to-candidate visible.
-- ---------------------------------------------------------------------------
alter table public.resumes enable row level security;
alter table public.job_descriptions enable row level security;

create policy "owner manages own resumes" on public.resumes
  for all to authenticated using (candidate_id = auth.uid() or public.is_admin())
  with check (candidate_id = auth.uid() or public.is_admin());

create policy "owner manages own job descriptions" on public.job_descriptions
  for all to authenticated using (candidate_id = auth.uid() or public.is_admin())
  with check (candidate_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets (private). Signed URLs must be used for all reads.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resumes', 'resumes', false, 10485760,
  array['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
on conflict (id) do nothing;

create policy "resume owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resume owner write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "resume owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
