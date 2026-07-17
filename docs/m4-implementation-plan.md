# Milestone 4 — User Accounts & Personal Features: Implementation Plan

**Status**: Plan only (not implemented)  
**Sources**: Brief §3.4 · `docs/plan.md` §10 · existing M1–M3 codebase  
**Stack (planned)**: Next.js 16 · React 19 · TypeScript · Tailwind v4 · MongoDB Atlas + Mongoose · Auth.js (NextAuth v5) credentials · Resend/SMTP · Media Maker via `@vercel/og` or `html-to-image`  
**Last updated**: 2026-07-17

---

## Context

M1 (reading), M2 (audio), and M3 (study tools) are shipped. The app is fully **unauthenticated** today: Quran text/audio/study come from public APIs; prefs live in `localStorage`. M4 adds the personalisation layer: accounts, bookmarks, notes, reading progress, streaks/goals, and a shareable ayah Media Maker.

**Only existing UI hooks today:**

- `AyahBlock` — disabled Bookmark button (`title="Bookmark (Milestone 4)"`)
- `ReaderControls` — disabled Bookmark (`title="Bookmark (coming soon)"`)

No auth packages, DB, account routes, notes, progress, streaks, or media-maker code exist yet.

**Hard constraints (must hold throughout build):**

1. **Zero regression on M1–M3** — reading, audio, study stay fully usable without an account.
2. **Quran content is never stored in our DB** — Mongo holds *user data only*.
3. **Best- and worst-case handling** — every feature degrades gracefully (see § Edge cases).
4. **Continuous deploy to live domain** — QA only on RememberQuran.com.
5. **Community fields on User exist for future-proofing** — do **not** build social/community features in M4.

---

## Guiding principles for M4

| Principle | Meaning |
|-----------|---------|
| Additive auth | Logged-out path unchanged; account features opt-in |
| Session is source of truth | Never trust `userId` from request body |
| Event stream for progress | Prefer `ProgressEvent` records over a single “% read” number (enables M5 hifz/learning plans) |
| Plain notes only | No rich text editor |
| Image required, video optional | Media Maker must ship PNG; Remotion video is stretch only |

---

## Tech stack decisions

| Concern | Choice | Notes |
|---------|--------|-------|
| Database | MongoDB Atlas + Mongoose | Brief + `docs/plan.md` |
| Auth | Auth.js v5 — credentials provider + bcrypt | Email/password only |
| Session | JWT cookies | Server-readable in Route Handlers |
| Password reset email | Resend (fallback: Nodemailer + SMTP) | Time-limited reset tokens |
| Media Maker | Spike `@vercel/og` vs `html-to-image` | Pick better Arabic font rendering |
| Video (stretch) | Remotion — defer to M5 if pipeline heavy | Vercel functions cannot render MP4 |

**Env vars to introduce (do not commit secrets):**

```
MONGODB_URI=
AUTH_SECRET=
AUTH_URL=                    # production site URL
RESEND_API_KEY=              # or SMTP_* 
EMAIL_FROM=
```

---

## Data model

All collections are user-scoped. Quran text stays on the API (`verseKey` = `"2:255"`).

### User

| Field | Purpose |
|-------|---------|
| `email` (unique, lowercased) | Login identity |
| `passwordHash` | bcrypt |
| `profile.displayName` | Future community — unused UI now |
| `profile.avatarUrl?` | Future — unused now |
| `roles: string[]` | Future — default `[]` or `['user']` |
| `moderation: { flagged, suspended }` | Future — unused now |
| `settings` | Account prefs (optional) |
| `lastPosition: { verseKey, surahId, ayahId, updatedAt }?` | Continue where you left off |
| `emailVerified?`, timestamps | Reset / future verify |

### Collection

| Field | Purpose |
|-------|---------|
| `userId` | Owner |
| `name` | e.g. Favourites, For memorisation |
| `isDefault?` | Seed “Favourites” on register |
| `createdAt` | |

### Bookmark

| Field | Purpose |
|-------|---------|
| `userId`, `verseKey`, `collectionId` | One bookmark placement |
| `createdAt` | |

Indexes: `(userId, verseKey)`, `(userId, collectionId)`.

### Note

| Field | Purpose |
|-------|---------|
| `userId`, `verseKey` | Unique pair — one note per ayah per user (upsert) |
| `text` | Plain text |
| timestamps | |

### ProgressEvent

| Field | Purpose |
|-------|---------|
| `userId`, `surah`, `fromAyah`, `toAyah`, `date` | Reading activity stream |
| | Supports progress %, daily goals, later learning plans |

