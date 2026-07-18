# M4 Phase 3 — Reading Progress & Last Position Implementation Plan

**Status:** Implemented (P0–P5) — regression smoke as needed  
**Depends on:** Phase 0 (Auth.js, User + `lastPosition`, soft-gate) + Phase 1–2 patterns — **done**  
**Done when:** Signed-in user gets a dismissible “Continue where you left off” CTA, last position updates while reading (throttled), and `/account/progress` shows % of 114 + a read/unread surah grid driven by `ProgressEvent`  
**Sources:** Brief §3.4.4 · `docs/plan.md` §10.3 · `docs/m4-implementation-plan.md` §3.4.4 · existing `User.lastPosition` + `ProgressEvent` models

---

## Goal

Remember where a signed-in user stopped reading, let them jump back in one tap, and show simple surah-level progress (viewed vs not). Guests keep full reading access; progress tracking is silent and opt-in via account (no hard wall on the reader).

**Hard constraints (must hold):**

1. **Zero regression on M1–M3** — reading, audio, study never require an account.
2. **Quran content never stored in our DB** — only `verseKey` / surah + ayah ranges.
3. **Session `userId` only** — never trust client `userId`.
4. **Never block the reader** — progress writes fail quietly; UI stays usable.
5. **Event stream, not a single % field** — `ProgressEvent` rows power progress now and goals/streaks (Phase 4) later.
6. **Client must not import Mongoose** — shared helpers stay in client-safe modules (same lesson as Notes).

---

## Already in place (reuse, do not rebuild)

| Piece | Location | Notes |
|-------|----------|--------|
| `User.lastPosition` | `src/lib/models/User.ts` | `{ verseKey, surahId, ayahId, updatedAt }` embedded |
| `ProgressEvent` model | `src/lib/models/ProgressEvent.ts` | `userId, surah, fromAyah, toAyah, date` + indexes |
| Soft-gate reason `"progress"` | `src/lib/auth/safe-next.ts` | Copy already exists |
| Session / verse-key helpers | `getSessionUserId`, `parseVerseKey`, `privateJson` | Same as bookmarks/notes |
| Account hub card | `/account` | Progress card exists with `soon: true` |
| Deep link | `/[surahId]/[ayahId]` | Existing target highlight for ayah |
| Soft-gate return path | `SoftGateDialog` + `safeNextPath` | Returns to current URL after login |

**Not built yet:** progress APIs, reader position tracker, Continue prompt, `/account/progress`, surah grid.

---

## Product decisions (lock before coding)

| Decision | Choice | Why |
|----------|--------|-----|
| What is “last position”? | **Most recent ayah that was the primary viewport focus** while signed in | Matches “continue reading” mental model |
| How do we detect focus ayah? | **IntersectionObserver** on ayah roots (`#ayah-N` / `data-verse-key`) — pick the ayah with highest visible ratio near the top third of the viewport | Stable; no scroll spam math |
| Write throttle for `lastPosition` | **At most every 8s**, plus **flush on page hide / route leave** (`visibilitychange` / `pagehide`) | Stops thrashing; still accurate on leave |
| Guest last-position | **Do not write** — no `localStorage` progress in M4 | Keeps M4 scope clear; soft-gate only if we ever show Continue to guests (we don’t) |
| Continue CTA placement | **Home (`/`)** and **Account overview** — not on every surah page | Avoid nagging mid-read |
| Continue dismiss | **Session dismiss** (`sessionStorage` key) + optional “Don’t show today” later | Dismissible; not every navigation |
| When to hide Continue | No `lastPosition`, invalid verse, or user is **already on that ayah URL** | No useless CTA |
| What counts as “surah read”? | Surah marked **viewed** if user has a `ProgressEvent` for that surah where they spent **≥ 3s** on the surah page **and** at least **1 ayah** was focused (not a bounce) | Stops list-page / accidental open abuse |
| ProgressEvent grain (v1) | **One event per surah visit session** (or merge same day): `{ surah, fromAyah, toAyah }` = min/max focused ayahs during that visit; `date` = **UTC calendar day at midnight** | Matches model comment; ready for Phase 4 goals |
| ProgressEvent write throttle | **Debounce 15s** while scrolling; flush on leave; **max 1 upsert per (user, surah, UTC day)** via findOneAndUpdate | Avoids event spam |
| Progress % display | **“X of 114 surahs viewed”** + floor % — never claim 100% until 114 distinct surahs have events | Clear, honest |
| Surah grid | 114 cells: unread / viewed; tap → `/[surahId]` | Simple visual tracker |
| Timezone for `date` | **UTC day** for storage (model already says this); Phase 4 streaks use same rule | One day key across progress + goals |
| Audio-only listening | **Does not** update last position unless an ayah is also focused in the reader viewport | Position = reading place; avoid radio jumping Continue to random ayah |
| Soft-gate | Continue / progress account features are **signed-in only**; guest never sees Continue from DB | No pressure wall |

