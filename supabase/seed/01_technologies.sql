-- InterviewForge seed — 01: technologies
-- All 21 technologies are inserted as active rows so candidates can select
-- them in the wizard immediately. Deep topic trees + sample questions are
-- seeded only for JavaScript, React, Angular, Python and CSS3 in this
-- phase (02-06); admins can extend any technology via /admin/topics and
-- /admin/questions without a code change.

insert into public.technologies (slug, name, category, icon, description, is_active, sort_order) values
  ('javascript', 'JavaScript', 'language', 'code', 'Core language behind the modern web.', true, 10),
  ('typescript', 'TypeScript', 'language', 'code-2', 'Typed superset of JavaScript.', true, 20),
  ('python', 'Python', 'language', 'terminal', 'General-purpose, widely used in backend and data.', true, 30),
  ('java', 'Java', 'language', 'coffee', 'Enterprise-grade, statically typed OOP language.', true, 40),
  ('csharp', 'C#', 'language', 'hash', 'Microsoft''s statically typed .NET language.', true, 50),
  ('cplusplus', 'C++', 'language', 'cpu', 'High-performance systems programming language.', true, 60),
  ('go', 'Go', 'language', 'gopher', 'Simple, fast, concurrency-first systems language.', true, 70),
  ('react', 'React', 'frontend', 'atom', 'Component-based UI library.', true, 80),
  ('angular', 'Angular', 'frontend', 'triangle', 'Full-featured SPA framework by Google.', true, 90),
  ('vuejs', 'Vue.js', 'frontend', 'layers', 'Progressive, approachable frontend framework.', true, 100),
  ('nextjs', 'Next.js', 'frontend', 'triangle-right', 'React framework for full-stack apps.', true, 110),
  ('nodejs', 'Node.js', 'backend', 'server', 'JavaScript runtime for backend services.', true, 120),
  ('html5', 'HTML5', 'frontend', 'file-code', 'Semantic markup for the modern web.', true, 130),
  ('css3', 'CSS3', 'frontend', 'palette', 'Styling, layout and animation for the web.', true, 140),
  ('sql-databases', 'SQL & Databases', 'data', 'database', 'Relational modelling and query design.', true, 150),
  ('mongodb', 'MongoDB', 'data', 'leaf', 'Document-oriented NoSQL database.', true, 160),
  ('aws', 'AWS', 'cloud', 'cloud', 'Amazon Web Services cloud platform.', true, 170),
  ('docker-kubernetes', 'Docker & Kubernetes', 'devops', 'container', 'Containerization and orchestration.', true, 180),
  ('system-design', 'System Design', 'architecture', 'network', 'Designing scalable, reliable distributed systems.', true, 190),
  ('dsa', 'Data Structures & Algorithms', 'fundamentals', 'binary', 'Core CS fundamentals for technical interviews.', true, 200),
  ('behavioural-hr', 'Behavioural & HR', 'soft-skills', 'users', 'Communication, teamwork and leadership scenarios.', true, 210)
on conflict (slug) do nothing;
