-- Phase 4: append anti-bias guidance to published evaluator/report prompts
-- for environments that already have Phase 2 seed data. Fresh installs get
-- the same text from supabase/seed/07_ai_prompt_versions.sql.

update public.ai_prompt_versions
set
  content = content || E'\n\nANTI-BIAS (mandatory for voice and text): Judge content and job-relevant communication only (structure, fillers, pace, clarity of reasoning). Never factor in or comment on accent, dialect, ethnicity, gender, age, appearance, or any protected characteristic. Do not penalize non-native phrasing when the technical meaning is clear.',
  change_notes = coalesce(change_notes || ' ', '') || 'Phase 4 anti-bias addendum.'
where prompt_name = 'answer_evaluator'
  and status = 'published'
  and content not like '%ANTI-BIAS%';

update public.ai_prompt_versions
set
  content = content || E'\n\nANTI-BIAS (mandatory): Communication scores may reflect fillers, pacing, and structure only. Never mention or infer accent, dialect, ethnicity, gender, age, or appearance. Prefer content quality over delivery polish.',
  change_notes = coalesce(change_notes || ' ', '') || 'Phase 4 anti-bias addendum.'
where prompt_name = 'report_generator'
  and status = 'published'
  and content not like '%ANTI-BIAS%';
