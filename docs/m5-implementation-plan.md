# Milestone 5 — Expansion: Implementation Plan

**Status:** Phases 0–5 implemented — Phase 6 (live regression + README) remaining  
**Depends on:** M1–M4 complete (reading, audio, study, accounts)  
**Done when:** All verified QDC chapter reciters in registry (see Phase 0 gap vs brief “20+”), 10+ translations, 5+ tafsir books, memorisation tools (hide mode, memorisation repeat, hifz tracker), searchable pickers, and a full M1–M4 regression pass on the live domain  
**Sources:** Brief §3.5 · `docs/plan.md` §11 · `docs/audio-sources.md` · `docs/m5-resource-ids.md` · existing registries in `audioSources.ts`, `quranApi.ts`, `studyApi.ts`  
**Last updated:** 2026-07-22

---

## Build log — simple summary (non-tech)

What we added in Milestone 5, in plain language.

### Phase 0 — Check what is available ✅

Before building, we checked which reciters, translations, and tafsirs actually work online.

- Found about **14–15** working reciters (not 20+, because the free public list is limited)
- Chose **10 translations** and **5 tafsir books** that work
- Decided: people can show up to **3 translations** at once

### Phase 1 — More reciters ✅

Users can now pick from many more Quran reciters (not just 2).

- Search by name to find a reciter quickly
- Works in the player, radio page, and settings
- If a reciter does not support word-by-word highlight, audio still plays normally

### Phase 2 — More translations ✅

Users can choose from **10 translations** (English + Urdu, and more).

- Pick up to 3 at the same time
- Or hide translations and read Arabic only
- Urdu shows right-to-left correctly

### Phase 3 — More tafsir ✅

Users can switch between **5 tafsir books** (explanations of the ayah).

- English and Arabic books included
- Change book from the study panel or settings
- Ibn Kathir stays the default

### Phase 4 — Memorisation helpers ✅

Tools to help learn by heart — **no login needed**.

- **Hide Arabic:** blur the Arabic text, tap to peek, hide again
- **Repeat:** replay one ayah or a short range (e.g. ×3, ×5), with an optional pause between repeats

### Phase 5 — Hifz tracker ✅

Signed-in users can mark which ayahs they have memorised.

- Brain icon on each ayah to mark / unmark
- Guests are asked to sign in (nothing is saved without an account)
- Account → **Hifz** page shows progress by **surah** and by **juz**

### Phase 6 — Final check ⬜

Still to do: full test on the live website, update README, and write submission notes.

---

## Context

M1–M4 shipped a complete product: reading, audio (2 reciters), study (1 tafsir), accounts, and Media Maker. M5 **validates the architecture** — expansion should be **registry entries + small UI upgrades + memorisation features**, not new backend systems.

**Today (M4 end state):**

| Area | Current |
|------|---------|
| Reciters | 2 in `RECITERS` (Alafasy 7, Sudais 3) — both `hasWordTiming: true` |
| Reciter UI | Plain list in `ReciterSelector` / `RadioPanel` |
| Translations | 2 — Saheeh Int'l (20) + Clear Quran (131, CDN merge) |
| Translation UI | Fixed modes in `TranslationSelector` (none / one / both) |
| Tafsir | 1 book — Ibn Kathir (`en-tafisr-ibn-kathir`) |
| Memorisation | None |
| Progress | `ProgressEvent` stream + goals/streaks (M4) — ready for hifz |

**Hard constraints:**

1. **Zero regression on M1–M4** — especially audio word-sync for existing timed reciters.
2. **Quran text never in Mongo** — only user hifz flags / progress events.
3. **Honest capabilities** — `hasWordTiming: false` when segments missing; never fake sync.
4. **Verify every resource ID live** — never hardcode from memory (`/resources/translations`, `/resources/tafsirs`, QDC reciters list).
5. **Guests keep full reading/audio/study** — hifz tracker is soft-gated like bookmarks.

---

## Guiding principles

| Principle | Meaning |
|-----------|---------|
| Data, not code | Reciters / translations / tafsirs are registry rows |
| Picker upgrade once | Searchable list/combobox reused across audio, settings, study |
| RTL-ready translations | Urdu / Arabic meaning blocks use `dir="rtl"` |
| Soft-gate hifz | Guests can try hide/repeat; persist memorised state only when signed in |
| Document gaps | Each reciter without segments listed in `docs/audio-sources.md` + submission |

