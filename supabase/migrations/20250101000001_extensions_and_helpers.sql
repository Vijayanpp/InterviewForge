-- InterviewForge — 0001: extensions, enums, and shared helper functions/triggers
-- These primitives are reused by every subsequent migration.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- Shared enums
-- ---------------------------------------------------------------------------
create type role_name as enum ('candidate', 'interviewer', 'admin');

create type experience_level as enum ('fresher', 'junior', 'mid', 'senior', 'lead', 'architect');

create type difficulty_level as enum ('easy', 'medium', 'hard', 'adaptive');

create type interview_type as enum (
  'technical',
  'coding',
  'mixed',
  'behavioural',
  'system_design',
  'resume_based',
  'job_description_based'
);

create type interview_mode as enum ('text', 'voice', 'coding');

create type session_status as enum ('draft', 'in_progress', 'completed', 'abandoned');

create type question_type as enum (
  'conceptual',
  'scenario_based',
  'debugging',
  'output_prediction',
  'code_review',
  'coding_challenge',
  'architecture',
  'multiple_choice',
  'behavioural',
  'project_experience',
  'system_design'
);

create type content_status as enum ('draft', 'approved', 'rejected', 'archived');

create type hire_recommendation as enum ('strong_hire', 'hire', 'borderline', 'not_ready_yet');

create type prompt_status as enum ('draft', 'published', 'archived');

create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');

create type assessment_candidate_status as enum ('invited', 'in_progress', 'completed', 'expired');

-- ---------------------------------------------------------------------------
-- updated_at maintenance trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- NOTE: role helper functions (current_role_name/is_admin/is_interviewer_or_admin)
-- are defined in 20250101000002_roles_and_profiles.sql, once the `roles`
-- and `profiles` tables they query actually exist. LANGUAGE SQL function
-- bodies are validated against the catalog at CREATE FUNCTION time, so
-- defining them here (before those tables exist) fails migration.
