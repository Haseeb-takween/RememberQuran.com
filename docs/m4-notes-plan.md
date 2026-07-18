# M4 Phase 2 — Personal Notes Implementation Plan

**Status:** Plan only — do not implement until approved  
**Depends on:** Phase 0 (Auth.js, session helpers, soft-gate) + Phase 1 (bookmarks patterns) — **done**  
**Done when:** Logged-in user can create / edit / delete a plain-text note on any ayah, see a note indicator in the reader, and jump back from `/account/notes`  
**Sources:** Brief §3.4.3 · `docs/plan.md` §10.3 · `docs/m4-implementation-plan.md` §3.4.3 · existing `Note` model

---

## Goal

Let signed-in users attach **one private plain-text note per ayah**, edit it in a sheet/dialog from the reader, list all notes on an account page with deep links, and delete notes safely. Guests keep full reading access; note actions only soft-prompt sign-in.

**Hard constraints (must hold):**

1. **Zero regression on M1–M3** — reading, audio, study never require an account.
2. **Quran content never stored in our DB** — only `verseKey` + user `text`.
3. **Notes are private** — session `userId` only; never leak another user’s note existence.
4. **Plain text only** — no rich text, Markdown, or HTML rendering.
5. **Additive UX** — note UI does not block or clutter the reader for guests.

---

## Already in place (reuse, do not rebuild)

| Piece | Location | Notes |
|-------|----------|--------|
| `Note` model | `src/lib/models/Note.ts` | Unique `(userId, verseKey)`; `text` trim + max **10 000**; timestamps |
| `NOTE_TEXT_MAX_LENGTH` | same file | Export for client + API validation |
| Soft-gate reason `"note"` | `src/lib/auth/safe-next.ts` | Copy already: “Sign in to save notes” |
| Soft-gate UI | `SoftGateContext` + `SoftGateDialog` | Guest → dialog → login with `next` |
| Session guard | `getSessionUserId()` | Never trust client `userId` |
| Verse key parse/validate | `src/lib/quran/verse-key.ts` | Rejects junk / out-of-range ayahs |
| API response helper | `privateJson` | `Cache-Control: no-store` |
| Account hub card | `/account` | Notes card exists with `soon: true` |
| Verse URL | `/[surahId]/[ayahId]` | e.g. `/2/255` |
| Bookmark patterns | `BookmarksContext`, `BookmarkButton`, account APIs | Mirror auth, soft-gate, optimistic UX |

**Not built yet:** notes API, `NoteEditor`, reader note button, `/account/notes`, notes context/indicator.

---

## Product decisions (lock before coding)

| Decision | Choice | Why |
|----------|--------|-----|
| Notes per ayah | **Exactly one** per `(userId, verseKey)` | Unique index already; upsert mental model |
| Empty / whitespace save | **Treat as delete** | Model requires non-empty `text` after trim; empty = “clear this note” |
| Max length | **10 000 chars** (server + client) | Matches `NOTE_TEXT_MAX_LENGTH` |
| Editor surface | **Sheet / dialog** (`NoteEditor`) from ayah actions | Matches brief; keeps reader calm |
| Reader indicator | **Filled / accent notebook icon** when note exists | Same pattern as bookmark filled state |
| Guest UX | Soft-gate only — **no** hard redirect from reader | M4 rule |
| Autosave vs explicit Save | **Explicit Save** (+ optional Cmd/Ctrl+Enter) | Avoids surprise deletes on empty blur; clearer errors |
| Delete | Explicit **Delete** in editor + account list | Confirm on account page if note is long |
| Concurrent tabs | **Last write wins** by `updatedAt` | Optional conflict toast if client `updatedAt` mismatches response (v1.1) |
| Search / filter on account page | **v1.1** — ship chronological list first | Keep Phase 2 lean |
| Max notes per user | **2 000** soft cap | Same abuse bound as bookmarks |
| Surah/ayah validation | Server: `parseVerseKey` | Reject junk `verseKey` |
| XSS | Always render as **plain text** (`{text}` / `<pre>` / whitespace-pre-wrap) — never `dangerouslySetInnerHTML` | Security |
| Draft while offline / fail | Keep **local draft in editor state**; toast + Retry | Worst-case from M4 plan |
| Rich text / Markdown | **Out of scope** | Explicit M4 non-goal |

---

## Architecture

```
Reader (AyahBlock / optional More menu)
  └─ session? → open NoteEditor sheet
              → soft-gate if guest
  └─ NotesContext: Set of verseKeys that have notes (batch GET)

NoteEditor
  └─ GET one note for verseKey (or empty)
  └─ PUT upsert / DELETE clear
  └─ on success → refresh indicator + close (or stay open)

Account /notes
  └─ Server-load list (session user only)
  └─ Edit inline or open sheet; delete; jump to /[surah]/[ayah]

Auth: every API uses session.user.id; never trust client userId
```

