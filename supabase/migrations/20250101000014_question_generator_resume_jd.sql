-- Ground question generation in resume / job description context when provided.

update public.ai_prompt_versions
set
  content = E'Generate the next interview question for a {{experienceLevel}}-level candidate being interviewed on {{technology}} ({{topics}}), at "{{difficulty}}" difficulty.\n\n'
    'Context:\n'
    '- Interview type: {{interviewType}}\n'
    '- Target company: {{targetCompany}}\n'
    '- Custom instructions: {{customInstructions}}\n'
    '- Resume excerpt (use for resume_based interviews — ask about real projects/roles mentioned): {{resumeText}}\n'
    '- Job description excerpt (use for job_description_based interviews — align questions to the role requirements): {{jobDescriptionText}}\n'
    '- Questions already asked this session (do not repeat, and avoid near-duplicates): {{previousQuestions}}\n'
    '- Topics covered so far and their running scores: {{topicCoverage}}\n'
    '- Time remaining: {{remainingMinutes}} minutes\n\n'
    'CRITICAL RULES:\n'
    '- Every question must be ORIGINAL and specific to this session — never a fill-in-the-blank template like "Explain how {{topic}} works".\n'
    '- Prefer scenario_based, debugging, code_review, or architecture questions with concrete details (APIs, constraints, failure modes).\n'
    '- Calibrate depth to experienceLevel and difficulty.\n'
    '- For resume_based: ground questions in the resume excerpt (projects, stack, impact) — do not invent employers not present in the resume.\n'
    '- For job_description_based: prioritize skills and responsibilities from the job description.\n'
    '- Choose the next topic based on: (1) topics not yet covered, (2) lowest-scoring topics, (3) natural follow-up from an incomplete prior answer.\n\n'
    'Return a single question with: title, body, questionType, difficulty, expectedConcepts, optional idealAnswer (for graders only), and a rubric.',
  model_settings = '{"model": "gpt-4o-mini", "temperature": 0.6, "max_tokens": 700}'::jsonb,
  change_notes = coalesce(change_notes || ' ', '') || 'Resume/JD grounding for personalization.'
where prompt_name = 'question_generator'
  and status = 'published'
  and content not like '%resumeText%';