---

## “Viewed surah” rule (canonical)

```
ON surah page mount (signed in):
  start dwell timer

ON ayah focus change (IntersectionObserver):
  record focused verseKey
  update session minAyah / maxAyah for this surah

ON throttle tick OR page leave:
  IF dwellMs >= 3000 AND at least one ayah focused:
    upsert ProgressEvent for (userId, surah, UTC day)
      fromAyah = min focused, toAyah = max focused
    PATCH lastPosition to latest focused ayah
  ELSE:
    skip ProgressEvent (bounce)
    still may update lastPosition if an ayah was focused ≥ once and dwell ok — OR only update lastPosition when dwell ≥ 3s (prefer: lastPosition only if dwell ≥ 3s OR user scrolled past ayah 1)
```

**Locked rule for v1:**

1. **lastPosition** — update when a focused ayah is known and either (a) 8s throttle fires with dwell ≥ 3s, or (b) page hide with dwell ≥ 3s and a focused ayah.
2. **ProgressEvent (surah viewed)** — same dwell ≥ 3s + ≥ 1 focused ayah; upsert one row per user/surah/UTC-day expanding `fromAyah`/`toAyah` to the session min/max.

Visiting the home surah list alone **never** creates ProgressEvents.

---

## Architecture

```
Reader (surah page, signed in)
  └─ ProgressTracker (client)
        ├─ IntersectionObserver → focused verseKey
        ├─ throttle → PATCH /api/account/progress/position
        └─ debounce → PUT /api/account/progress/events

Home / Account overview
  └─ ContinuePrompt
        └─ GET /api/account/progress (or server-load lastPosition)
        └─ Link → /{surahId}/{ayahId}
        └─ Dismiss → sessionStorage

Account /progress
  └─ Server: lastPosition + distinct viewed surahs from ProgressEvent
  └─ ProgressView: % + 114 grid + continue row
```

**Rule:** All queries filter by session `userId`. Failures never blank the reader.

---

## Data model (already defined — do not change unless necessary)

### `User.lastPosition`

```
{
  verseKey: string   // "2:255"
  surahId: number
  ayahId: number
  updatedAt: Date
}
```

### `ProgressEvent`

```
{
  userId, surah, fromAyah, toAyah,
  date: Date   // UTC midnight of calendar day
}
```

Indexes: `(userId, date)`, `(userId, surah)`.

**Optional uniqueness for v1 upserts:** prefer application-level upsert keyed by `(userId, surah, date)` — add a unique compound index if safe:

```
{ userId: 1, surah: 1, date: 1 } unique
```

Decide at implement: unique index makes “one event per surah per day” hard; expanding range on conflict is clean. **Recommend adding unique index** in this phase.

---

## API design

All routes: `runtime = "nodejs"`, `privateJson` / no-store, session required → `401`.

### Progress — `/api/account/progress`

| Method | Behaviour |
|--------|-----------|
| `GET` | Return `{ lastPosition, viewedSurahIds: number[], viewedCount, total: 114 }` — `viewedSurahIds` = distinct `surah` from user’s ProgressEvents |

### Position — `/api/account/progress/position`

| Method | Body | Behaviour |
|--------|------|-----------|
| `PATCH` | `{ verseKey }` | Validate with `parseVerseKey`; set `User.lastPosition`; `200` |

