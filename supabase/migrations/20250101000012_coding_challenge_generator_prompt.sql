-- Allow AI coding-challenge generation prompts
alter table public.ai_prompt_versions
  drop constraint if exists ai_prompt_versions_prompt_name_check;

alter table public.ai_prompt_versions
  add constraint ai_prompt_versions_prompt_name_check check (
    prompt_name in (
      'interviewer',
      'question_generator',
      'answer_evaluator',
      'coding_evaluator',
      'coding_challenge_generator',
      'behavioural_evaluator',
      'report_generator',
      'study_plan_generator'
    )
  );