---

## Goals (acceptance)

1. **All verified QDC chapter reciters** in `RECITERS` (Phase 0: ~13–14 timed; brief “20+” blocked on public API — see `m5-resource-ids.md`).
2. **≥ 10 translations** selectable (grouped by language), including at least one RTL language.
3. **≥ 5 tafsir books** in `TAFSIR_RESOURCES`, switchable in Study Panel.
4. **Hide mode** — blur/hide Arabic on selected ayahs; tap to reveal.
5. **Memorisation repeat** — presets over M2 range-repeat + pause between repetitions.
6. **Hifz tracker** — mark ayahs memorised; views by surah and by juz (signed-in).
7. **Regression** — full M1–M4 checklist on rememberquran.com; new reciters do not break Alafasy/Sudais sync.

---

## Phase overview

| Phase | Focus | Rough order |
|-------|--------|-------------|
| **0** | Research & registries (verify IDs, segment coverage) | First |
| **1** | Reciters → verified QDC set + searchable reciter picker | |
| **2** | Translations → 10+ + grouped selector + RTL | |
| **3** | Tafsir → 5+ books | |
| **4** | Memorisation: hide mode + repeat presets | |
| **5** | Hifz tracker (model + API + UI) | |
| **6** | Regression, docs, submission | Last |

Phases 1–3 are mostly parallel after Phase 0. Phase 5 depends on auth/progress patterns from M4.

---

## Phase 0 — Research & inventory ✅

**Done 2026-07-22.** Deliverable: [`docs/m5-resource-ids.md`](./m5-resource-ids.md) + raw [`docs/m5-resource-ids.json`](./m5-resource-ids.json). Re-run: `pnpm m5:inventory`.

### Reciters (live)

- QDC list = **14** timed chapter reciters; plus id **8** (Minshawi Mujawwad) via direct `audio_files`.
- Brief names like Ghamdi / Muaiqly / Baleela are **not** on the public QDC chapter list today.
- Id **11** (V4 “Tablawi”) has audio but **no** segments and a mismatched CDN path — exclude.
- **Gap:** cannot honestly claim 20+ from public QDC alone — Phase 1 ships all verified timed ids (~13–14); escalate or Foundation API later.

### Translations (live)

Recommended set (10): **20, 131 (CDN), 85, 19, 22, 84, 203, 95, 149, 54 (Urdu RTL)**.

### Tafsirs (live)

Only **3** English QDC books with HTML on 2:255. Phase 3 minimum: those three + `ar-tafseer-al-saddi` + `ar-tafsir-muyassar` (= 5).

### Product defaults from Phase 0

- Max simultaneous translations in UI: **cap 3**.
- Hide mode: **per-ayah** first.

---

## Phase 1 — Reciters (verified QDC set) ✅

### Code

- Expand `RECITERS` in `src/lib/audioSources.ts`.
- Ensure `getReciter` / default fallback still safe for stale localStorage ids.
- Upgrade **ReciterSelector** (player bar) and **RadioPanel** to a **searchable combobox** (reuse Base UI `Combobox` pattern from Surah picker) — name, Arabic name, optional “word sync” badge.
- No change to `audioApi` / `wordSync` if segment sanitisation already handles empty segments (verify: reciters with `hasWordTiming: false` play chapter audio without word highlight).

### Edge cases

| Case | Behaviour |
|------|-----------|
| Reciter without segments | Play audio; hide or disable word-highlight UI; no crash |
| Switch mid-surah | Same verse position with new voice (existing M2 behaviour) |
| Stale id in storage | Fall back to `DEFAULT_RECITER_ID` |
| Radio + large list | Combobox filter; keyboard accessible |

### Done when

- [x] All Phase 0 recommended timed ids in `RECITERS` (see `m5-resource-ids.md`)
- [x] Searchable picker in player + radio
- [ ] Alafasy + Sudais sync still correct on 1:1–1:7 and a timed ayah in Al-Baqarah
- [x] `docs/audio-sources.md` stays in sync with registry

---

## Phase 2 — Translations (10+) ✅

### Code

