-- InterviewForge seed — 05: Python topic tree + sample question bank

with tech as (select id from public.technologies where slug = 'python')
insert into public.topics (technology_id, slug, name, description, sort_order)
select tech.id, v.slug, v.name, v.description, v.sort_order
from tech, (values
  ('syntax-data-types', 'Syntax & Data Types', 'Core types, mutability, truthiness.', 10),
  ('functions-decorators', 'Functions & Decorators', 'Args/kwargs, closures, decorators.', 20),
  ('oop-python', 'OOP in Python', 'Classes, dunder methods, inheritance, mixins.', 30),
  ('collections-comprehensions', 'Collections & Comprehensions', 'Lists/dicts/sets, comprehensions, generators.', 40),
  ('exception-handling', 'Exception Handling', 'try/except/finally, custom exceptions.', 50),
  ('modules-packages', 'Modules & Packages', 'Imports, virtual environments, packaging.', 60),
  ('concurrency', 'Concurrency', 'GIL, threading, multiprocessing, asyncio.', 70),
  ('testing-debugging', 'Testing & Debugging', 'pytest, mocking, debugging techniques.', 80)
) as v(slug, name, description, sort_order)
on conflict (technology_id, slug) do nothing;

with tech as (select id from public.technologies where slug = 'python'),
topics_lookup as (select slug, id from public.topics where technology_id = (select id from tech))
insert into public.interview_questions
  (technology_id, topic_id, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, max_score, reference_answer, status, generated_by)
select (select id from tech), tl.id, q.experience_levels, q.difficulty, q.question_type, q.title, q.body,
       q.expected_concepts, q.rubric, 10, q.reference_answer, 'approved', 'admin'
