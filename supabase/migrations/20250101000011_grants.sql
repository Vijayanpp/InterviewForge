-- InterviewForge — 0011: role privileges
--
-- Row Level Security policies only take effect *after* Postgres' ordinary
-- GRANT system allows a role to touch a table in the first place. Creating
-- tables as a superuser does not automatically give the Supabase `anon`/
-- `authenticated` roles any privileges on them, so without this migration
-- every query from the app (even ones a passing RLS policy would allow)
-- fails with "permission denied for table ...". RLS policies remain the
-- real authorization boundary for row-level access; these grants just open
-- the table up to being queried at all, per Supabase's own convention for
-- self-hosted/local projects.

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on routines to anon, authenticated, service_role;