Indexes: `(userId, date)`, `(userId, surah)`.

### Goal

| Field | Purpose |
|-------|---------|
| `userId` | Owner |
| `type` | `'pages' \| 'ayahs'` |
| `target` | Positive integer |
| `active` | Only one active goal recommended |
| `createdAt` | |

### StreakState (store or derive)

| Field | Purpose |
|-------|---------|
| `userId` | |
| `currentStreak` | Consecutive days goal met |
| `longestStreak?` | Optional display |
| `lastMetDate` | Calendar date (user TZ or UTC policy — decide at implement) |

---

## Routes & folder layout (planned)

```
src/app/(auth)/
  login/page.tsx
  register/page.tsx
  reset/page.tsx              # request + token confirm (or split)
src/app/account/
  settings/page.tsx
  bookmarks/page.tsx
  notes/page.tsx
  progress/page.tsx
  goals/page.tsx              # or section under progress
  media-maker/page.tsx
src/app/api/auth/[...nextauth]/route.ts
src/app/api/account/
  bookmarks/…
  collections/…
  notes/…
  progress/…
  goals/…
  settings/…
  media/…                     # if server OG image
src/components/account/       # BookmarkButton, NoteEditor, StreakDisplay, GoalSettings, ContinuePrompt
src/components/media-maker/   # AyahCardDesigner, presets
src/lib/db.ts
src/lib/models/               # User, Bookmark, Collection, Note, ProgressEvent, Goal, StreakState
```

Navbar: Login (logged out) · Account menu (logged in).

---

## Feature plans (brief §3.4)

### 3.4.1 Registration & Login

**Ship:**

- Register (email + password)
- Login / logout
- Forgot password → email reset link → set new password
- Account settings: change email, change password (require current password)

**Behaviour notes:**

- On register: create User + seed Collection “Favourites”
- Validate email format; password min length (e.g. 8) + basic strength rules
- Rate-limit auth endpoints where practical
- Suspended users (`moderation.suspended`) cannot log in (field present; enforce check even if nothing sets it yet)

### 3.4.2 Bookmarks

**Ship:**

- `BookmarkButton` on `AyahBlock` when logged in
- Collections: create / rename / delete; default Favourites
- `/account/bookmarks` — grouped by collection; each item links to `/[surahId]/[ayahId]`

**Logged out:** button stays disabled or opens a soft “Sign in to bookmark” prompt — never a hard wall on the reader.

### 3.4.3 Personal Notes

**Ship:**

- Plain-text `NoteEditor` per ayah (sheet/dialog)
- Upsert one note per `(userId, verseKey)`
- `/account/notes` — text + reference + jump link
- APIs always filter by session `userId` (private)

### 3.4.4 Reading Progress & Last Position

**Last position:**

- Logged-in reader writes `lastPosition` throttled (viewport ayah or interval)
- Home / return visit: “Continue where you left off” → last verse URL
- Dismissible; don’t show on every single navigation

**Progress:**

- A surah is marked **read once the user has viewed it** (not word-by-word)
- Define implementable rule at Phase 3 (e.g. opened surah and scrolled past first ayah, or ≥N ayahs visible for ≥T seconds)
- `/account/progress`: % of 114 + simple read/unread surah grid

### 3.4.5 Reading Streaks & Goals

**Ship:**

- Set daily goal: ayahs/day or pages/day + target
- Each day: met / not met from ProgressEvents
- Display: current streak count + simple week dots / mini calendar
- Keep UI simple — no complex gamification

### 3.4.6 Quran Media Maker

**Ship:**

- Entry from ayah actions and/or `/account/media-maker?verse=2:255`
- Card: Arabic + translation + surah/ayah ref + RememberQuran.com branding
- Few background/colour presets
- Download PNG; share via Web Share API or download + copy

**Spike first:** `@vercel/og` vs client canvas — Arabic font quality decides.  
**Stretch only:** Remotion video; if heavy, defer to M5 (image alone meets brief).

---

## Build order (phases)

| Phase | Deliverable | Done when |
|-------|-------------|-----------|
| **0 — Foundation** | Atlas, env, `db.ts`, models, Auth.js register/login/logout/reset/settings | Account works on live domain |
| **1 — Bookmarks** | Button, collections CRUD, bookmarks page | Bookmark → list → deep link |
| **2 — Notes** | NoteEditor + notes page | Private note → list → jump back |
| **3 — Progress** | Last position + continue prompt + surah progress | Continue works; grid updates |
| **4 — Goals & streaks** | Goal settings + streak display | Goal met days increment streak |
| **5 — Media Maker** | Presets + PNG download/share | Branded image for any ayah |
| **6 — Regression** | Full M1–M4 pass on live | Logged-out identical to pre-M4 |

