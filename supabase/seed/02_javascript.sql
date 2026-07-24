-- InterviewForge seed — 02: JavaScript topic tree + sample question bank

with tech as (select id from public.technologies where slug = 'javascript')
insert into public.topics (technology_id, slug, name, description, sort_order)
select tech.id, v.slug, v.name, v.description, v.sort_order
from tech, (values
  ('fundamentals-syntax', 'Fundamentals & Syntax', 'Variables, data types, operators, control flow.', 10),
  ('functions-scope', 'Functions & Scope', 'Function declarations, hoisting, scope chains.', 20),
  ('closures', 'Closures & Higher-Order Functions', 'Lexical scope, closures, currying, composition.', 30),
  ('asynchronous-js', 'Asynchronous JavaScript', 'Callbacks, Promises, async/await, the event loop.', 40),
  ('prototypes-oop', 'Prototypes & OOP', 'Prototype chain, classes, inheritance.', 50),
  ('es6-plus', 'ES6+ Features', 'Destructuring, spread/rest, modules, optional chaining.', 60),
  ('dom-events', 'DOM & Events', 'DOM manipulation, event delegation, browser APIs.', 70),
  ('performance-memory', 'Performance & Memory', 'Memory leaks, GC, profiling, optimization.', 80)
) as v(slug, name, description, sort_order)
on conflict (technology_id, slug) do nothing;

with tech as (select id from public.technologies where slug = 'javascript'),
topics_lookup as (select slug, id from public.topics where technology_id = (select id from tech))
insert into public.interview_questions
  (technology_id, topic_id, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, max_score, reference_answer, status, generated_by)
select (select id from tech), tl.id, q.experience_levels, q.difficulty, q.question_type, q.title, q.body,
       q.expected_concepts, q.rubric, 10, q.reference_answer, 'approved', 'admin'
