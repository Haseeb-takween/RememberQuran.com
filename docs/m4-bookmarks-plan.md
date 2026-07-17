# M4 Phase 1 — Bookmarks Implementation Plan

**Status:** Plan only — do not implement until approved  
**Depends on:** Phase 0 (Auth.js, User, Bookmark + BookmarkCollection models, soft-gate) — **done**  
**Done when:** Logged-in user can bookmark an ayah, organise collections, and jump back from `/account/bookmarks`

---

## Goal

Let signed-in users save any ayah into folders (collections), manage those folders, and reopen each ayah from an account page. Guests keep full reading access; bookmark only soft-prompts sign-in.

---

## Already in place (reuse, do not rebuild)

| Piece | Location | Notes |
|-------|----------|--------|
| `Bookmark` model | `src/lib/models/Bookmark.ts` | Unique `(userId, verseKey)` — one bookmark per ayah per user |
| `BookmarkCollection` model | `src/lib/models/BookmarkCollection.ts` | Unique `(userId, name)`; `isDefault` for Favourites |
| Favourites seed | Register API | Creates default collection on signup |
| Soft-gate | `SoftGateContext` + `AyahBlock` / `ReaderControls` | Guest click → “Sign in to save bookmarks” |
| Account hub link | `/account` | Bookmarks card exists with `soon: true` |
| Verse URL | `/[surahId]/[ayahId]` | e.g. `/2/255` |
| Verse key format | `"surah:ayah"` | e.g. `"2:255"` — match model `verseKey` |

---

## Product decisions (lock before coding)

| Decision | Choice | Why |
|----------|--------|-----|
| Same ayah, second click | **Toggle off** (remove bookmark) | Matches unique index; simple mental model |
| Default collection | **Favourites** | Already seeded; cannot delete |
| Pick collection on save | **Optional picker** — default Favourites; long-press / menu to choose later if needed | Ship fast; picker can be v1.1 |
| Delete collection with bookmarks | **Move bookmarks into Favourites**, then delete folder | Safer than mass-delete |
| Duplicate collection names | **Reject** (unique index already) | Clear error |
| Empty / whitespace name | **Reject** | Server + client trim |
| Max collections per user | **50** | Prevent abuse |
| Max bookmarks per user | **2 000** (soft cap) | Paginate account page if needed |
| Surah/ayah validation | Server: surah `1–114`, ayah in that surah’s range | Reject junk `verseKey` |
| Reader UX while saving | Optimistic filled icon; revert + toast on failure | Never block reading |
| Guest UX | Soft-gate only — **no** hard redirect from reader | M4 rule |

---

## Architecture

```
Reader (AyahBlock / ReaderControls)
  └─ session? → POST/DELETE /api/account/bookmarks
              → soft-gate if guest

Account /bookmarks
  └─ GET collections + bookmarks (server)
  └─ CRUD collections via /api/account/collections
  └─ Move / remove bookmark via /api/account/bookmarks

Auth: every API uses session.user.id; never trust client userId
```

**Rule:** All bookmark/collection queries filter by `userId` from the session. Ownership checks on every mutate.

---

## API design

All routes: `runtime = "nodejs"`, `Cache-Control: no-store`, Auth.js session required → `401` if missing.

### Collections — `/api/account/collections`

| Method | Body / params | Behaviour |
|--------|---------------|-----------|
| `GET` | — | List user’s collections + bookmark counts |
| `POST` | `{ name }` | Create custom collection |
| `PATCH` | `{ id, name }` | Rename (not empty; unique per user) |
| `DELETE` | `{ id }` | Forbidden if `isDefault`; else move bookmarks → Favourites, then delete |

### Bookmarks — `/api/account/bookmarks`

| Method | Body / params | Behaviour |
|--------|---------------|-----------|
| `GET` | `?collectionId=` optional | List bookmarks (optionally one folder); include `verseKey`, `collectionId`, `createdAt` |
| `POST` | `{ verseKey, collectionId? }` | Upsert bookmark; default collection = Favourites if omitted; `201` or `200` if already same |
| `PATCH` | `{ verseKey, collectionId }` | Move bookmark to another of **this user’s** collections |
| `DELETE` | `{ verseKey }` or `?verseKey=` | Remove bookmark |

### Shared helpers (new)

- `requireSessionUser()` → `{ userId }` or 401 response  
- `parseVerseKey(input)` → `{ surahId, ayahId }` or error  
- `assertAyahInSurah(surahId, ayahId)` using existing surah metadata  
- `getOrCreateFavourites(userId)` — safety net if seed missing  

---

## UI / pages

### 1. Reader — bookmark button (wire existing)

**Files:** `AyahBlock.tsx`, `ReaderControls.tsx` (and small `BookmarkButton` if extracted)

