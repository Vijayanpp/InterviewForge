# `app/` — pages and BFF

Next.js App Router. Layouts wrap a route group. `app/api/**/route.ts` is the Backend for Frontend.

## Root

| File | Purpose |
| --- | --- |
| [`app/layout.tsx`](../../app/layout.tsx) | Root HTML, fonts, skip link, JSON-LD, web vitals |
| [`app/robots.ts`](../../app/robots.ts) | Crawl rules + sitemap pointer |
| [`app/sitemap.ts`](../../app/sitemap.ts) | Public indexable URLs |
| [`app/manifest.ts`](../../app/manifest.ts) | PWA web app manifest |
| [`app/opengraph-image.tsx`](../../app/opengraph-image.tsx) | Default OG/Twitter share image |
| [`app/icon.tsx`](../../app/icon.tsx) / [`app/apple-icon.tsx`](../../app/apple-icon.tsx) | Favicon + Apple touch icon |
| [`app/llms.txt/route.ts`](../../app/llms.txt/route.ts) | AI-crawler summary |
| [`app/not-found.tsx`](../../app/not-found.tsx) | 404 |
| [`app/error.tsx`](../../app/error.tsx) | Route error boundary |
| [`app/auth/callback/route.ts`](../../app/auth/callback/route.ts) | OAuth code exchange |
| [`app/auth/confirm/route.ts`](../../app/auth/confirm/route.ts) | Email confirm |

## Marketing, auth, onboarding

| File | Purpose |
| --- | --- |
| [`(marketing)/layout.tsx`](../../app/(marketing)/layout.tsx) | Public chrome |
| [`(marketing)/page.tsx`](../../app/(marketing)/page.tsx) | Landing `/` |
| [`(marketing)/about/page.tsx`](../../app/(marketing)/about/page.tsx) | About |
| [`(marketing)/contact/page.tsx`](../../app/(marketing)/contact/page.tsx) | Contact |
| [`(marketing)/privacy/page.tsx`](../../app/(marketing)/privacy/page.tsx) | Privacy |
| [`(marketing)/terms/page.tsx`](../../app/(marketing)/terms/page.tsx) | Terms |
| [`(auth)/layout.tsx`](../../app/(auth)/layout.tsx) | Auth pages chrome |
| [`(auth)/login/page.tsx`](../../app/(auth)/login/page.tsx) | Sign in |
| [`(auth)/register/page.tsx`](../../app/(auth)/register/page.tsx) | Sign up |
| [`(auth)/forgot-password/page.tsx`](../../app/(auth)/forgot-password/page.tsx) | Reset request |
| [`(auth)/reset-password/page.tsx`](../../app/(auth)/reset-password/page.tsx) | New password |
| [`(onboarding)/layout.tsx`](../../app/(onboarding)/layout.tsx) | First-run wrapper |
| [`(onboarding)/onboarding/page.tsx`](../../app/(onboarding)/onboarding/page.tsx) | Profile / skills wizard |

## Candidate

| File | Purpose |
| --- | --- |
| [`(candidate)/layout.tsx`](../../app/(candidate)/layout.tsx) | Sidebar + topbar |
| [`(candidate)/dashboard/page.tsx`](../../app/(candidate)/dashboard/page.tsx) | Readiness, trends |
| [`(candidate)/settings/page.tsx`](../../app/(candidate)/settings/page.tsx) | Name + avatar |
| [`(candidate)/interviews/new/page.tsx`](../../app/(candidate)/interviews/new/page.tsx) | Interview wizard |
| [`(candidate)/interviews/history/page.tsx`](../../app/(candidate)/interviews/history/page.tsx) | Past sessions |
| [`(candidate)/interviews/[sessionId]/report/page.tsx`](../../app/(candidate)/interviews/[sessionId]/report/page.tsx) | Report |
| [`(candidate)/practice/page.tsx`](../../app/(candidate)/practice/page.tsx) | Challenge list |
| [`(candidate)/practice/[challengeId]/page.tsx`](../../app/(candidate)/practice/[challengeId]/page.tsx) | Practice editor |
| [`(candidate)/become-recruiter/page.tsx`](../../app/(candidate)/become-recruiter/page.tsx) | Create org → interviewer role |

## Live rooms (outside the candidate chrome)

| File | Purpose |
| --- | --- |
| [`interviews/[sessionId]/room/page.tsx`](../../app/interviews/[sessionId]/room/page.tsx) | Text interview |
| [`interviews/[sessionId]/room/layout.tsx`](../../app/interviews/[sessionId]/room/layout.tsx) | Room layout |
| [`interviews/[sessionId]/voice/page.tsx`](../../app/interviews/[sessionId]/voice/page.tsx) | Voice interview |
| [`interviews/[sessionId]/voice/layout.tsx`](../../app/interviews/[sessionId]/voice/layout.tsx) | Voice layout |
| [`interviews/[sessionId]/coding/page.tsx`](../../app/interviews/[sessionId]/coding/page.tsx) | Coding round |
| [`interviews/[sessionId]/coding/layout.tsx`](../../app/interviews/[sessionId]/coding/layout.tsx) | Coding layout |

