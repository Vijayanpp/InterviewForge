-- InterviewForge seed — 03: React topic tree + sample question bank

with tech as (select id from public.technologies where slug = 'react')
insert into public.topics (technology_id, slug, name, description, sort_order)
select tech.id, v.slug, v.name, v.description, v.sort_order
from tech, (values
  ('components-props', 'Components & Props', 'Composition, prop drilling, controlled vs uncontrolled.', 10),
  ('state-lifecycle', 'State & Lifecycle', 'useState, re-renders, lifecycle equivalents.', 20),
  ('hooks', 'Hooks', 'useEffect, useMemo, useCallback, custom hooks.', 30),
  ('context-api', 'Context API', 'Sharing state without prop drilling, provider patterns.', 40),
  ('performance-optimization', 'Performance Optimization', 'Memoization, virtualization, avoiding re-renders.', 50),
  ('routing', 'Routing', 'Client-side routing, nested routes, data loading.', 60),
  ('testing', 'Testing', 'Component testing strategy, mocking, user-centric tests.', 70),
  ('state-management', 'State Management', 'Local vs global state, Redux/Zustand-style stores.', 80)
) as v(slug, name, description, sort_order)
on conflict (technology_id, slug) do nothing;

with tech as (select id from public.technologies where slug = 'react'),
topics_lookup as (select slug, id from public.topics where technology_id = (select id from tech))
insert into public.interview_questions
  (technology_id, topic_id, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, max_score, reference_answer, status, generated_by)
select (select id from tech), tl.id, q.experience_levels, q.difficulty, q.question_type, q.title, q.body,
       q.expected_concepts, q.rubric, 10, q.reference_answer, 'approved', 'admin'