---

## Best case / worst case / edge cases

Every feature must define happy path, failure path, and edges. Implementers should handle these explicitly (loading, empty, error, auth).

### Global / platform

| Case | Behaviour |
|------|-----------|
| **Best** | Logged-in user uses all personal features; logged-out user reads/listens/studies with zero friction |
| **Worst** | Mongo or Auth down — site still serves M1–M3 from Quran APIs; account pages show clear “temporarily unavailable” |
| Edge: mid-session DB blip | Mutations fail with toast/retry; do not blank the reader |
| Edge: expired / invalid session | Redirect to login on `/account/*`; clear stale client state |
| Edge: `moderation.suspended` | Login rejected with neutral message |
| Edge: concurrent tabs | Last write wins for notes/settings; bookmarks stay consistent via unique indexes |
| Edge: slow mobile network | Skeletons on account pages; never block surah load on auth |

---

### 3.4.1 Auth (register / login / reset / settings)

| Case | Behaviour |
|------|-----------|
| **Best** | Register → auto session → land on home or intended URL; reset email arrives &lt;1 min |
| **Worst** | Email provider down — reset request still returns generic success (no email enumeration); show “if an account exists, we sent a link” |
| Edge: duplicate email on register | Clear error: account already exists → link to login |
| Edge: wrong password | Generic “Invalid email or password” (don’t reveal which) |
| Edge: weak / short password | Client + server validation |
| Edge: reset token expired / reused | Single-use tokens; clear “link expired” → request again |
| Edge: change email to one already taken | Reject with conflict |
| Edge: change password without current | Reject |
| Edge: CSRF / forged forms | Auth.js CSRF + SameSite cookies |
| Edge: brute force | Rate limit login/reset (IP + email) |
| Edge: open redirect after login | Allowlist relative paths only (`/2/255`, `/account/…`) |

---

### 3.4.2 Bookmarks & collections

| Case | Behaviour |
|------|-----------|
| **Best** | Bookmark ayah into Favourites; organise into custom folders; jump back from account page |
| **Worst** | Save fails (offline/DB) — button shows error; ayah still readable |
| Edge: logged out clicks bookmark | Soft prompt to sign in; no data loss on reader |
| Edge: bookmark same ayah twice | Idempotent toggle or unique constraint — no duplicates |
| Edge: delete collection with bookmarks | Confirm: move to Favourites **or** delete bookmarks (pick one UX and document) |
| Edge: rename to empty / duplicate name | Validate; reject empty; allow or disallow duplicate names per user (recommend unique per user) |
| Edge: invalid `verseKey` | Server validates `surah` 1–114 and ayah within surah bounds |
| Edge: deleted Favourites | Disallow deleting the default collection, or re-seed if missing |
| Edge: huge bookmark list | Paginate or virtualise account page |

---

### 3.4.3 Notes

| Case | Behaviour |
|------|-----------|
| **Best** | Write/edit plain note on ayah; see it only when logged in as owner |
| **Worst** | Save fails — keep local draft in component state until retry succeeds |
| Edge: empty note save | Treat as delete or reject empty (pick one) |
| Edge: very long note | Cap length (e.g. 5–10k chars) server-side |
| Edge: another user’s note ID in URL/API | 404 — never leak existence |
| Edge: XSS in note text | Render as plain text only (no `dangerouslySetInnerHTML`) |
| Edge: two tabs editing same note | Last save wins; optional “updated elsewhere” if `updatedAt` mismatches |

---

### 3.4.4 Last position & progress

| Case | Behaviour |
|------|-----------|
| **Best** | Return next day → one clear Continue CTA → lands on last ayah with highlight |
| **Worst** | Position write fails silently (throttled); next visit has no continue — app still usable |
| Edge: never read while logged in | No continue banner |
| Edge: last position ayah deleted/invalid | Fall back to surah start or hide continue |
| Edge: thrashing scroll / rapid ayah changes | Throttle writes (e.g. 5–10s or on leave page) |
| Edge: “viewed surah” definition abuse | Document rule; avoid marking all 114 from a single list page visit |
| Edge: surah opened but bounced in &lt;1s | Do not count as read |
| Edge: progress % rounding | Floor or show “X of 114”; don’t claim 100% early |
| Edge: timezone midnight | Define day boundary (UTC vs local); streak/progress day keys must match goals |

