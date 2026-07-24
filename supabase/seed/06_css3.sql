-- InterviewForge seed — 06: CSS3 topic tree + sample question bank

with tech as (select id from public.technologies where slug = 'css3')
insert into public.topics (technology_id, slug, name, description, sort_order)
select tech.id, v.slug, v.name, v.description, v.sort_order
from tech, (values
  ('selectors-specificity', 'Selectors & Specificity', 'Combinators, pseudo-classes, the cascade.', 10),
  ('box-model-layout', 'Box Model & Layout', 'Content/padding/border/margin, box-sizing.', 20),
  ('flexbox', 'Flexbox', 'One-dimensional layout, alignment, sizing.', 30),
  ('grid', 'CSS Grid', 'Two-dimensional layout, tracks, areas.', 40),
  ('responsive-design', 'Responsive Design & Media Queries', 'Breakpoints, mobile-first, fluid units.', 50),
  ('animations-transitions', 'Animations & Transitions', 'transition, @keyframes, performance.', 60),
  ('positioning-stacking', 'Positioning & Stacking Context', 'static/relative/absolute/fixed/sticky, z-index.', 70),
  ('architecture-bem', 'Architecture & Naming (BEM)', 'Scalable CSS naming and organization.', 80)
) as v(slug, name, description, sort_order)
on conflict (technology_id, slug) do nothing;

with tech as (select id from public.technologies where slug = 'css3'),
topics_lookup as (select slug, id from public.topics where technology_id = (select id from tech))
insert into public.interview_questions
  (technology_id, topic_id, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, max_score, reference_answer, status, generated_by)
select (select id from tech), tl.id, q.experience_levels, q.difficulty, q.question_type, q.title, q.body,
       q.expected_concepts, q.rubric, 10, q.reference_answer, 'approved', 'admin'