- Expand translation registry (prefer a small `src/lib/translations.ts` if `quranApi.ts` grows too large): `{ id, name, language, direction: 'ltr'|'rtl', source: 'api'|'cdn' }`.
- Update `getVerses` / `getVerseByKey` to request all **API** ids; keep Clear Quran merge path.
- Replace fixed three-mode `TranslationSelector` with:
  - Toggle list (multi-select) or grouped combobox by language
  - “Arabic only” still available (empty active set / `showTranslation: false`)
- **Render:** `AyahBlock` / translation blocks set `dir={rtl}` and appropriate `lang` for RTL entries.
- **Settings migration:** accept any registered id; drop unknown ids; default remains Saheeh + Clear Quran.

### Edge cases

| Case | Behaviour |
|------|-----------|
| Many translations selected | Cap at **3** (Phase 0 default) |
| Long verse payload | Only request selected ids (already array-driven) |
| Clear Quran + API mix | Merge unchanged |
| RTL + LTR together | Each block has its own `dir` |

### Done when

- [x] ≥ 10 translations available
- [x] Grouped/searchable selector
- [x] At least one RTL translation renders correctly
- [ ] Copy/share still works with active translations

---

## Phase 3 — Tafsir (5+) ✅

### Code

- Append verified books to `TAFSIR_RESOURCES`.
- Study Panel book switcher (M3 already prepared) — ensure searchable if list is long.
- Sanitize HTML path unchanged (server allowlist already covers future books).

### Edge cases

| Case | Behaviour |
|------|-----------|
| Book missing ayah | Empty state, not error page |
| Invalid slug | 400 from API route (registry allowlist) |

### Done when

- [x] ≥ 5 books
- [x] Switcher works; Ibn Kathir still default
- [ ] Spot-check HTML on 2:255 for each book

---

## Phase 4 — Memorisation tools (frontend-first) ✅

### 4a — Hide mode

- Reader setting or study toolbar: “Hide Arabic” / “Memorise mode”.
- Per-ayah or selection: blur/mask Arabic (`AyahBlock`); tap/click reveals until blur again or leave mode.
- Pure client state (Context or local component state); no API required.
- Must not break word tooltips when revealed; when hidden, suppress hover meanings or show after reveal.

### 4b — Memorisation repeat

- UI presets on existing repeat machinery: e.g. “ayah ×3”, “ayah ×5”, “range ×3”.
- Add **pause between repetitions** (ms) to audio player / store — small extension to M2 repeat.
- Document interaction with speed and reciter switch (regression checklist).

### Done when

- [x] Hide/reveal works on mobile and desktop
- [x] Repeat presets + inter-repeat pause work with Alafasy
- [x] No account required for 4a/4b

---

## Phase 5 — Hifz tracker (signed-in) ✅

### Data model

**Option A (preferred):** `MemorisedAyah` collection

| Field | Purpose |
|-------|---------|
| `userId` | Owner |
| `verseKey` | `"2:255"` |
| `surahId`, `ayahId` | Indexed queries |
| `memorisedAt` | Timestamp |

Indexes: unique `(userId, verseKey)`; `(userId, surahId)`.

**Option B:** flags on `ProgressEvent` — avoid if it muddies reading vs hifz semantics.

### API / UI

- `GET/POST/DELETE /api/account/hifz` (or nested under progress) — session-gated.
- Soft-gate: guest taps “Mark memorised” → sign-in prompt (same pattern as bookmarks).
- Surah reader: badge/toggle on ayah.
- Account section: **Hifz** page — progress by surah (% of ayahs) and by **juz** (static juz map from API or `src/data/juz.json`).
- Reuse soft-gate + account layout patterns from M4.

### Edge cases

| Case | Behaviour |
|------|-----------|
| Guest | Soft-gate; no silent local-only persistence that diverges later |
| Unmark | Delete row; UI updates |
| Juz boundaries | Use verified static map; test juz 1 and juz 30 |

### Done when

- [x] Mark/unmark persists for signed-in users
- [x] Surah + juz overview pages
- [x] Logged-out reading unchanged

---

## Phase 6 — Regression, docs, handoff