---

### 3.4.5 Goals & streaks

| Case | Behaviour |
|------|-----------|
| **Best** | Set “10 ayahs/day”; meet goal; streak increments; simple visual |
| **Worst** | No goal set — streak UI shows empty state / CTA to set goal, not a broken counter |
| Edge: change goal mid-day | Apply new target from that day forward; don’t rewrite history oddly |
| Edge: target = 0 or negative | Reject |
| Edge: pages vs ayahs | Document how a “page” maps (e.g. ~15 lines / fixed ayah count) — must be deterministic |
| Edge: miss a day | Streak resets to 0; longest streak retained if tracked |
| Edge: meet goal in multiple sessions same day | Count once toward streak |
| Edge: clock skew / travel | Prefer server date for `lastMetDate` |
| Edge: delete goal | Streak display pauses or clears current goal link; don’t invent progress |

---

### 3.4.6 Media Maker

| Case | Behaviour |
|------|-----------|
| **Best** | Pick ayah + preset → beautiful PNG with Arabic, translation, ref, brand → download/share |
| **Worst** | Image generation fails — show error + retry; offer copy-ayah / share URL fallback (already in M1) |
| Edge: long ayah / long translation | Truncate or scale font; never overflow card |
| Edge: RTL Arabic + LTR brand | Layout tested; brand doesn’t collide with Arabic |
| Edge: font missing on OG runtime | Bundle/self-host KFGQPC or Amiri for generator |
| Edge: dark/light presets | Contrast AA for Arabic + English where possible |
| Edge: unauthenticated use | Allow Media Maker without login (shareable content) **or** require login — decide at implement; recommend allow without login to match public-benefit brief |
| Edge: Web Share unsupported | Download file + toast “Image saved” |
| Edge: invalid verse query param | 404 / empty state with surah picker |
| Edge: Remotion stretch fails | Ship image-only; no blocked release |

---

## Non-goals (explicitly out of M4)

- Community feeds, follows, public profiles, comments, moderation dashboards  
- OAuth social login (Google/Apple) — credentials only unless brief changes  
- Rich-text / Markdown notes  
- Storing Quran text or tafsir in Mongo  
- Forced login for reading, audio, tafsir, search, radio  
- Full Remotion video pipeline (unless spike is trivial after image ships)

---

## Risks & spikes (do before / during Phase 0–5)

| Risk | Mitigation |
|------|------------|
| Arabic rendering in OG/canvas | Early Media Maker spike; pick winner |
| Reset email deliverability | Configure Resend domain DNS before QA |
| Auth.js v5 + Next 16 APIs | Read current Auth.js App Router docs at implement time |
| Ambiguous “surah viewed” / “page” | Write rules in code comments + this doc before Phase 3–4 |
| Accidental auth wall | Regression: every M1–M3 path works logged out |

---

## Acceptance checklist (QA on live domain)

### Auth
- [ ] Register, login, logout
- [ ] Forgot password email + successful reset
- [ ] Change email / change password
- [ ] Invalid credentials and duplicate email handled safely

### Bookmarks
- [ ] Bookmark ayah (logged in)
- [ ] Create / rename / delete collection
- [ ] Bookmarks page grouped; jump to ayah works
- [ ] Logged-out reader still works

### Notes
- [ ] Create / edit / delete note
- [ ] Notes page + link back
- [ ] Notes not visible to other accounts

### Progress
- [ ] Continue where you left off
- [ ] Surah progress tracker updates after viewing
- [ ] Dismiss / no-spam continue UX

### Goals & streaks
- [ ] Set ayahs or pages daily goal
- [ ] Streak increments on met days; resets on miss
- [ ] Simple visual display

### Media Maker
- [ ] Arabic + translation + reference + brand on card
- [ ] Presets switch
- [ ] Download PNG; share path works or degrades

### Regression
- [ ] Logged-out: M1 reading, M2 audio, M3 study unchanged
- [ ] No account required for core Quran features

---

## Alignment with master plan

This document expands `docs/plan.md` §10 for implementation and QA. If anything conflicts, **brief §3.4 + this file’s edge-case table** win for M4 behaviour; stack choices stay MongoDB + Auth.js unless explicitly revised.

**Next step when implementing:** Phase 0 only (DB + Auth.js + settings), then bookmarks.
)