from (values
  ('components-props',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'Controlled vs uncontrolled components',
   'What is the difference between a controlled and an uncontrolled form input in React? When would you choose one over the other?',
   '["controlled input","uncontrolled input","refs","single source of truth"]'::jsonb,
   '{"technical":50,"clarity":30,"completeness":20}'::jsonb,
   'A controlled input''s value is driven by React state (value + onChange), making React the single source of truth. An uncontrolled input manages its own state internally and is read via a ref. Uncontrolled inputs are simpler for basic forms or third-party DOM libraries; controlled inputs are preferred when you need validation, conditional UI, or to sync the value elsewhere.'),

  ('hooks',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'useEffect dependency array',
   'Explain what the dependency array in useEffect controls, and what bugs commonly occur when it is written incorrectly.',
   '["dependency array","stale closures","exhaustive-deps","cleanup function"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'The dependency array tells React when to re-run the effect: it re-runs whenever any listed value changes since the last render. An empty array runs the effect once on mount; omitting it runs on every render. Common bugs: missing dependencies causing the effect to use stale ("captured") values, and unnecessary re-renders from over-including dependencies that change every render (e.g. inline objects/functions).'),

  ('hooks',
   array['mid','senior']::experience_level[], 'hard'::difficulty_level, 'debugging'::question_type,
   'Fix the stale state bug',
   E'This counter is supposed to increment by 1 every second, but it only ever reaches 1. What is wrong, and how would you fix it?\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => setCount(count + 1), 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <div>{count}</div>;\n}',
   '["stale closure","functional setState updater","dependency array"]'::jsonb,
   '{"technical":50,"depth":30,"clarity":20}'::jsonb,
   'The effect runs once (empty deps), so the interval callback closes over the initial `count` (0) forever — each tick sets it to 0 + 1 = 1. Fix: use the functional updater `setCount(c => c + 1)`, which does not depend on the captured `count` variable.'),

  ('state-lifecycle',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'scenario_based'::question_type,
   'Lifting state up',
   'Two sibling components need to share and stay in sync on a piece of state. Describe how you would structure this, and name the React pattern involved.',
   '["lifting state up","single source of truth","prop drilling trade-off"]'::jsonb,
   '{"technical":45,"clarity":35,"completeness":20}'::jsonb,
   'Move the shared state up to their closest common ancestor and pass it (and updater functions) down as props to both children — this is "lifting state up". If the tree is deep and many components need it, consider Context or a state-management library instead of drilling props through many layers.'),

  ('context-api',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Context API pitfalls',
   'What problem does the Context API solve, and what is a common performance pitfall when using it, along with a way to mitigate it?',
   '["prop drilling","context re-render fan-out","memoized provider value","splitting contexts"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'Context avoids passing props through many intermediate components. Pitfall: every consumer re-renders whenever the context value reference changes, even if only part of it is used — this is worsened by passing a new object literal as the value on every render. Mitigate by memoizing the value with useMemo and/or splitting large contexts into smaller, more targeted ones.'),

  ('performance-optimization',
   array['mid','senior']::experience_level[], 'hard'::difficulty_level, 'conceptual'::question_type,
   'useMemo vs useCallback vs React.memo',
   'Explain the difference between useMemo, useCallback and React.memo, and describe a scenario where using them incorrectly could make performance worse.',
   '["memoized value","memoized function reference","referential equality","memoization overhead"]'::jsonb,
   '{"technical":50,"depth":35,"clarity":15}'::jsonb,
   'useMemo memoizes a computed value; useCallback memoizes a function reference (equivalent to useMemo(() => fn, deps)); React.memo memoizes a whole component''s render output based on shallow prop equality. Overusing them on cheap computations or components adds comparison/memoization overhead that can outweigh the savings, and can actually hurt performance.'),

  ('routing',
   array['junior','mid']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'Client-side routing basics',
   'How does client-side routing avoid full page reloads, and what trade-off does this introduce that you need to handle explicitly?',
   '["History API","SPA navigation","code splitting per route","SEO/initial load trade-offs"]'::jsonb,
   '{"technical":40,"completeness":40,"clarity":20}'::jsonb,
   'Client-side routers intercept navigation and use the browser History API (pushState/replaceState) to update the URL and swap rendered components without a full page reload. Trade-offs to handle explicitly: code-splitting per route so the initial bundle stays small, and ensuring deep-linked URLs still render correctly on first load.'),

  ('testing',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'scenario_based'::question_type,
   'Testing a form component',
   'How would you test a form component that validates an email field and disables the submit button until the form is valid? What would you assert, and what would you deliberately avoid testing?',
   '["user-centric testing","Testing Library queries","avoid testing implementation details","accessible queries"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'Render the component, simulate typing an invalid then a valid email via user-event, and assert the submit button''s disabled state and any validation message via accessible queries (getByRole/getByLabelText) — testing behavior a user would observe. Avoid asserting on internal state or implementation details (e.g. hook internals), since that couples tests to implementation and makes refactors brittle.'),

  ('state-management',
   array['senior','lead']::experience_level[], 'hard'::difficulty_level, 'scenario_based'::question_type,
   'Choosing a state management approach',
   'A dashboard app has: (1) UI-only state like "is this dropdown open", (2) server data like a list of orders, and (3) cross-page filters. How would you decide what lives in useState, a global store, or a server-state library, and why?',
   '["local vs global state","server cache vs client state","cross-cutting state","avoiding over-centralization"]'::jsonb,
   '{"technical":45,"depth":40,"clarity":15}'::jsonb,
   'UI-only, component-local state (dropdown open) should stay in useState — promoting it globally adds unnecessary coupling. Server data (orders) is best owned by a server-state/cache library (e.g. React Query) which handles caching, revalidation and loading/error states rather than a generic global store. Cross-page filters that must persist/sync across routes are a good fit for a lightweight global store (e.g. Zustand) or URL state.'),

  ('components-props',
   array['fresher','junior']::experience_level[], 'medium'::difficulty_level, 'code_review'::question_type,
   'Review this list rendering code',
   E'Review this component. What issue exists and why does it matter?\n\nfunction ItemList({ items }) {\n  return (\n    <ul>\n      {items.map(item => <li>{item.name}</li>)}\n    </ul>\n  );\n}',
   '["missing key prop","reconciliation","list identity"]'::jsonb,
   '{"technical":45,"completeness":35,"clarity":20}'::jsonb,
   'Each list item is missing a stable `key` prop (e.g. key={item.id}). Without it, React falls back to index-based reconciliation, which can cause incorrect UI/state association when the list is reordered, filtered, or items are inserted/removed.')
) as q(topic_slug, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, reference_answer)
join topics_lookup tl on tl.slug = q.topic_slug;