1. Append M5 checks to `docs/regression-checklist.md`.
2. Run full checklist on **https://rememberquran.com**.
3. Update `README.md` M5 status → Complete when done; refresh data-sources / structure if needed.
4. Update `docs/audio-sources.md` and translation/tafsir notes.
5. Submission template (`docs/plan.md` §14): sources, limitations (untimed reciters), test steps for Hafiz Saad.
6. Optional: start drafting M6 product-thinking answers while M5 is fresh.

---

## Out of scope (defer)

| Item | Where |
|------|--------|
| Remotion / video Media Maker | M6 stretch or later (M4 image already meets brief) |
| Community / social features | Never in M5 (User fields reserved only) |
| 20+ translations or every language | Cap at ≥10 for M5 |
| Credentialed Quran Foundation API migration | Only if open APIs break |
| Full spaced-repetition / Anki-style scheduling | Future; hifz mark is enough for M5 |

---

## Risk register

| Risk | Mitigation |
|------|------------|
| Reciter IDs wrong / 404 audio | Phase 0 live verify; CI or script that hits chapter 1 for each id |
| Segment-less reciter breaks sync UI | Branch on `hasWordTiming`; skip highlight loop |
| Translation selector allows Clear Quran id to API | Keep CDN filter in `quranApi` |
| Payload bloat with many translations | Request only active ids |
| Hide mode + tajweed + word-sync fight | Test combinations; hide masks whole ayah layer |
| Hifz duplicates ProgressEvent confusion | Separate collection + clear copy in UI |

---

## Suggested file map (new / touched)

```
src/lib/audioSources.ts          # RECITERS (verified QDC set)
src/lib/translations.ts          # optional registry extract
src/lib/quranApi.ts              # multi-id fetch + RTL metadata
src/lib/studyApi.ts              # TAFSIR_RESOURCES 5+
src/components/audio/*           # searchable ReciterSelector, RadioPanel
src/components/reader/*          # TranslationSelector, AyahBlock dir, HideMode
src/components/study/*           # tafsir switcher
src/components/memorisation/*    # HideModeControls, HifzToggle (new)
src/app/account/hifz/            # overview (new)
src/app/api/account/hifz/        # CRUD (new)
src/lib/models/MemorisedAyah.ts  # new
docs/m5-resource-ids.md          # Phase 0 allowlist
docs/m5-resource-ids.json        # Phase 0 raw inventory
scripts/m5-phase0-inventory.mjs  # re-verify
docs/audio-sources.md            # M5 table
docs/regression-checklist.md     # append M5
docs/m5-implementation-plan.md   # this file
```

---

## Implementation order (when approved)

1. ~~Phase 0 resource verification~~ ✅ (`pnpm m5:inventory`, `docs/m5-resource-ids.md`)  
2. ~~Reciters registry + combobox pickers~~ ✅  
3. ~~Translations registry + selector + RTL~~ ✅  
4. ~~Tafsir registry~~ ✅  
5. ~~Memorisation hide + repeat presets~~ ✅  
6. ~~Hifz model + API + UI~~ ✅  
7. Regression + README + submission  

---

## How to test (draft for QA)

1. Open live site logged out — read, play Alafasy with word sync, search, tafsir.  
2. Open reciter picker — search “Minshawi” (or another added name); play without sync if unmarked.  
3. Switch translations — enable Yusuf Ali + Urdu; confirm RTL block.  
4. Study panel — switch tafsir book on 2:255.  
5. Enable hide mode — Arabic blurred; tap to reveal.  
6. Memorisation repeat — ayah ×3 with pause.  
7. Sign in — mark 1:1–1:7 memorised; check Hifz / juz view.  
8. Sign out — confirm no account walls on M1–M3 paths.

---

## Open questions

1. ~~Exact list of 20 recitation IDs~~ → **Resolved:** public QDC ≈ 14–15 timed; see `m5-resource-ids.md`. Accept “all verified” or add Foundation API.  
2. ~~Translation IDs~~ → **Resolved:** 20, 131, 85, 19, 22, 84, 203, 95, 149, 54.  
3. ~~English tafsirs~~ → **Resolved:** 3 EN + 2 AR for ≥5.  
4. ~~Max simultaneous translations~~ → **Resolved:** cap **3**.  
5. ~~Hide mode scope~~ → **Resolved:** per-ayah first.
