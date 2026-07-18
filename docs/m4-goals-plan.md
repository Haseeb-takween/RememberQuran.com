# M4 Phase 4 — Goals & Streaks Implementation Plan

**Status:** Implemented  
**Depends on:** Phase 3 Progress (`ProgressEvent`, UTC day helpers) — **done**  
**Done when:** Signed-in user can set one active daily goal (ayahs or pages), see today’s progress vs target, and see current + longest streak with a simple week strip  
**Sources:** Brief §3.4.5 · `docs/m4-implementation-plan.md` §3.4.5 · `Goal` + `StreakState` models

---

## Goal

Let signed-in users set a simple daily reading goal and keep a streak when they meet it. Guests unchanged. ProgressEvents from Phase 3 power “today’s count.”

**Hard constraints:**

1. Zero regression on M1–M3 / guest path  
2. Session `userId` only  
3. UTC calendar days (same as progress)  
4. No Mongoose in client bundles  
5. One active goal per user  

---

## Locked decisions

| Decision | Choice |
|----------|--------|
| Goal types | `ayahs` \| `pages` |
| Page size | **15 ayahs = 1 page** (deterministic Mushaf-ish approx) |
| Active goals | Exactly **one** active (model partial unique index) |
| Today’s count | Sum `(toAyah - fromAyah + 1)` over today’s ProgressEvents |
| Meet once/day | If already met today, streak unchanged |
| Miss a day | On next eval: if `lastMetDate` &lt; yesterday UTC and today not met → `currentStreak = 0` |
| Meet after gap | `currentStreak = 1` |
| Meet consecutive | `currentStreak += 1`; update `longestStreak` |
| Change goal mid-day | New target applies immediately for today; don’t rewrite past streak days |
| Delete / clear goal | Deactivate; streak state kept but UI shows CTA to set goal |
| Soft-gate | Account-only; no reader soft-gate required |

---

## Architecture

```
ProgressEvent PUT (already)
  └─ after upsert → evaluateGoalAndStreak(userId)

GET/PUT/DELETE /api/account/goals
  └─ goal CRUD + today progress + streak snapshot

/account/goals
  └─ GoalSettings form + StreakDisplay (week dots)
```

---

## APIs

### `/api/account/goals`

| Method | Behaviour |
|--------|-----------|
| `GET` | Active goal (or null), todayCount, todayTarget met?, streak, weekMet flags |
| `PUT` | Upsert active goal `{ type, target }` — deactivate others / replace active |
| `DELETE` | Deactivate active goal |

### Shared server helper

`evaluateGoalAndStreak(userId)` — compute today’s ayahs from events, convert if pages, update StreakState.

Call from: progress events PUT + goals GET (lazy catch-up for missed days).

---

## UI

- `/account/goals` — set type + target, show today X/Y, streak count, 7-day dots  
- Account hub `soon: false` + AccountNav Goals link  

---

## Build steps

G0 plan → G1 helpers/APIs → G2 page UI → G3 wire eval on events + hub → G4 typecheck
