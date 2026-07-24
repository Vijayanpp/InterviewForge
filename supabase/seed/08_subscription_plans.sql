-- InterviewForge seed — 08: subscription plans
-- Data-driven pricing/limits — never hardcode plan prices or feature gates
-- in application code. Billing UI/enforcement itself is a later phase; this
-- seed only ensures the schema has real rows to read from day one.

insert into public.subscription_plans (slug, name, description, price_cents, currency, billing_interval, features, limits, is_active, sort_order)
values
  ('free', 'Free', 'Get started with practice interviews.', 0, 'usd', 'month',
   '{"textInterviews": true, "reports": true, "codingChallenges": false, "voiceInterviews": false}'::jsonb,
   '{"interviews_per_month": 3}'::jsonb, true, 10),
  ('pro', 'Pro', 'Unlimited practice with full feedback history.', 1900, 'usd', 'month',
   '{"textInterviews": true, "reports": true, "codingChallenges": true, "voiceInterviews": false}'::jsonb,
   '{"interviews_per_month": null}'::jsonb, true, 20),
  ('team', 'Team', 'For bootcamps and hiring teams running assessments.', 4900, 'usd', 'month',
   '{"textInterviews": true, "reports": true, "codingChallenges": true, "voiceInterviews": true, "recruiterAssessments": true}'::jsonb,
   '{"interviews_per_month": null, "seats": 10}'::jsonb, true, 30)
on conflict (slug) do nothing;
