# `components/` — feature UI

Client or shared React. These files **must not** import `@langchain/*`, `lib/agents`, `lib/graph`, or the admin Supabase client.

## Interview and voice

| File | Purpose |
| --- | --- |
| [`interview-room/interview-room.tsx`](../../components/interview-room/interview-room.tsx) | Text room: start, answer, next, end |
| [`interview-room/question-panel.tsx`](../../components/interview-room/question-panel.tsx) | Current question |
| [`interview-room/session-timer.tsx`](../../components/interview-room/session-timer.tsx) | Remaining time |
| [`interview-room/topic-rail.tsx`](../../components/interview-room/topic-rail.tsx) | Topic chips |
| [`voice/voice-room.tsx`](../../components/voice/voice-room.tsx) | Voice loop |
| [`voice/voice-avatar.tsx`](../../components/voice/voice-avatar.tsx) | Maya avatar |
| [`voice/voice-controls.tsx`](../../components/voice/voice-controls.tsx) | Mic / stop |
| [`voice/voice-question-card.tsx`](../../components/voice/voice-question-card.tsx) | Spoken question |
| [`voice/voice-transcript-sidebar.tsx`](../../components/voice/voice-transcript-sidebar.tsx) | Editable transcript |
| [`voice/use-voice-recorder.ts`](../../components/voice/use-voice-recorder.ts) | Record; optional silence auto-stop (`VOICE_SILENCE_MS`, default off) |

## Wizard

| File | Purpose |
| --- | --- |
| [`wizard/interview-wizard.tsx`](../../components/wizard/interview-wizard.tsx) | Multi-step create session |
| [`wizard/wizard-shell.tsx`](../../components/wizard/wizard-shell.tsx) | Step chrome |
| [`wizard/selection-card.tsx`](../../components/wizard/selection-card.tsx) | Option card |
| [`wizard/steps/step-interview-type.tsx`](../../components/wizard/steps/step-interview-type.tsx) | Type |
| [`wizard/steps/step-technologies.tsx`](../../components/wizard/steps/step-technologies.tsx) | Stack |
| [`wizard/steps/step-topics.tsx`](../../components/wizard/steps/step-topics.tsx) | Topics |
| [`wizard/steps/step-experience.tsx`](../../components/wizard/steps/step-experience.tsx) | Level |
| [`wizard/steps/step-difficulty.tsx`](../../components/wizard/steps/step-difficulty.tsx) | Difficulty |
| [`wizard/steps/step-duration.tsx`](../../components/wizard/steps/step-duration.tsx) | Minutes |
| [`wizard/steps/step-personalization.tsx`](../../components/wizard/steps/step-personalization.tsx) | Resume / JD / company |
| [`wizard/steps/step-review.tsx`](../../components/wizard/steps/step-review.tsx) | Confirm |

State persists in [`lib/store/wizard-store.ts`](../../lib/store/wizard-store.ts) (Zustand).

## Coding, report, dashboard

| File | Purpose |
| --- | --- |
| [`coding/code-editor.tsx`](../../components/coding/code-editor.tsx) | Monaco wrapper |
| [`coding/coding-room.tsx`](../../components/coding/coding-room.tsx) | Practice room |
| [`coding/interview-coding-room.tsx`](../../components/coding/interview-coding-room.tsx) | Interview coding leg |
| [`coding/test-results-panel.tsx`](../../components/coding/test-results-panel.tsx) | Pass/fail |
| [`coding/ai-challenge-generator.tsx`](../../components/coding/ai-challenge-generator.tsx) | Ask AI for a practice problem |
| [`report/report-header.tsx`](../../components/report/report-header.tsx) | Score + hire label |
| [`report/sub-scores.tsx`](../../components/report/sub-scores.tsx) | Category scores |
| [`report/topic-scores-chart.tsx`](../../components/report/topic-scores-chart.tsx) | Topic bars |
| [`report/strengths-weaknesses.tsx`](../../components/report/strengths-weaknesses.tsx) | Lists |
| [`report/question-feedback-list.tsx`](../../components/report/question-feedback-list.tsx) | Per-question review |
| [`report/study-plan.tsx`](../../components/report/study-plan.tsx) | 7 / 30 day plan |
| [`report/recommended-next.tsx`](../../components/report/recommended-next.tsx) | Next session CTA |
| [`report/comparison-with-previous.tsx`](../../components/report/comparison-with-previous.tsx) | Delta vs last |
| [`dashboard/summary-cards.tsx`](../../components/dashboard/summary-cards.tsx) | KPIs |
| [`dashboard/score-trend-chart.tsx`](../../components/dashboard/score-trend-chart.tsx) | History chart |
| [`dashboard/topics-to-improve.tsx`](../../components/dashboard/topics-to-improve.tsx) | Weak topics |
| [`dashboard/recent-interviews-table.tsx`](../../components/dashboard/recent-interviews-table.tsx) | Recent rows |