from (values
  ('syntax-data-types',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'Mutable vs immutable types',
   'Give examples of mutable and immutable built-in types in Python, and explain a bug that can occur from misunderstanding this.',
   '["list vs tuple","mutable default argument","id() and identity","immutability"]'::jsonb,
   '{"technical":45,"completeness":35,"clarity":20}'::jsonb,
   'Immutable: int, str, tuple, frozenset. Mutable: list, dict, set. A classic bug: using a mutable default argument, e.g. `def f(items=[]):` — the same list object is reused across calls, so appends persist unexpectedly between calls.'),

  ('functions-decorators',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'How decorators work',
   'Explain what a decorator does in Python and write (in words or pseudocode) how you would implement a simple @timer decorator that logs a function''s execution time.',
   '["higher-order function","functools.wraps","closures","*args/**kwargs passthrough"]'::jsonb,
   '{"technical":50,"depth":30,"clarity":20}'::jsonb,
   'A decorator is a function that takes a function and returns a new function that wraps it with extra behavior. A @timer decorator would define an inner wrapper(*args, **kwargs) that records a start time, calls the original function, records the end time, logs the difference, and returns the result — typically using functools.wraps to preserve the original function''s name/docstring.'),

  ('collections-comprehensions',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'List comprehension vs generator expression',
   'What is the difference between a list comprehension and a generator expression in Python, and when would you choose one over the other?',
   '["eager vs lazy evaluation","memory usage","one-time iteration","syntax difference"]'::jsonb,
   '{"technical":45,"completeness":35,"clarity":20}'::jsonb,
   'A list comprehension `[x for x in ...]` builds the entire list in memory immediately. A generator expression `(x for x in ...)` produces values lazily, one at a time, without storing them all — better for large or infinite sequences where you only need to iterate once and want lower memory usage.'),

  ('oop-python',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Dunder methods and duck typing',
   'What are "dunder" (double-underscore) methods used for in Python? Give an example of implementing one to make a custom class work with a built-in operator or function.',
   '["__init__","__eq__","__repr__","operator overloading"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'Dunder methods let custom classes integrate with Python''s built-in syntax and protocols (operators, iteration, context managers, etc). E.g. implementing __eq__ and __hash__ lets instances be compared with == and used correctly in sets/dict keys; implementing __len__ lets len(obj) work.'),

  ('exception-handling',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'debugging'::question_type,
   'Fix the bare except',
   E'What is wrong with this code from a maintainability/debugging perspective, and how would you improve it?\n\ntry:\n    process(data)\nexcept:\n    pass',
   '["bare except swallows everything","hides bugs","catch specific exceptions","logging"]'::jsonb,
   '{"technical":45,"completeness":35,"clarity":20}'::jsonb,
   'A bare `except:` catches everything, including KeyboardInterrupt/SystemExit and programming errors, and silently discards them — making bugs nearly impossible to diagnose. Fix: catch specific expected exceptions (e.g. `except ValueError as e:`), log or handle them meaningfully, and let unexpected exceptions propagate.'),

  ('concurrency',
   array['mid','senior']::experience_level[], 'hard'::difficulty_level, 'conceptual'::question_type,
   'GIL and choosing concurrency model',
   'What is the Global Interpreter Lock (GIL), and how does it influence whether you''d choose threading, multiprocessing, or asyncio for a given workload?',
   '["GIL limits true parallel CPU-bound threads","multiprocessing bypasses GIL","asyncio for IO-bound concurrency","threading for IO-bound too"]'::jsonb,
   '{"technical":50,"depth":40,"clarity":10}'::jsonb,
   'The GIL allows only one thread to execute Python bytecode at a time, so CPU-bound work does not truly parallelize across threads. For CPU-bound work, use multiprocessing (separate processes, separate GILs). For IO-bound work (network/disk waits), threading or asyncio both work well since the GIL is released during IO waits; asyncio scales to many more concurrent tasks with lower overhead when the workload is naturally async.'),

  ('modules-packages',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'Why use virtual environments',
   'What problem do Python virtual environments solve, and what would go wrong without them on a machine running multiple projects?',
   '["dependency isolation","version conflicts","site-packages pollution","reproducibility"]'::jsonb,
   '{"technical":40,"completeness":40,"clarity":20}'::jsonb,
   'Virtual environments isolate a project''s dependencies (and their versions) from the system Python and from other projects. Without one, installing different projects'' dependencies globally can cause version conflicts (project A needs library X v1, project B needs v2) and makes builds hard to reproduce.'),

  ('testing-debugging',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'scenario_based'::question_type,
   'Testing code with an external API call',
   'You need to unit test a function that calls a third-party payment API. How would you test it without making real network calls, and what would you assert?',
   '["mocking/patching","dependency injection for testability","asserting call args","avoiding flaky network tests"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'Mock/patch the API client (e.g. with unittest.mock.patch or a fixture) so no real network call happens, and configure the mock to return representative success/error responses. Assert both the function''s return value/behavior for each case AND that the mock was called with the expected arguments — keeping the test fast and deterministic.'),

  ('collections-comprehensions',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'output_prediction'::question_type,
   'Predict the dict comprehension output',
   'What does the following code print, and why?\n\ndata = [("a", 1), ("b", 2), ("a", 3)]\nresult = {k: v for k, v in data}\nprint(result)',
   '["dict comprehension overwrite","last value wins","key uniqueness"]'::jsonb,
   '{"technical":40,"clarity":40,"completeness":20}'::jsonb,
   'Prints {''a'': 3, ''b'': 2}. Dict comprehensions overwrite earlier values when the same key repeats, so the later ("a", 3) pair overwrites the earlier ("a", 1).'),

  ('oop-python',
   array['senior','lead']::experience_level[], 'hard'::difficulty_level, 'scenario_based'::question_type,
   'Composition vs inheritance',
   'You are modelling several notification types (Email, SMS, Push) that share some logic but differ in delivery mechanics. Would you reach for inheritance or composition, and why?',
   '["favor composition","interface/protocol","avoid deep hierarchies","mixins as targeted exception"]'::jsonb,
   '{"technical":45,"depth":40,"clarity":15}'::jsonb,
   'Generally favor composition: define a common interface/protocol (e.g. a `send(message)` method) and inject a delivery strategy object per notification type, rather than building a deep inheritance hierarchy. This avoids rigid coupling and the "fragile base class" problem, and makes it easy to add new delivery types without touching existing ones. Inheritance can still be appropriate for small, stable "is-a" relationships or via targeted mixins for cross-cutting behavior.')
) as q(topic_slug, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, reference_answer)
join topics_lookup tl on tl.slug = q.topic_slug;