**Rule:** All note queries filter by `userId` from the session. Ownership is implicit via that filter — never look up by `_id` alone without `userId`.

---

## Data model (already defined — do not change unless necessary)

```
Note {
  userId: ObjectId   // required, indexed with verseKey
  verseKey: string   // "2:255", max 16, trimmed
  text: string       // plain text, required, trimmed, max 10_000
  createdAt, updatedAt
}
unique index: (userId, verseKey)
```

**Upsert semantics:**

- `PUT` with non-empty trimmed text → create or overwrite.
- `PUT` / `POST` with empty trimmed text → **delete** the note (idempotent).
- `DELETE` by `verseKey` → remove if present; `204` / `200` even if already gone.

---

## API design

All routes: `runtime = "nodejs"`, `privateJson` / no-store, Auth.js session required → `401` if missing.

### Notes — `/api/account/notes`

| Method | Body / params | Behaviour |
|--------|---------------|-----------|
| `GET` | — | List user’s notes: `verseKey`, `text`, `updatedAt`, `createdAt`; sort `updatedAt` desc; limit 2000 |
| `GET` | `?surahId=2` | Reader batch: notes whose `verseKey` matches `^2:` — return keys (+ optional short preview) so icons render without N+1 |
| `GET` | `?verseKey=2:255` | Single note for editor; **404** if none (or `200` + `{ note: null }` — prefer **`200 { note: null }`** so missing ≠ error) |
| `PUT` | `{ verseKey, text, updatedAt? }` | Upsert if text non-empty after trim; if empty → delete; validate length ≤ 10 000; `parseVerseKey` or `400` |
| `DELETE` | `{ verseKey }` or `?verseKey=` | Remove note; ownership via session filter |

### Response shapes (suggested)

```ts
// GET list / surah batch
{ notes: Array<{ verseKey: string; text: string; updatedAt: string; createdAt: string }> }

// GET one
{ note: { verseKey: string; text: string; updatedAt: string; createdAt: string } | null }

// PUT upsert
{ note: { verseKey: string; text: string; updatedAt: string; createdAt: string } }

// PUT empty → delete / DELETE
{ deleted: true }
```

### Status codes

| Code | When |
|------|------|
| `200` | Success (including empty GET, idempotent DELETE) |
| `201` | Optional: first create on PUT (nice-to-have; `200` alone is fine) |
| `400` | Invalid `verseKey`, text not a string, over max length |
| `401` | No session |
| `404` | Only if looking up by foreign/invalid id patterns we choose not to use — prefer not leaking |
| `409` | Optional v1.1: client `updatedAt` older than DB (stale edit) |
| `429` | Rate limit if abuse appears |
| `500` | DB down — generic message; never dump stack |

### Shared helpers (reuse / thin wrappers)

- `getSessionUserId()` — existing  
- `parseVerseKey(input)` — existing  
- `normalizeNoteText(input)` → trimmed string or reject if not string  
- Cap check against `NOTE_TEXT_MAX_LENGTH`  

---

## UI / pages

### 1. Reader — note button + indicator

**Wire into:** `AyahBlock` meta row (next to `BookmarkButton`). Optional: same entry from “More options” later.

| State | UI |
|-------|-----|
| Guest | Notebook icon → soft-gate `requireAuth("note")` |
| Logged in, no note | Outline notebook icon → opens `NoteEditor` empty |
| Logged in, has note | Filled / primary notebook icon → opens editor with text |
| Editor open | Sheet/dialog; does not pause audio unless user leaves page |
| Save pending | Disable Save; keep textarea editable or read-only briefly |
| Save error | Toast; **draft stays in textarea** |
| Session expired mid-save | `401` → soft redirect to login with `next` = current ayah URL |

**Surah-level state:** On surah load (signed-in), `GET /api/account/notes?surahId=N` (or full key set like bookmarks if cheap) so every ayah icon is correct without N+1.

**Do not** block surah/ayah render on notes fetch — icons can appear after hydration.

### 2. `NoteEditor` component

**Location:** `src/components/account/NoteEditor.tsx` (or `src/components/reader/NoteEditor.tsx` if reader-owned)

| Element | Behaviour |
|---------|-----------|
| Header | Verse ref (`2:255`) + short surah name if already in reader context |
| Textarea | Plain text; `dir="auto"`; char count `n / 10000` |
| Save | Upsert; close on success (or keep open with “Saved” flash) |
| Delete | Visible only if note exists; confirm on mobile long notes optional |
| Cancel / Esc | Discard unsaved changes after confirm if dirty |
| Keyboard | `Cmd/Ctrl+Enter` = Save; `Esc` = close |

