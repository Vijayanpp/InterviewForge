-- InterviewForge — 0003: technologies, topics, and the technology<->topic join
-- This is the extensibility backbone: admins add rows here (via the admin
-- UI or SQL) to introduce new technologies/topics without a code deploy.

create table public.technologies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null default 'language',
  icon text,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint technologies_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index technologies_active_sort_idx on public.technologies (is_active, sort_order) where deleted_at is null;

create trigger set_updated_at
  before update on public.technologies
  for each row execute function public.set_updated_at();

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  technology_id uuid not null references public.technologies (id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (technology_id, slug)
);

create index topics_technology_id_idx on public.topics (technology_id) where deleted_at is null;

create trigger set_updated_at
  before update on public.topics
  for each row execute function public.set_updated_at();

-- Cross-technology topic sharing (e.g. "Testing" applies to React AND Angular)
-- without duplicating rows. topics.technology_id remains the topic's "home".
create table public.technology_topics (
  technology_id uuid not null references public.technologies (id) on delete cascade,
  topic_id uuid not null references public.topics (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (technology_id, topic_id)
);

-- ---------------------------------------------------------------------------
-- RLS: readable by everyone (including anonymous, for public marketing
-- pages that list supported technologies); writes restricted to admins.
-- ---------------------------------------------------------------------------
alter table public.technologies enable row level security;
alter table public.topics enable row level security;
alter table public.technology_topics enable row level security;

create policy "technologies are publicly readable" on public.technologies
  for select using (deleted_at is null or public.is_admin());

create policy "admins manage technologies" on public.technologies
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "topics are publicly readable" on public.topics
  for select using (deleted_at is null or public.is_admin());

create policy "admins manage topics" on public.topics
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "technology_topics are publicly readable" on public.technology_topics
  for select using (true);

create policy "admins manage technology_topics" on public.technology_topics
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
