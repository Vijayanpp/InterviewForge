-- InterviewForge — 0009: subscription plans, subscriptions, payments, usage
-- Schema only in this phase (see Phase 7 in the roadmap). Plans/prices are
-- data-driven (subscription_plans), never hardcoded in application code.

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'usd',
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year', 'one_time')),
  features jsonb not null default '{}'::jsonb,
  limits jsonb not null default '{}'::jsonb, -- e.g. { "interviews_per_month": 5, "voice_enabled": false }
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.subscription_plans
  for each row execute function public.set_updated_at();

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid references public.recruiter_organizations (id) on delete cascade,
  plan_id uuid not null references public.subscription_plans (id) on delete restrict,
  status subscription_status not null default 'trialing',
  provider text not null default 'none' check (provider in ('none', 'stripe', 'paddle')),
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_owner_present check (profile_id is not null)
);

create index subscriptions_profile_id_idx on public.subscriptions (profile_id);

create trigger set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions (id) on delete set null,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  provider text not null default 'none',
  provider_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_profile_id_idx on public.payments (profile_id);

create table public.usage_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  metric text not null check (metric in ('interview_started', 'coding_run', 'report_generated', 'voice_minutes')),
  quantity numeric(10, 2) not null default 1,
  period_start date not null,
  period_end date not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index usage_records_profile_period_idx on public.usage_records (profile_id, metric, period_start);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.subscription_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.usage_records enable row level security;

create policy "plans are publicly readable" on public.subscription_plans
  for select using (is_active or public.is_admin());

create policy "admins manage plans" on public.subscription_plans
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner reads own subscription" on public.subscriptions
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());

create policy "admins manage subscriptions" on public.subscriptions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner reads own payments" on public.payments
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());

create policy "admins manage payments" on public.payments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner reads own usage" on public.usage_records
  for select to authenticated using (profile_id = auth.uid() or public.is_admin());

create policy "system inserts usage for self" on public.usage_records
  for insert to authenticated with check (profile_id = auth.uid() or public.is_admin());