from (values
  ('selectors-specificity',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'How CSS specificity is calculated',
   'How does the browser decide which CSS rule wins when two rules target the same element? Rank ID selectors, class selectors, and element selectors by specificity.',
   '["specificity calculation","cascade order","!important","inline styles"]'::jsonb,
   '{"technical":45,"completeness":35,"clarity":20}'::jsonb,
   'Specificity is calculated per selector as a tuple of (inline styles, ID selectors, class/attribute/pseudo-class selectors, element/pseudo-element selectors). The rule with the highest specificity wins regardless of source order; if specificity ties, the later rule in source order wins. ID selectors beat class selectors, which beat element selectors.'),

  ('box-model-layout',
   array['fresher','junior']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'box-sizing: border-box',
   'What does `box-sizing: border-box` change about how width/height are calculated, and why do many teams apply it globally?',
   '["content-box default","border-box includes padding/border","predictable sizing"]'::jsonb,
   '{"technical":40,"completeness":40,"clarity":20}'::jsonb,
   'By default (content-box), width/height apply only to the content area, so padding and border add to the element''s total rendered size. border-box makes width/height include padding and border, so the box stays the specified size — making layouts far more predictable, which is why many teams set `* { box-sizing: border-box; }` globally.'),

  ('flexbox',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'scenario_based'::question_type,
   'Equal-height columns with flexbox',
   'You need three sidebar cards in a row, all the same height regardless of content length, with even spacing between them. How would you achieve this with Flexbox?',
   '["display:flex on container","align-items:stretch default","gap property","flex:1 for equal width"]'::jsonb,
   '{"technical":45,"completeness":35,"clarity":20}'::jsonb,
   'Set `display: flex` on the container (row direction by default); flex items stretch to match the tallest item''s height by default (align-items: stretch), so equal height comes for free. Use `gap` for even spacing between cards, and `flex: 1` on each card if you also want equal widths.'),

  ('grid',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Grid vs Flexbox',
   'When would you choose CSS Grid over Flexbox for a layout, and vice versa?',
   '["two-dimensional vs one-dimensional","grid-template-areas","flex for content-driven sizing"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'Grid excels at two-dimensional layouts where you need explicit control over both rows and columns simultaneously (e.g. a page shell with header/sidebar/main/footer via grid-template-areas). Flexbox is better for one-dimensional layouts (a single row or column) and content-driven sizing, like a nav bar or a row of cards that wrap.'),

  ('grid',
   array['senior','lead']::experience_level[], 'hard'::difficulty_level, 'scenario_based'::question_type,
   'Responsive card grid without media queries',
   'Design a card grid that automatically fits as many equally-sized cards per row as space allows (min 220px wide each), reflowing at any viewport width, without writing a single media query. What CSS Grid feature enables this?',
   '["repeat(auto-fit / auto-fill)","minmax()","implicit responsiveness"]'::jsonb,
   '{"technical":50,"depth":40,"clarity":10}'::jsonb,
   'Use `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));` on the grid container. auto-fit computes how many 220px+ columns fit in the available width and stretches them to fill remaining space (1fr), automatically reflowing at any viewport width with no media queries.'),

  ('responsive-design',
   array['junior','mid']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Mobile-first media queries',
   'What does "mobile-first" mean when writing media queries, and why is it generally recommended over a desktop-first approach?',
   '["min-width queries","base styles for smallest viewport","progressive enhancement","fewer overrides"]'::jsonb,
   '{"technical":40,"completeness":40,"clarity":20}'::jsonb,
   'Mobile-first means writing base (unwrapped) styles for the smallest viewport, then progressively adding complexity for larger screens using `min-width` media queries. It''s recommended because most sites have more mobile traffic, it aligns naturally with progressive enhancement, and it typically results in fewer, simpler overrides than starting from a wide desktop layout and cramming it down.'),

  ('animations-transitions',
   array['mid','senior']::experience_level[], 'medium'::difficulty_level, 'conceptual'::question_type,
   'Performant CSS animations',
   'Why are animations of `transform` and `opacity` generally smoother than animating properties like `width`, `top`, or `margin`?',
   '["compositor-only properties","avoids layout/reflow","GPU acceleration","paint vs composite"]'::jsonb,
   '{"technical":45,"depth":35,"clarity":20}'::jsonb,
   'transform and opacity can typically be handled entirely on the GPU compositor thread without triggering layout (reflow) or paint, so the browser can animate them smoothly even under load. Animating width/top/margin triggers layout recalculation (and often paint) on every frame, which is far more expensive and prone to jank.'),

  ('positioning-stacking',
   array['mid','senior']::experience_level[], 'hard'::difficulty_level, 'debugging'::question_type,
   'z-index not working',
   'A modal with `z-index: 9999` still renders behind another element with `z-index: 10`. Both have `position: relative`. What are two possible causes, and how would you diagnose them?',
   '["stacking context isolation","ancestor with lower z-index traps children","transform/opacity creates new context","inspect stacking contexts in devtools"]'::jsonb,
   '{"technical":50,"depth":35,"clarity":15}'::jsonb,
   'z-index only compares elements within the same stacking context. If the modal''s ancestor itself creates a new stacking context (e.g. it has its own z-index + position, or a transform/opacity/filter) with a lower z-index than the other element''s context, the modal is trapped behind regardless of its own z-index: 9999. Diagnose using DevTools'' layout/3D view or by walking up the DOM checking which ancestors create new stacking contexts; fix by portaling the modal to a higher-level container or adjusting the ancestor''s stacking context.'),

  ('architecture-bem',
   array['junior','mid']::experience_level[], 'easy'::difficulty_level, 'conceptual'::question_type,
   'BEM naming convention',
   'What do the Block, Element, and Modifier parts of BEM naming represent, and what problem does this convention solve at scale?',
   '["block-element-modifier","naming collisions","predictable specificity","maintainability"]'::jsonb,
   '{"technical":40,"completeness":40,"clarity":20}'::jsonb,
   'Block is a standalone component (.card), Element is a part of that block (.card__title), and Modifier is a variant/state (.card--highlighted). BEM keeps specificity flat and predictable and prevents naming collisions/unintended cascading in large codebases, since class names encode their relationship instead of relying on nested selectors.'),

  ('box-model-layout',
   array['fresher','junior']::experience_level[], 'medium'::difficulty_level, 'output_prediction'::question_type,
   'Margin collapsing',
   'Two sibling <div> elements each have `margin: 20px 0;`. What is the actual vertical gap rendered between them, and why?',
   '["adjacent margin collapsing","larger of the two margins wins","block-level vertical margins"]'::jsonb,
   '{"technical":45,"clarity":35,"completeness":20}'::jsonb,
   'The gap is 20px, not 40px. Adjacent vertical margins between block-level siblings "collapse" into a single margin equal to the larger of the two (here they''re equal, so 20px), rather than adding together.')
) as q(topic_slug, experience_levels, difficulty, question_type, title, body, expected_concepts, rubric, reference_answer)
join topics_lookup tl on tl.slug = q.topic_slug;