## Auth, settings, onboarding, marketing

| File | Purpose |
| --- | --- |
| [`auth/auth-shell.tsx`](../../components/auth/auth-shell.tsx) | Auth page frame |
| [`auth/login-form.tsx`](../../components/auth/login-form.tsx) | Email login |
| [`auth/register-form.tsx`](../../components/auth/register-form.tsx) | Register |
| [`auth/google-auth-button.tsx`](../../components/auth/google-auth-button.tsx) | Google OAuth |
| [`auth/forgot-password-form.tsx`](../../components/auth/forgot-password-form.tsx) | Request reset |
| [`auth/reset-password-form.tsx`](../../components/auth/reset-password-form.tsx) | Set password |
| [`settings/settings-form.tsx`](../../components/settings/settings-form.tsx) | Profile |
| [`settings/avatar-upload.tsx`](../../components/settings/avatar-upload.tsx) | Avatar |
| [`onboarding/onboarding-wizard.tsx`](../../components/onboarding/onboarding-wizard.tsx) | First-run |
| [`onboarding/skills-input.tsx`](../../components/onboarding/skills-input.tsx) | Skills chips |
| [`marketing/landing-page-view.tsx`](../../components/marketing/landing-page-view.tsx) | Home content |
| [`marketing/site-header.tsx`](../../components/marketing/site-header.tsx) | Public nav |
| [`marketing/site-footer.tsx`](../../components/marketing/site-footer.tsx) | Footer |
| [`brand/brand-logo.tsx`](../../components/brand/brand-logo.tsx) | Logo |

## Admin, recruiter, proctoring, layout

| File | Purpose |
| --- | --- |
| [`admin/technologies-manager.tsx`](../../components/admin/technologies-manager.tsx) | Tech CRUD |
| [`admin/technology-form-dialog.tsx`](../../components/admin/technology-form-dialog.tsx) | Tech form |
| [`admin/topics-manager.tsx`](../../components/admin/topics-manager.tsx) | Topics CRUD |
| [`admin/topic-form-dialog.tsx`](../../components/admin/topic-form-dialog.tsx) | Topic form |
| [`admin/questions-manager.tsx`](../../components/admin/questions-manager.tsx) | Bank list |
| [`admin/question-form-dialog.tsx`](../../components/admin/question-form-dialog.tsx) | Bank form |
| [`admin/generate-draft-dialog.tsx`](../../components/admin/generate-draft-dialog.tsx) | AI draft |
| [`admin/challenges-manager.tsx`](../../components/admin/challenges-manager.tsx) | Challenge list |
| [`admin/challenge-editor.tsx`](../../components/admin/challenge-editor.tsx) | Challenge + tests |
| [`recruiter/onboarding-form.tsx`](../../components/recruiter/onboarding-form.tsx) | Create org |
| [`recruiter/create-assessment-form.tsx`](../../components/recruiter/create-assessment-form.tsx) | New assessment |
| [`recruiter/assessment-invite-panel.tsx`](../../components/recruiter/assessment-invite-panel.tsx) | Invites |
| [`recruiter/integrity-panel.tsx`](../../components/recruiter/integrity-panel.tsx) | Proctor timeline |
| [`invite/invite-redeem-client.tsx`](../../components/invite/invite-redeem-client.tsx) | Redeem token |
| [`proctoring/proctor-shell.tsx`](../../components/proctoring/proctor-shell.tsx) | Camera / screen |
| [`proctoring/maybe-proctor-wrap.tsx`](../../components/proctoring/maybe-proctor-wrap.tsx) | Wrap invited sessions |
| [`layout/candidate-sidebar.tsx`](../../components/layout/candidate-sidebar.tsx) | Candidate nav |
| [`layout/candidate-topbar.tsx`](../../components/layout/candidate-topbar.tsx) | Candidate header |
| [`layout/admin-sidebar.tsx`](../../components/layout/admin-sidebar.tsx) | Admin nav |
| [`layout/admin-topbar.tsx`](../../components/layout/admin-topbar.tsx) | Admin header |
| [`layout/recruiter-sidebar.tsx`](../../components/layout/recruiter-sidebar.tsx) | Recruiter nav |
| [`layout/recruiter-topbar.tsx`](../../components/layout/recruiter-topbar.tsx) | Recruiter header |
| [`theme/theme-provider.tsx`](../../components/theme/theme-provider.tsx) | Theme context |
| [`theme/theme-picker.tsx`](../../components/theme/theme-picker.tsx) | Theme switch |

## `components/ui/`

shadcn/ui primitives (`button`, `card`, `dialog`, `form`, `input`, `select`, `table`, …). Prefer these over one-off CSS. Do not put product logic here.