### Events — `/api/account/progress/events`

| Method | Body | Behaviour |
|--------|------|-----------|
| `PUT` | `{ surah, fromAyah, toAyah, date? }` | Validate bounds (`getAyahCount`); upsert by `(userId, surah, utcDay)` expanding min/max ayah range; `date` server-forced to UTC midnight of “today” (ignore client date for security) |

### Status codes

| Code | When |
|------|------|
| `200` | Success |
| `400` | Invalid verse / surah / ayah range |
| `401` | No session |
| `500` | DB error — generic message |

### Shared helpers (client-safe where needed)

- `utcDayStart(d = new Date())` → Date at UTC midnight  
- `parseVerseKey` — existing  
- Never import models from client trackers — only `fetch` APIs  

---

## UI / pages

### 1. `ProgressTracker` (reader, client)

**Mount on:** surah reader layout / `QuranReader` when session user present.

| Behaviour | Detail |
|-----------|--------|
| Observe ayah elements | `data-verse-key` or `#ayah-*` |
| Throttle position PATCH | 8s |
| Debounce event PUT | 15s + flush on hide |
| Guest | No-op (do not mount network calls) |
| Errors | Swallow / console; no toast spam |

### 2. `ContinuePrompt`

| Surface | Behaviour |
|---------|-----------|
| Home `/` | Banner/row: “Continue · Surah name · 2:255” → link; Dismiss |
| Account overview | Same compact row above feature list |
| Dismiss | `sessionStorage['rq-continue-dismissed'] = verseKey+updatedAt` so same position stays dismissed this tab session |
| Loading | Invisible until position known (no layout jump if none) |

### 3. `/account/progress`

- Auth-gated like other account pages  
- Header: “X of 114 surahs viewed” + percentage  
- Continue row if `lastPosition` exists  
- Grid: 114 cells (responsive), viewed = primary tint; unread = muted  
- Cell link to `/[surahId]`  
- Empty: “Start reading any surah — progress appears after a short visit”  
- Remove `soon: true` on hub; add **Progress** to `AccountNav`  

### 4. Soft-gate

No soft-gate required for silent tracking. Soft-gate `"progress"` only if we later add an explicit “Save progress” control for guests — **out of scope for v1**.

---

## Build order (implementation steps)

| Step | Deliverable | Verify |
|------|-------------|--------|
| **P0** | Helpers: `utcDayStart`; optional unique index on ProgressEvent `(userId, surah, date)` | Unit/manual date keys |
| **P1** | `GET /api/account/progress` + `PATCH .../position` + `PUT .../events` | curl with session; invalid keys `400` |
| **P2** | `ProgressTracker` on reader (observer + throttle/flush) | lastPosition updates after ~3s+ scroll; bounce &lt;3s no event |
| **P3** | `ContinuePrompt` on home + account overview | Jump lands on ayah with highlight; dismiss works |
| **P4** | `/account/progress` page + grid + % | Grid fills after viewing surahs |
| **P5** | Account hub `soon: false`; AccountNav Progress link | Logged-out reader unchanged |
| **P6** | Typecheck, lint, mobile smoke | M1–M3 free path intact |

---

## Best / worst / edge cases

### Happy path (best)

| Case | Behaviour |
|------|-----------|
| Read Al-Baqarah for a minute | lastPosition updates; ProgressEvent for surah 2; grid marks 2 viewed |
| Return next day to home | Continue CTA → `/2/{ayah}` with highlight |
| View 10 surahs over a week | Progress shows “10 of 114” |

### Failure path (worst)

| Case | Behaviour |
|------|-----------|
| DB down on PATCH | Silent fail; reading continues; no Continue next visit (acceptable) |
| DB down on account page | Error + Retry; rest of app fine |
| Session expired mid-read | Stop writing; no soft-gate spam |

### Auth & privacy

| Case | Behaviour |
|------|-----------|
| Guest | No tracker writes; no Continue from server |
| Another user’s progress | Impossible — session filter |
| Client sends fake `date` | Server ignores; uses UTC today |
| Client sends `userId` | Ignored |

### Tracking edges

