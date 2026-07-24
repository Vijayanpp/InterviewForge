-- InterviewForge — 0002: roles and profiles

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name role_name not null unique,
  description text,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.roles is
  'Lookup table for user roles. permissions jsonb allows admins to extend fine-grained capabilities without a schema change.';

create trigger set_updated_at
  before update on public.roles
  for each row execute function public.set_updated_at();

insert into public.roles (name, description) values
  ('candidate', 'Practises interviews and coding assessments.'),
  ('interviewer', 'Recruiter / interviewer that creates assessments and reviews candidates.'),
  ('admin', 'Platform administrator with full management access.');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  full_name text,
  avatar_url text,
  years_experience numeric(4, 1) check (years_experience is null or years_experience >= 0),
  current_job_role text,
  target_job_role text,
  main_skills text[] not null default '{}',
  preferred_technologies text[] not null default '{}',
  interview_goal text,
  preferred_language text not null default 'en',
  onboarding_completed_at timestamptz,
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Extends auth.users with product profile data. One row per user, 1:1 with auth.users.';

create index profiles_role_id_idx on public.profiles (role_id);
create index profiles_deleted_at_idx on public.profiles (deleted_at) where deleted_at is not null;

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-provision a profile row (default role: candidate) whenever a new
-- auth user is created (email/password or OAuth).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate_role_id uuid;
begin
  select id into candidate_role_id from public.roles where name = 'candidate';

  insert into public.profiles (id, role_id, full_name)
  values (
    new.id,
    candidate_role_id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Role helper functions used throughout RLS policies (this file onward).
-- SECURITY DEFINER so they can read `profiles` regardless of the caller's
-- own row-level policies (avoids recursive RLS evaluation). Defined here,
-- after `roles`/`profiles` exist, because LANGUAGE SQL function bodies are
-- validated against the catalog at CREATE FUNCTION time.
-- ---------------------------------------------------------------------------
create or replace function public.current_role_name()
returns role_name
language sql
stable
security definer
set search_path = public
as $$
  select r.name
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() = 'admin';
$$;

create or replace function public.is_interviewer_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_name() in ('interviewer', 'admin');
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.roles enable row level security;
alter table public.profiles enable row level security;

create policy "roles readable by authenticated users" on public.roles
  for select to authenticated using (true);

create policy "only admins manage roles" on public.roles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users read own profile" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin() or public.is_interviewer_or_admin());

create policy "users update own profile" on public.profiles
  for update to authenticated using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "users insert own profile" on public.profiles
  for insert to authenticated with check (id = auth.uid() or public.is_admin());

create policy "admins delete profiles" on public.profiles
  for delete to authenticated using (public.is_admin());