from (values
  ('fundamentals-syntax',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'var vs let vs const',
   'Explain the differences between var, let, and const in terms of scope, hoisting, and re-assignment.',
   '["block scope","function scope","hoisting","temporal dead zone"]'::jsonb,
   '{"technical":50,"clarity":30,"completeness":20}'::jsonb,
   'var is function-scoped and hoisted with an initial value of undefined. let/const are block-scoped and are hoisted into a "temporal dead zone" until their declaration executes. const additionally forbids re-assignment (though objects it references remain mutable).'),

  ('closures',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Explain closures',
   'What is a closure in JavaScript? Give a practical example of a problem you would use one to solve.',
   '["lexical scope","function factory","private state","garbage collection"]'::jsonb,
   '{"technical":40,"depth":30,"clarity":30}'::jsonb,
   'A closure is a function that retains access to variables from its enclosing lexical scope even after that outer function has returned. Common uses: private state (module pattern), memoization, event-handler factories, and currying.'),

  ('closures',
   array['mid','senior']::experience_level[], 'hard'::difficulty_level, 'debugging'::question_type,
   'Fix the loop closure bug',
   E'The following code is intended to log 0, 1, and 2 (one per second), but instead logs 3, 3, 3. Explain exactly why, and show two different ways to fix it.\n\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 1000);\n}',
   '["var function scope","let block scope","IIFE capture","closure per iteration"]'::jsonb,
   '{"technical":50,"depth":30,"clarity":20}'::jsonb,
   'var is function-scoped, so all three callbacks close over the SAME variable i, which is 3 by the time the timers fire. Fixes: (1) replace var with let, which creates a fresh binding per iteration; (2) wrap the body in an IIFE that captures the current value of i as a parameter.'),

  ('asynchronous-js',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Promises vs async/await',
   'How does async/await relate to Promises under the hood? How should errors be handled inside an async function, and why?',
   '["syntactic sugar over promises","try/catch","unhandled rejection","sequential vs parallel awaits"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'async/await is syntactic sugar over Promises: an async function always returns a Promise, and await pauses execution until the awaited Promise settles, unwrapping its value or throwing its rejection. Errors should be handled with try/catch around awaited calls (or .catch on the returned promise) to avoid unhandled promise rejections.'),

  ('asynchronous-js',
   array['mid','senior']::experience_level[], 'hard'::difficulty_level, 'output_prediction'::question_type,
   'Event loop ordering',
   E'What is the exact console output order of the following code, and why?\n\nconsole.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
   '["macrotask queue","microtask queue","call stack","event loop"]'::jsonb,
   '{"technical":50,"depth":40,"clarity":10}'::jsonb,
   'Output: A, D, C, B. Synchronous code (A, D) runs first. Microtasks (the Promise.then callback, C) run before the next macrotask. setTimeout schedules a macrotask (B), which runs after all pending microtasks.'),

  ('prototypes-oop',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Prototypal inheritance',
   'Explain the prototype chain in JavaScript, and how the `class` keyword relates to it under the hood.',
   '["__proto__","Object.create","class is sugar","prototype chain lookup"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'Every object has an internal [[Prototype]] link; property lookups walk up this chain until found or the chain ends at null. `class` syntax is largely sugar over this same prototype-based model: methods defined in a class body are placed on Constructor.prototype, and `extends` wires up the prototype chain between parent and child.'),

  ('es6-plus',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'Destructuring and spread',
   'Give two practical examples of object/array destructuring and one example of the spread operator, explaining what problem each solves.',
   '["destructuring","spread","rest parameters","immutability patterns"]'::jsonb,
   '{"technical":40,"completeness":40,"clarity":20}'::jsonb,
   'Destructuring extracts values into named variables, e.g. `const { id, name } = user;` or `const [first, ...rest] = list;`. Spread copies/merges iterables or objects, e.g. `const updated = { ...state, loading: true };`, which is commonly used to produce new state immutably.'),

  ('functions-scope',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'code_review'::question_type,
   'Review this function for scope bugs',
   E'Review the following function. What bug(s) exist, and how would you fix them?\n\nfunction calculateTotal(items) {\n  for (var i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}',
   '["undeclared variable becomes global","missing initialization","strict mode","let vs var"]'::jsonb,
   '{"technical":50,"completeness":30,"clarity":20}'::jsonb,
   'total is never declared, so it becomes an implicit global (and would throw a ReferenceError in strict mode) and is never reset between calls. Fix: declare `let total = 0;` inside the function before the loop.'),

  ('dom-events',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'scenario_based'::question_type,
   'Efficient event handling for large lists',
   'You render a list of 10,000 items, each with a delete button. How would you implement click handling efficiently, and why is that better than attaching a listener per item?',
   '["event delegation","event bubbling","memory footprint","single listener on parent"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'Use event delegation: attach a single click listener on the parent container and inspect event.target (or use closest()) to identify which item''s delete button was clicked. This avoids 10,000 listener allocations, reduces memory usage, and automatically works for items added later.'),

  ('performance-memory',
   array['senior','lead']::experience_level[], 'hard'::difficulty_level, 'conceptual'::question_type,
   'Common causes of memory leaks',
   'Describe three common causes of memory leaks in long-running JavaScript applications (e.g. single-page apps), and how you would detect and prevent each.',
   '["detached DOM nodes","forgotten timers/listeners","closures holding references","heap snapshot profiling"]'::jsonb,
   '{"technical":50,"depth":40,"clarity":10}'::jsonb,
   'Common causes: (1) event listeners/timers never removed on component teardown, keeping references alive; (2) detached DOM nodes still referenced from JS (e.g. cached in a variable after removal); (3) closures unintentionally capturing large objects. Detect via heap snapshots/allocation timelines in DevTools; prevent by always cleaning up subscriptions/timers and scoping closures tightly.')
) as q(topic_slug, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, reference_answer)
join topics_lookup tl on tl.slug = q.topic_slug;