| State | UI |
|-------|-----|
| Guest | Soft-gate (already) |
| Logged in, not bookmarked | Outline bookmark icon |
| Logged in, bookmarked | Filled / primary icon |
| Pending | Disabled briefly or spinner on icon only |
| Error | Toast / inline; keep reading |

**Surah-level state:** On surah load, `GET /api/account/bookmarks` for current surah’s verse keys (or one batch for the surah) so icons show correctly without N+1.

Optional v1.1: small popover “Save to…” collection list.

### 2. Account — `/account/bookmarks`

- Auth layout already protects `/account/*`
- Group by collection (Favourites first)
- Each row: Arabic ref (`2:255` + surah name if cheap), link to `/2/255`, remove action
- Collection toolbar: create, rename, delete (with confirm for non-empty → move to Favourites)
- Empty state: “No bookmarks yet — tap the bookmark icon while reading”
- Remove `soon: true` from account hub Bookmarks card when page ships

### 3. Account nav

- Add **Bookmarks** to `AccountNav` next to Overview / Settings

---

## Build order (implementation steps)

| Step | Deliverable | Verify |
|------|-------------|--------|
| **B0** | Helpers: session guard, verseKey parse/validate, Favourites fallback | Unit/manual on bad keys |
| **B1** | Collections API (CRUD + move-on-delete) | curl with session cookie |
| **B2** | Bookmarks API (list / add / move / remove) | Duplicate → no second row; toggle delete works |
| **B3** | Reader `BookmarkButton` wired to API + filled state | Guest soft-gate; signed-in toggle |
| **B4** | `/account/bookmarks` page + collection manage UI | Jump link opens correct ayah |
| **B5** | Account hub + nav polish; loading/empty/error | Logged-out reader unchanged |
| **B6** | Typecheck, lint, smoke on mobile + desktop | Regression: M1–M3 still free |

---

## Best / worst / edge cases

| Case | Behaviour |
|------|-----------|
| **Best** | Bookmark → Favourites; create “Memorisation”; move ayah; open from account → lands on ayah |
| **Worst** | DB/API fail — toast error; reader stays usable; account page shows retry |
| Guest clicks bookmark | Soft-gate; after login, return to same ayah (`next` URL) |
| Bookmark same ayah twice | Unique index; treat as already saved (idempotent POST) |
| Toggle remove | DELETE by `verseKey`; icon clears |
| Delete Favourites | `403` / clear error — not allowed |
| Delete custom folder with items | Confirm → move all to Favourites → delete folder |
| Rename to existing name | `409` conflict |
| Invalid `verseKey` (`999:1`, `2:9999`, `abc`) | `400` |
| Bookmark for another user’s collectionId | `403` / `404` — ownership check |
| Session expired mid-save | `401` → soft redirect to login with `next` |
| User missing Favourites (legacy) | `getOrCreateFavourites` on first bookmark |
| Huge list | Page by collection; optional limit 100/page later |
| Concurrent tabs | Unique index prevents dupes; last move wins |
| Soft-gate after login | Land back on ayah; user can bookmark in one more tap (v1.1: auto-save pending verse later) |

---

## Security & privacy

- Never return another user’s bookmarks
- Never accept `userId` from the client body
- Validate `collectionId` belongs to session user on every write
- Rate-limit mutations lightly if abuse appears (same pattern as auth routes)
- No public bookmark URLs — account pages only

---

## Out of scope (this phase)

- Notes, progress, streaks, media maker  
- Sharing bookmarks publicly / social  
- Syncing bookmarks to `localStorage` for guests  
- Auto-bookmark after soft-gate login (nice-to-have later)  
- Rich collection covers / colours  

---

## File checklist (expected touch list)

```
src/lib/auth/session.ts              (or extend existing helper)
src/lib/quran/verse-key.ts           parse + validate
src/app/api/account/collections/route.ts
src/app/api/account/bookmarks/route.ts
src/components/reader/BookmarkButton.tsx
src/components/reader/AyahBlock.tsx   wire button
src/components/reader/ReaderControls.tsx
src/app/account/bookmarks/page.tsx
src/components/account/BookmarksView.tsx
src/components/account/AccountNav.tsx
src/app/account/page.tsx             soon: false for bookmarks
```

---

## Acceptance criteria

1. Guest: bookmark opens soft-gate; Quran reading unaffected.  
2. Signed-in: one click saves to Favourites; icon shows saved; second click removes.  
3. User can create / rename / delete custom collections (not Favourites).  
4. Deleting a non-empty collection moves items to Favourites.  
5. `/account/bookmarks` lists by folder with working deep links to `/[surah]/[ayah]`.  
6. All APIs 401 without session; no cross-user data.  
7. Typecheck + lint clean; no regression on public reader.

---

## Suggested next action after plan approval

Implement **B0 → B2** (APIs) first, then **B3** (reader button), then **B4** (account page).
`)