**Accessibility:** focus trap in dialog; labelled textarea; announce save success/errors to assistive tech if toast pattern already does.

### 3. Account — `/account/notes`

- Protected by existing `/account` auth layout  
- List sorted by `updatedAt` desc  
- Each row: verse key + optional surah name, **plain-text preview** (first ~120 chars), relative “Updated …”, link to `/[surah]/[ayah]`, Edit, Delete  
- Empty state: “No notes yet — tap the note icon while reading”  
- Loading: skeleton list  
- Error: “Couldn’t load notes” + Retry  
- Remove `soon: true` from account hub Notes card when page ships  

### 4. Account nav

- Add **Notes** to `AccountNav` (Overview · Bookmarks · Notes · Settings) when bookmarks nav is also updated consistently  

### 5. Client context (recommended)

Mirror bookmarks:

```
NotesProvider
  loaded: boolean
  hasNote(verseKey): boolean
  isPending(verseKey): boolean
  refresh(): Promise<void>
  // optional: getPreview(verseKey) for tooltips later
```

Load keys once per signed-in session (or per-surah batch). Clear on logout / user switch so the previous account’s indicators never flash.

---

## Build order (implementation steps)

| Step | Deliverable | Verify |
|------|-------------|--------|
| **N0** | Confirm model + `NOTE_TEXT_MAX_LENGTH`; shared `normalizeNoteText` if needed | Unit/manual: trim, empty, oversize |
| **N1** | `GET/PUT/DELETE /api/account/notes` (list, surah batch, single, upsert, empty→delete) | curl with session; cross-user impossible |
| **N2** | `NotesProvider` + hydrate indicators for current surah / all keys | Icons correct after login; clear on logout |
| **N3** | `NoteEditor` sheet + reader notebook button + soft-gate | Guest soft-gate; signed-in save/edit |
| **N4** | `/account/notes` page + delete/edit + deep links | Jump opens correct ayah |
| **N5** | Account hub `soon: false`; AccountNav Notes link; empty/loading/error | Logged-out reader unchanged |
| **N6** | Typecheck, lint, smoke mobile + desktop | Regression: M1–M3 still free |

---

## Best / worst / edge cases

### Happy path (best)

| Case | Behaviour |
|------|-----------|
| Create | Open editor on `2:255` → type text → Save → icon fills → note appears on `/account/notes` |
| Edit | Reopen → change text → Save → `updatedAt` refreshes; list reorders |
| Delete | Delete in editor or account → icon clears; list row gone |
| Jump back | Account row → `/2/255` lands on ayah (existing reader deep-link) |
| Guest later signs in | Soft-gate → login with `next` → same ayah → open note and save |

### Failure path (worst)

| Case | Behaviour |
|------|-----------|
| Mongo / API down on save | Toast error; **draft remains** in editor; Retry; reader still usable |
| Mongo down on account list | Error + Retry; never blank the whole app shell if layout already loaded |
| Auth service blip | `401` → login with safe `next`; no data loss of draft until navigation away (warn if dirty) |

### Auth & privacy edges

| Case | Behaviour |
|------|-----------|
| Guest taps note | Soft-gate `"note"` only — no hard wall |
| Session expired mid-save | `401`; prompt re-login; draft kept until page unload |
| Another user’s note | Impossible via API — all queries include session `userId`; never return `404` that reveals foreign `_id` existence |
| Suspended user | Cannot log in (Phase 0); no note APIs without session |
| Open redirect after soft-gate login | Existing `safeNextPath` allowlist only |

### Validation & content edges

| Case | Behaviour |
|------|-----------|
| Empty / whitespace Save | Treat as **delete** (idempotent if none) |
| Text over 10 000 | Client block + server `400`; do not truncate silently |
| Invalid `verseKey` (`999:1`, `2:9999`, `abc`, `02:1`) | `400` |
| Unicode / Arabic / emoji in note | Allowed; store as UTF-8 plain text |
| Newlines / multiple spaces | Preserve in storage; display with `whitespace-pre-wrap` |
| XSS / `<script>` in note | Escaped as text; never HTML |
| Paste huge clipboard | Cap at max length; show counter turning warning near limit |
| Only whitespace after trim | Same as empty → delete |

### Concurrency & multi-device

| Case | Behaviour |
|------|-----------|
| Two tabs editing same ayah | Last successful PUT wins; no merge |
| Optional stale guard (v1.1) | Client sends `updatedAt`; server `409` if DB newer → “Updated elsewhere — reload?” |
| Account delete while editor open | Next save recreates note (upsert) — acceptable |
| Rapid double-click Save | Disable button while pending; idempotent upsert |
| Logout in another tab | Context clears indicators; editor Save → `401` |

### Reader / UX edges

