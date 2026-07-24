-- InterviewForge seed — 04: Angular topic tree + sample question bank

with tech as (select id from public.technologies where slug = 'angular')
insert into public.topics (technology_id, slug, name, description, sort_order)
select tech.id, v.slug, v.name, v.description, v.sort_order
from tech, (values
  ('components-templates', 'Components & Templates', 'Decorators, template syntax, structural directives.', 10),
  ('data-binding', 'Data Binding', 'Interpolation, property/event binding, two-way binding.', 20),
  ('services-di', 'Services & Dependency Injection', 'Injectable services, providers, hierarchical injectors.', 30),
  ('rxjs-observables', 'RxJS & Observables', 'Observables, operators, subscription management.', 40),
  ('routing', 'Routing', 'Route guards, lazy-loaded routes, resolvers.', 50),
  ('forms', 'Forms', 'Template-driven vs reactive forms, validators.', 60),
  ('change-detection', 'Change Detection', 'Zone.js, OnPush, change detection strategies.', 70),
  ('modules-lazy-loading', 'Modules & Lazy Loading', 'NgModules, standalone components, code splitting.', 80)
) as v(slug, name, description, sort_order)
on conflict (technology_id, slug) do nothing;

with tech as (select id from public.technologies where slug = 'angular'),
topics_lookup as (select slug, id from public.topics where technology_id = (select id from tech))
insert into public.interview_questions
  (technology_id, topic_id, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, max_score, reference_answer, status, generated_by)
select (select id from tech), tl.id, q.experience_levels, q.difficulty, q.question_type, q.title, q.body,
       q.expected_concepts, q.rubric, 10, q.reference_answer, 'approved', 'admin'