`/room` redirects coding sessions to `/coding` and voice delivery to `/voice`.

## Admin

| File | Purpose |
| --- | --- |
| [`(admin)/layout.tsx`](../../app/(admin)/layout.tsx) | Admin chrome |
| [`(admin)/admin/dashboard/page.tsx`](../../app/(admin)/admin/dashboard/page.tsx) | Stats |
| [`(admin)/admin/technologies/page.tsx`](../../app/(admin)/admin/technologies/page.tsx) | Tech catalog |
| [`(admin)/admin/topics/page.tsx`](../../app/(admin)/admin/topics/page.tsx) | Topic trees |
| [`(admin)/admin/questions/page.tsx`](../../app/(admin)/admin/questions/page.tsx) | Question bank |
| [`(admin)/admin/challenges/page.tsx`](../../app/(admin)/admin/challenges/page.tsx) | Challenge list |
| [`(admin)/admin/challenges/new/page.tsx`](../../app/(admin)/admin/challenges/new/page.tsx) | Create challenge |
| [`(admin)/admin/challenges/[id]/page.tsx`](../../app/(admin)/admin/challenges/[id]/page.tsx) | Edit challenge + tests |

## Recruiter and invites

| File | Purpose |
| --- | --- |
| [`(recruiter)/layout.tsx`](../../app/(recruiter)/layout.tsx) | Recruiter chrome |
| [`(recruiter)/recruiter/page.tsx`](../../app/(recruiter)/recruiter/page.tsx) | Recruiter home |
| [`(recruiter)/recruiter/assessments/page.tsx`](../../app/(recruiter)/recruiter/assessments/page.tsx) | Assessment list |
| [`(recruiter)/recruiter/assessments/new/page.tsx`](../../app/(recruiter)/recruiter/assessments/new/page.tsx) | Create assessment |
| [`(recruiter)/recruiter/assessments/[id]/page.tsx`](../../app/(recruiter)/recruiter/assessments/[id]/page.tsx) | Integrity + invites |
| [`invite/[token]/page.tsx`](../../app/invite/[token]/page.tsx) | Candidate redeem page |

## BFF (`app/api`)

These handlers authenticate, validate, then call `lib/services`. They do not contain interview policy.

| File | Purpose |
| --- | --- |
| [`api/interviews/route.ts`](../../app/api/interviews/route.ts) | Create draft session |
| [`api/interviews/[id]/start/route.ts`](../../app/api/interviews/[id]/start/route.ts) | Prep + first question |
| [`api/interviews/[id]/answer/route.ts`](../../app/api/interviews/[id]/answer/route.ts) | Grade + next action |
| [`api/interviews/[id]/end/route.ts`](../../app/api/interviews/[id]/end/route.ts) | Report |
| [`api/interviews/[id]/voice/transcribe/route.ts`](../../app/api/interviews/[id]/voice/transcribe/route.ts) | STT |
| [`api/interviews/[id]/voice/tts/route.ts`](../../app/api/interviews/[id]/voice/tts/route.ts) | TTS |
| [`api/resumes/route.ts`](../../app/api/resumes/route.ts) | Upload + ingest chunks |
| [`api/job-descriptions/route.ts`](../../app/api/job-descriptions/route.ts) | Paste JD + ingest |
| [`api/topics/route.ts`](../../app/api/topics/route.ts) | Wizard topic list |
| [`api/profile/avatar/route.ts`](../../app/api/profile/avatar/route.ts) | Avatar upload/delete |
| [`api/coding/practice/generate/route.ts`](../../app/api/coding/practice/generate/route.ts) | AI practice challenge |
| [`api/coding/challenges/[id]/run/route.ts`](../../app/api/coding/challenges/[id]/run/route.ts) | Visible tests |
| [`api/coding/challenges/[id]/submit/route.ts`](../../app/api/coding/challenges/[id]/submit/route.ts) | Full grade |
| [`api/invite/[token]/route.ts`](../../app/api/invite/[token]/route.ts) | Invite metadata / redeem |
| [`api/proctoring/events/route.ts`](../../app/api/proctoring/events/route.ts) | Proctor events |
| [`api/proctoring/recordings/route.ts`](../../app/api/proctoring/recordings/route.ts) | Media uploads |
| [`api/vitals/route.ts`](../../app/api/vitals/route.ts) | Core Web Vitals beacon |