| Case | Behaviour |
|------|-----------|
| Notes fetch slow | Ayahs render immediately; icons fill when loaded |
| Audio playing while editing | Continue playing; do not steal focus from player bar unexpectedly |
| Mobile keyboard covers Save | Sheet scrolls; Save stays reachable (sticky footer in sheet) |
| Dirty close (X / backdrop) | Confirm “Discard unsaved note?” |
| Surah with 286 ayahs | Prefer `?surahId=` batch or one full key-set like bookmarks — never per-ayah GET |
| Note icon vs bookmark icon | Distinct lucide icons (`NotebookPen` vs `Bookmark`); clear titles/aria-labels |
| “More options” unused | Phase 2 may leave More as-is; note gets its own button for discoverability |

### Account list edges

| Case | Behaviour |
|------|-----------|
| Zero notes | Friendly empty state + CTA to read |
| Very long note in list | Truncate preview; full text only in editor |
| Huge list (near 2000) | Cap at 2000; optional pagination later |
| Delete confirm | Confirm dialog when `text.length > 200` or always (pick always for safety) |
| Deep link ayah missing | Reader already handles invalid routes; no special note logic |

### Security & abuse

| Case | Behaviour |
|------|-----------|
| Never accept `userId` from body | Session only |
| Never return other users’ notes | Filter every query |
| Rate-limit PUTs lightly | Same spirit as auth / bookmarks if needed |
| No public note URLs | `/account/notes` only; no share-by-link in M4 |
| Log PII carefully | Do not log full note bodies in production logs |

---

## Security & privacy checklist

- [ ] Session `userId` on every read/write  
- [ ] `parseVerseKey` before any write  
- [ ] Length cap server-side (client can lie)  
- [ ] Plain-text render only  
- [ ] Soft-gate for guests; account pages auth-gated  
- [ ] No note content in analytics events without explicit product decision  

---

## Out of scope (this phase)

- Progress, streaks/goals, media maker  
- Rich text / Markdown / attachments / voice notes  
- Shared or public notes / comments  
- Guest notes in `localStorage`  
- Full-text search / tags / folders for notes  
- Auto-open editor after soft-gate login with pending draft (nice-to-have later)  
- Conflict UI beyond last-write-wins (v1.1)  

---

## File checklist (expected touch list)

```
src/app/api/account/notes/route.ts          NEW — GET/PUT/DELETE
src/context/NotesContext.tsx                NEW — key set + refresh
src/components/reader/NoteButton.tsx        NEW — icon + soft-gate + open editor
src/components/account/NoteEditor.tsx       NEW — sheet/dialog form
src/components/account/NotesView.tsx        NEW — account list UI
src/app/account/notes/page.tsx              NEW
src/components/reader/AyahBlock.tsx         wire NoteButton
src/components/providers.tsx                NotesProvider
src/components/account/AccountNav.tsx       add Notes link
src/app/account/page.tsx                    soon: false for Notes
src/lib/models/Note.ts                      reuse (no change unless bug)
src/lib/quran/verse-key.ts                  reuse
src/lib/auth/session.ts                     reuse
```

Optional small helper:

```
src/lib/notes/text.ts                       normalizeNoteText + constants re-export
```

---

## Acceptance criteria

1. Guest: note icon opens soft-gate; Quran reading/audio/study unaffected.  
2. Signed-in: can create a plain-text note on an ayah; icon shows note exists.  
3. Can edit and save; can delete (editor + account list).  
4. Empty/whitespace save removes the note.  
5. Text over 10 000 rejected client + server.  
6. `/account/notes` lists notes with working deep links to `/[surah]/[ayah]`.  
7. Notes never visible to another account; APIs `401` without session.  
8. Note text always rendered as plain text (no HTML).  
9. Save failure keeps draft and does not break the reader.  
10. Typecheck + lint clean; no regression on public reader (M1–M3).

---

## QA checklist (manual)

### Auth
- [ ] Guest note → soft-gate → login → return to ayah  
- [ ] Logged-out `/account/notes` → redirect login  
- [ ] Two accounts: A’s notes never appear for B  

### CRUD
- [ ] Create, edit, delete from reader  
- [ ] Empty save deletes  
- [ ] Over-limit blocked  
- [ ] Invalid verse rejected if API called directly  

### Reader
- [ ] Indicator correct after reload  
- [ ] Indicator clears after delete  
- [ ] Audio + study still work with editor open/closed  

### Account
- [ ] List order by recent update  
- [ ] Jump link correct  
- [ ] Empty / error / loading states  

### Regression
- [ ] Logged-out home, surah read, audio, tafsir/search unchanged  

---

## Suggested next action after plan approval

Implement **N0 → N1** (API) first, then **N2–N3** (context + reader editor), then **N4–N5** (account page + hub), then **N6** regression smoke.