from (values
  ('data-binding',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'Types of data binding',
   'Name the main types of data binding in Angular and give a short example of each.',
   '["interpolation","property binding","event binding","two-way binding"]'::jsonb,
   '{"technical":45,"completeness":40,"clarity":15}'::jsonb,
   'Interpolation ({{ value }}) renders a value into text; property binding ([prop]="value") sets a DOM/element property; event binding ((event)="handler()") listens for DOM events; two-way binding ([(ngModel)]="value") combines property and event binding to keep a form control and a model in sync.'),

  ('services-di',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Dependency injection & providedIn',
   'Explain how Angular''s dependency injection works, and what `providedIn: "root"` does differently from providing a service in a component''s `providers` array.',
   '["injector hierarchy","singleton service","providedIn root","component-scoped instance"]'::jsonb,
   '{"technical":50,"depth":35,"clarity":15}'::jsonb,
   'Angular resolves dependencies via a hierarchical injector tree; when a class asks for a dependency, Angular walks up injectors until it finds a provider. `providedIn: "root"` registers a single, app-wide singleton instance in the root injector. Providing the same service in a component''s `providers` array instead creates a new, component-scoped instance for that component and its children.'),

  ('rxjs-observables',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Observable subscription leaks',
   'Why is it important to unsubscribe from Observables in Angular components, and what are two common ways to manage this?',
   '["memory leak","async pipe","takeUntil pattern","Subscription.unsubscribe"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'If a component subscribes to a long-lived or repeating Observable (e.g. an interval or a service Subject) and never unsubscribes, the subscription outlives the component, leaking memory and potentially firing logic against a destroyed component. Common approaches: use the `async` pipe in templates (it auto-unsubscribes), or manage subscriptions manually with a `takeUntil(this.destroy$)` pattern tied to ngOnDestroy.'),

  ('rxjs-observables',
   array['senior','lead']::experience_level[], 'hard'::difficulty_level, 'output_prediction'::question_type,
   'switchMap vs mergeMap in a search box',
   'A search input triggers an HTTP call on every keystroke via an Observable pipeline. If you use mergeMap instead of switchMap, what incorrect behavior could a user observe, and why does switchMap fix it?',
   '["switchMap cancels previous inner observable","mergeMap runs all concurrently","race condition","stale response"]'::jsonb,
   '{"technical":50,"depth":40,"clarity":10}'::jsonb,
   'mergeMap subscribes to every inner HTTP call and lets them all run concurrently, so if an earlier request resolves after a later one, its (stale) response can overwrite the newer result on screen. switchMap cancels/unsubscribes from the previous inner Observable whenever a new value arrives, so only the latest search''s response is ever applied.'),

  ('forms',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Template-driven vs reactive forms',
   'Compare template-driven and reactive forms in Angular. When would you prefer reactive forms?',
   '["FormGroup/FormControl","ngModel","imperative vs declarative","testability"]'::jsonb,
   '{"technical":45,"completeness":35,"clarity":20}'::jsonb,
   'Template-driven forms are declared mostly in the template using directives like ngModel, suiting simple forms. Reactive forms build the form model explicitly in the component class with FormGroup/FormControl, giving more control, easier unit testing, and better support for dynamic/complex validation — preferred for non-trivial forms.'),

  ('change-detection',
   array['mid','senior']::experience_level[], 'hard'::difficulty_level, 'conceptual'::question_type,
   'ChangeDetectionStrategy.OnPush',
   'What does setting a component''s change detection strategy to OnPush change, and what must you be careful about when mutating data used by such a component?',
   '["default vs onpush","reference equality check","immutable updates","manual markForCheck"]'::jsonb,
   '{"technical":50,"depth":35,"clarity":15}'::jsonb,
   'By default Angular checks every component on every change-detection cycle. OnPush tells Angular to skip checking a component unless one of its @Input references changes (by identity), an event originates from within it, or change detection is triggered manually. This means mutating an object/array in place (same reference) will NOT trigger a re-check — you must create new references (immutable updates) or call ChangeDetectorRef.markForCheck() explicitly.'),

  ('routing',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'scenario_based'::question_type,
   'Protecting a route',
   'You need to prevent unauthenticated users from accessing `/admin` routes. What Angular router feature would you use, and roughly how would it work?',
   '["route guards","CanActivate","redirect on failure","auth service check"]'::jsonb,
   '{"technical":45,"clarity":35,"completeness":20}'::jsonb,
   'Use a route guard (CanActivate, or the functional canActivate guard) registered on the `/admin` route. The guard checks the current auth state (e.g. via an injected AuthService) and returns true to allow navigation, or returns/triggers a UrlTree redirect (e.g. to /login) to block it.'),

  ('modules-lazy-loading',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Lazy loading feature modules',
   'What problem does lazy loading feature modules/routes solve in a large Angular app, and what is the trade-off?',
   '["initial bundle size","code splitting","on-demand loading","navigation delay trade-off"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'Lazy loading splits the app into separate chunks loaded on demand (e.g. when a route is visited) instead of bundling everything into the initial download, significantly reducing initial load time for large apps. The trade-off is a small delay the first time a user navigates to a lazily-loaded route, since its chunk must be fetched.'),

  ('components-templates',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'debugging'::question_type,
   'Fix the structural directive bug',
   E'This template throws an error at compile time. What is wrong and how do you fix it?\n\n<div *ngIf="user">\n  <span>{{ user.name }}</span>\n</div *ngIf>',
   '["structural directive syntax","single directive per element","closing tag mismatch"]'::jsonb,
   '{"technical":40,"completeness":40,"clarity":20}'::jsonb,
   'A structural directive like *ngIf only belongs on the opening tag and Angular desugars it into an <ng-template>; it cannot also appear on (or be duplicated onto) the closing tag. Fix: remove `*ngIf` from the closing `</div>` — closing tags never carry directives.'),

  ('services-di',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'scenario_based'::question_type,
   'Sharing state between unrelated components',
   'Two unrelated components (not parent/child) need to share and react to changes in a piece of state, without using a heavyweight state library. How would you approach this in Angular?',
   '["shared injectable service","BehaviorSubject","observable state pattern","root-provided singleton"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'Create a shared, root-provided (singleton) service that exposes state via a BehaviorSubject (or signal) and methods to update it. Both components inject the same service instance and subscribe to (or read) the observable/signal, staying in sync without a global state library.')
) as q(topic_slug, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, reference_answer)
join topics_lookup tl on tl.slug = q.topic_slug;