| Case | Behaviour |
|------|-----------|
| Open surah and leave in &lt;3s | No ProgressEvent; prefer no lastPosition update |
| Scroll thrashing | Throttle/debounce caps writes |
| Two tabs different surahs | Last successful PATCH wins for lastPosition; both surahs can get events |
| Invalid lastPosition in DB | Hide Continue; optionally clear on GET |
| Deep-linked ayah open | That ayah can become focus immediately if visible ≥ dwell |
| Reading mode vs translation mode | Same observer targets |
| Radio / audio without scroll | No position change |
| Surah list page `/` | No events |
| Same surah same day revisit | Upsert expands fromAyah/toAyah range |
| Progress % | `floor(viewed/114*100)`; show counts too |

### Continue UX edges

| Case | Behaviour |
|------|-----------|
| Never read logged in | No banner |
| Dismissed | Hidden until position changes (new verseKey or newer updatedAt) |
| Already on that ayah | Hide banner |
| After login via soft-gate on other features | Continue can appear on next home visit |

### Security & abuse

| Case | Behaviour |
|------|-----------|
| Spam PUT events | Debounce client + upsert server; optional rate limit later |
| Out-of-range ayah | `400` via `getAyahCount` |
| fromAyah &gt; toAyah | Normalize swap or reject |
| Logs | Do not log full reading paths verbosely in prod |

---

## Security & privacy checklist

- [ ] Session `userId` on every read/write  
- [ ] Server-side verse/surah validation  
- [ ] Server-owned UTC day for events  
- [ ] No Mongoose in client bundles  
- [ ] Failures never block Quran UX  
- [ ] Progress private — account pages only  

---

## Out of scope (this phase)

- Goals & streaks (Phase 4) — but events must be compatible  
- Per-ayah completion %, juz/hizb progress  
- Guest localStorage continue  
- Hifz / memorised flags (M5)  
- Push notifications / reminders  
- Complex gamification / badges  

---

## File checklist (expected touch list)

```
src/lib/progress/date.ts                 NEW — utcDayStart (client-safe)
src/app/api/account/progress/route.ts    NEW — GET summary
src/app/api/account/progress/position/route.ts  NEW — PATCH
src/app/api/account/progress/events/route.ts    NEW — PUT upsert
src/components/reader/ProgressTracker.tsx       NEW
src/components/account/ContinuePrompt.tsx       NEW
src/components/account/ProgressView.tsx         NEW
src/app/account/progress/page.tsx               NEW
src/app/page.tsx                                wire ContinuePrompt
src/app/account/page.tsx                        Continue + soon: false
src/components/account/AccountNav.tsx           Progress link
src/components/reader/QuranReader.tsx           (or layout) mount tracker
src/lib/models/ProgressEvent.ts                 optional unique index
```

---

## Acceptance criteria

1. Guest: no progress network calls; M1–M3 unchanged.  
2. Signed-in: after meaningful surah visit (≥3s + focused ayah), `lastPosition` updates.  
3. Home/account show dismissible Continue → correct ayah deep link.  
4. Bounce &lt;3s does not mark surah viewed.  
5. `/account/progress` shows count/percentage + 114 grid reflecting viewed surahs.  
6. ProgressEvents upsert once per user/surah/UTC-day with expanding ayah range.  
7. APIs `401` without session; no cross-user data.  
8. Typecheck + lint clean; reader never blocked by progress failures.

---

## QA checklist (manual)

### Tracking
- [ ] Sign in → open surah → wait 3s+ → scroll → leave → lastPosition set  
- [ ] Bounce &lt;3s → surah not marked viewed  
- [ ] Two surahs same day → two grid cells  

### Continue
- [ ] Home shows Continue with correct label  
- [ ] Tap lands on ayah + highlight  
- [ ] Dismiss hides for session; new position shows again  

### Account
- [ ] Grid + % match viewed set  
- [ ] Empty state for new account  

### Regression
- [ ] Logged-out home/surah/audio/study unchanged  

---

## Suggested next action after plan approval

Implement **P0 → P1** (APIs + date helper) first, then **P2** (tracker), then **P3–P4** (Continue + account page), then **P5–P6** polish/regression.
