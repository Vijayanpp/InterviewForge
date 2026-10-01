# Product flows

## Candidate

1. **Register / login** → complete **onboarding** (profile).
2. **Dashboard** — recent sessions, CTAs to practice or start an interview.
3. **Settings** — profile name, avatar upload (`/api/profile/avatar`).
4. **New interview** (`/interviews/new`) — wizard:
   - Interview type (technical, behavioural, resume-based, JD-based, coding, mixed, …)
   - Technologies / topics, difficulty, duration
   - Delivery: **Text** or **Voice** (coding type forces coding room)
   - Optional resume / JD / custom instructions
5. **Live room**
   - Text → `/interviews/[id]/room`
   - Voice → `/interviews/[id]/voice`
   - Coding / mixed coding leg → `/interviews/[id]/coding`
6. **Report** → `/interviews/[id]/report` (scores, feedback, study plan when generated).
7. **History** → `/interviews/history`.
8. **Practice** → browse challenges → Monaco editor run/submit.

### Text interview loop

Opening greeting (Maya) → answer → evaluate → follow-up or next question → end → report.

### Voice interview loop

TTS (Maya voice) → auto-listen (stays on until pause/mic stop) → STT draft → edit optional → **Finish Answer** → same adaptive engine as text.

### Coding / mixed

- **Coding** type: open coding room immediately.
- **Mixed**: short text round, then hand off to coding; report includes coding score.

## Admin

| Area | Path | Purpose |
| --- | --- | --- |
| Dashboard | `/admin/dashboard` | High-level stats |
| Technologies | `/admin/technologies` | Catalog CRUD |
| Topics | `/admin/topics` | Topic trees |
| Question bank | `/admin/questions` | Optional reference Qs + AI draft helper |
| Challenges | `/admin/challenges` | Coding challenges + nested test cases |

Live interviews are **AI-generated**, not pulled from the bank by default. Bank drafts use `skipOpening` so they stay technical.

## Recruiter / proctored assessments

1. Candidate opens **Recruiter** in the sidebar (`/become-recruiter`) → creates org → role becomes `interviewer`.
2. Recruiter creates an assessment (`/recruiter/assessments/new`) → **Publish**.
3. Invite candidate emails → each gets `/invite/<token>` (Resend if `RESEND_API_KEY` set; otherwise copy link from UI).
4. Candidate signs in with the invited email → starts → AI interview room with **heavy proctoring** (webcam + screen recording, fullscreen, tab/clipboard locks, MediaPipe face checks).
5. Recruiter opens the assessment → integrity score, event timeline, recording playback + link to interview report.

Billing metering remains deferred (schema only).

## Recruiter / billing (legacy note)

Subscription plan rows are seeded for future metering.
