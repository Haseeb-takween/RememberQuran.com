# RememberQuran.com — Master Implementation Plan

**Project**: Free, public-benefit Quran platform (sadaqah jariyah) — Brief 9, Takween Centre UK Ltd
**Developer**: Haseeb Sajjad
**Stack**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · pnpm
**Domain**: RememberQuran.com (hosting access provided)
**Delivery**: 6 milestones, each QA'd on the live domain before the next begins
**Last updated**: 2026-07-09

---

## 1. Guiding Principles (from the brief — read before every milestone)

1. **Architecture decisions in M1 affect everything.** Every component built in M1 is extended in M2–M5 — design for extension, not just for the current milestone.
2. **Regression rule**: before marking any milestone ready for QA, verify every previous milestone's features still work. New work must never break existing work.
3. **Continuous deployment is mandatory**: push to RememberQuran.com regularly *during* every milestone — the live domain must reflect ongoing progress, not just finished milestones. QA tests **only** on the live domain, never local/staging.
4. **Quran content is never stored in our database** — always fetched from the API (keeps data current and accurate). Our database (from M4) holds *user data only*.
5. **Respectful, minimal design** — no ads, no pop-ups, no commercial aesthetics. Typography-first.
6. **Do not over-engineer audio** — HTML5 audio or a lightweight library.
7. **This platform only** — the Hadith platform is a separate future project with a separate codebase. Do not build for both.

---

## 2. Tech Stack (full project)

| Concern | Choice | Introduced in | Reason |
|---|---|---|---|
| Framework | Next.js 16 App Router | M1 (scaffolded) | Brief recommends it; Quran.com's open-source frontend is Next.js — reference architecture available |
| Language | TypeScript | M1 | Type safety across complex API shapes (verses, words, segments, timings) |
| Styling | Tailwind CSS v4 | M1 | Already installed; strong RTL and responsive support |
| Global reader prefs | React Context + `localStorage` | M1 | Theme, font size, display mode, translations — no external lib needed |
| Audio state | Zustand (small store) or dedicated Context | M2 | Playback state crosses the whole page tree (mini player + word highlights + reader); a small store is cleaner than prop-drilling. Decide at M2 start — Context may still suffice |
| Audio playback | Single HTML5 `<audio>` element wrapped in a hook | M2 | Brief explicitly says don't over-engineer; `playbackRate` gives speed control free |
| Database | MongoDB (Atlas) + Mongoose | M4 | Brief suggests MongoDB; Atlas free tier is fine to start |
| Auth | Auth.js (NextAuth v5) — credentials provider + bcrypt | M4 | Email/password per brief; Auth.js integrates natively with Next.js App Router |
| Password-reset email | Resend (or Nodemailer + SMTP from hosting) | M4 | Simple transactional email for reset links |
| Ayah image generation (Media Maker) | `@vercel/og` (satori) server-side, or client canvas via `html-to-image` | M4 | Server-side gives consistent output across devices; decide at M4 with a quick spike |
| Ayah video generation (optional stretch) | Remotion — `@remotion/player` for in-browser preview; Remotion Lambda or a small render server for MP4 export | M4/M5 decision | Quran.com's own Media Maker is Remotion-based (reference architecture exists). Brief requires an image only; video with recitation audio + word-timing highlights reuses M2's timing data and is a real differentiator. Vercel functions cannot render video — spike the export pipeline before committing |
| Deployment | Vercel, custom domain RememberQuran.com | M1, day 1 | Zero-config Next.js hosting, free tier sufficient initially. See §6 |
| Analytics/monitoring | None initially (privacy-respecting option like Plausible could be discussed later) | — | No data selling; keep it clean |

**Dependencies are added per milestone, never speculatively.** M1 ships with zero packages beyond the scaffold.

---

## 3. Data Sources Register

Every source used must be documented in each milestone submission (brief §5.4). This table is the living record — update it as sources are confirmed.

| # | Source | Used for | Milestone | Status |
|---|---|---|---|---|
| 1 | **Quran.com API v4** (`api.quran.com/api/v4`) — open, no key | Quran text (Uthmani), chapters list, translations, word-by-word data, tafsir, search, tajweed text, audio URLs | M1–M5 | Primary — confirmed open access |
| 2 | **Quran Foundation API** (`apis.quran.foundation`) — requires OAuth2 client credentials (register at api-docs.quran.foundation) | Same data, newer platform — the long-term successor to #1 | M1+ | Apply for credentials early; use #1 meanwhile. Client abstraction (§5) makes switching a config change |
| 3 | **Al-Quran Cloud API** (`alquran.cloud`) | Backup/complement: text, translations, audio, tajweed edition | Any | Fallback — confirmed open |
| 4 | **Quran.com audio CDN** (`verses.quran.com`, `audio.qurancdn.com`) | Per-ayah recitation MP3s; **word-by-word pronunciation files** (`/wbw/001_001_001.mp3` pattern) | M2 | To verify during M2 research |
| 5 | **EveryAyah.com** | Per-ayah audio for many reciters; word/ayah timing data | M2, M5 | To verify per reciter |
| 6 | **Quran.com API audio segments** | Word-level timestamps (`segments` array on audio files endpoint) for word-highlight sync — check reciter coverage | M2 | Preferred over EveryAyah if coverage is good — same API family as text |
| 7 | **quran.com-frontend-next (GitHub)** | Reference architecture ONLY (word timing, audio sync, morphology display) — no wholesale copying | M2, M3 | Reference |
| 8 | **cpfair/quran-tajweed (GitHub)** | Tajweed annotation approach — compare with API's `text_uthmani_tajweed` field | M3 | Research |
| 9 | **Quranic Arabic Corpus** (corpus.quran.com) | Morphology cross-reference (root, lemma, grammatical form) if API word fields are insufficient | M3 | Research |
| 10 | **Asbab al-Nuzul (Al-Wahidi)** — via altafsir.com, quranx.com, or open datasets (e.g. spa5k/tafsir_api) | Reasons for revelation | M3 | Research — coverage is partial by nature, that's expected |
| 11 | **KFGQPC Uthmanic Hafs font** (King Fahd Complex — free) | Primary Arabic font, self-hosted | M1 | Confirmed free; Amiri (Google Fonts) as fallback |

### API access note (important correction)
The **new** Quran Foundation API (`apis.quran.foundation`) requires OAuth2 client-credentials — request access early via api-docs.quran.foundation. The **legacy** `api.quran.com/api/v4` remains open without a key and serves identical data shapes. **Plan: build on `api.quran.com/api/v4` immediately; route all calls through one client module so migrating to the credentialed API later is a one-file change.**

### Key resource IDs (api.quran.com v4, to re-verify at build time)
- Translation `131` — Saheeh International (English)
- Translation `20` / `85` region — **Dr Mustafa Khattab, The Clear Quran** — verify exact ID via `GET /resources/translations` before hardcoding
- Tafsir `169` — Ibn Kathir (English, abridged) — verify via `GET /resources/tafsirs`
- Verify all IDs at implementation time and record them in `src/lib/quranApi.ts` as named constants.

---

## 4. Architecture Overview (whole project)

### Folder structure (grows per milestone — M1 baseline shown, later additions marked)

```
src/
├── app/
│   ├── layout.tsx                    # Root layout — providers, fonts, metadata
│   ├── globals.css                   # Tailwind + CSS variables for theming
│   ├── page.tsx                      # "/" Surah list
│   ├── [surahId]/page.tsx            # "/2" Surah reader
│   ├── [surahId]/[ayahId]/page.tsx   # "/2/255" Reader scrolled to ayah
│   ├── not-found.tsx
│   ├── search/page.tsx               # M3
│   ├── radio/page.tsx                # M2 (Quran Radio)
│   ├── (auth)/login, register, reset # M4
│   ├── account/…                     # M4 (bookmarks, notes, progress, goals, settings)
│   └── api/…                         # M4 route handlers (auth, bookmarks, notes, progress)
│
├── components/
│   ├── layout/          # Navbar, Sidebar (persistent surah jump), ThemeToggle, Footer
│   ├── surah-list/      # SurahListPage, SurahCard
│   ├── reader/          # QuranReader, AyahBlock, ArabicLine, ArabicWord, WordTooltip,
│   │                    #   TranslationBlock, AyahNumber, BismillahHeader
│   ├── controls/        # ReaderControls, FontSizeSelector, DisplayModeToggle,
│   │                    #   TranslationSelector, SurahNavigator
│   ├── audio/           # M2: AudioPlayerBar, ReciterSelector, RepeatControls, SpeedControl
│   ├── study/           # M3: TafsirPanel, MorphologyPanel, AsbabPanel, TajweedLegend
│   ├── search/          # M3: SearchBox, SearchResults
│   ├── account/         # M4: BookmarkButton, NoteEditor, StreakDisplay, GoalSettings
│   ├── media-maker/     # M4: AyahCardDesigner
│   └── memorisation/    # M5: HideModeControls, HifzTracker
│
├── context/
│   └── ReaderSettingsContext.tsx     # theme, fontSize, displayMode, translations, tajweedOn (M3)
├── stores/
│   └── audioStore.ts                 # M2: current track, queue, repeat config, speed, sync state
├── lib/
│   ├── quranApi.ts                   # ALL Quran-content API calls — single point of change
│   ├── audioSources.ts               # M2: reciter registry + URL builders + timing loaders
│   ├── db.ts, models/                # M4: Mongo connection + Mongoose models
│   └── utils.ts
├── types/
│   └── quran.ts                      # API response types (verse, word, chapter, segment, tafsir…)
└── hooks/
    ├── useLocalStorage.ts
    ├── useAudioPlayer.ts             # M2: wraps the single <audio> element
    └── useWordSync.ts                # M2: maps currentTime → highlighted word via segments
```

### Future-proofing decisions locked in now (brief §4 architecture reminder)

1. **User model supports community later**: include `profile` (displayName, avatar placeholder), `roles: string[]`, and `moderation: { flagged, suspended }` fields from day one in M4 — unused but present so community features don't need a migration.
2. **Content system supports learning plans later**: reading-progress records are per-ayah-range events (`{ userId, surah, fromAyah, toAyah, date }`) rather than a single "percent read" number — learning plans can be layered on this event stream without redesign.
3. **Audio system supports multiple streams later**: `audioStore` addresses a *player instance* rather than assuming one global player. M2 ships one instance (the brief says don't over-engineer), but nothing hardcodes "there is exactly one audio element."
4. **Reciters, translations, and tafsir books are data, not code**: each is a registry entry (id, name, source URLs, capabilities like `hasWordTiming`), so M5's expansion is adding entries, not writing new systems.
5. **Word component is interaction-agnostic**: `ArabicWord` takes an `onActivate` handler and renders state props (highlighted, playing) — M1 uses hover→tooltip; M2 adds click→audio + sync highlight; M3 adds click→morphology panel. No rewrite between milestones.

---

## 5. API Client Design (`src/lib/quranApi.ts`)

- One typed module; **no raw `fetch` to Quran APIs anywhere else in the codebase**.
- Base URL and (future) auth headers come from env vars — switching from `api.quran.com/api/v4` to the credentialed Quran Foundation API is a config change.
- Next.js fetch caching: chapter list cached indefinitely; verse pages `revalidate: 86400` (24h); resource lists (translations/tafsirs/reciters) 24h.
- Core functions (M1): `getChapters()`, `getChapter(id)`, `getVerses(chapterId, { translations, page })`, `getVerseByKey("2:255")`.
- Word data comes embedded: `word_fields=text_uthmani,translation,audio_url` on the verses call — no per-word fetch on hover. Filter `char_type_name === "word"` (skip `"end"` — those are ayah-number glyphs). Requesting `audio_url` from M1 costs nothing and makes M2's word audio a pure frontend task.

---

## 6. Deployment & QA Workflow (applies to every milestone)

1. **Day 1 of M1**: connect the GitHub repo to Vercel, attach the RememberQuran.com domain (hosting/DNS access already provided — if current hosting is traditional cPanel, point DNS A/CNAME records at Vercel; confirm approach when connecting).
2. **Every working session ends with a push** → auto-deploys to the live domain. The brief requires the domain to reflect ongoing progress.
3. Feature branches optional; `main` = live. Keep `main` always in a non-broken state since it's public.
4. **Ready-for-QA checklist per milestone**:
   - [ ] All milestone features verified on the live domain (not localhost)
   - [ ] Full self-regression pass of ALL previous milestones (keep a running checklist in `docs/regression-checklist.md`, extended each milestone)
   - [ ] Mobile pass (375px / 414px / 768px) on the live site
   - [ ] Submission post prepared (template in §14)

---

## 7. MILESTONE 1 — Core Reading Experience (detailed)

**Deliverable**: user opens RememberQuran.com, navigates to any surah/ayah, reads Arabic, sees one/both translations, hovers any word for its meaning. Complete launchable v1.

### 7.1 Requirements → design mapping

| Brief requirement | Design answer |
|---|---|
| Full Quran, surah by surah, ayah by ayah | `/[surahId]` routes, paginated verse fetch (50/page) |
| Uthmani script font | Self-hosted KFGQPC Uthmanic Hafs (free), Amiri fallback; text from `text_uthmani` field |
| Reading mode + Verse-by-verse mode | `DisplayModeToggle`; reading = continuous RTL flow; verse = one ayah per block with number badge |
| RTL, correct diacritics | `dir="rtl" lang="ar"` on every Arabic container; Uthmani text includes full tashkeel |
| Font size S/M/L/XL | `FontSizeSelector` → context → Tailwind class map (text-2xl → text-5xl Arabic; text-sm → text-xl translation) |
| Surah list: number, Arabic name, transliteration, English meaning, ayah count, Makki/Madani | `GET /chapters` provides all fields (`name_arabic`, `name_simple`, `translated_name.name`, `verses_count`, `revelation_place`) |
| Direct nav to any surah + ayah | Routes `/[surahId]` and `/[surahId]/[ayahId]` with validation → `not-found` |
| Prev/next surah | `SurahNavigator` (hidden prev on 1, next on 114) |
| **Persistent** nav bar/sidebar to jump to any surah anytime | Navbar with always-available surah dropdown (desktop) / slide-out sheet (mobile) — persistent across all pages |
| Shareable URLs (`/2/255`) | Scroll-to + brief highlight of target ayah on load; per-surah `<title>`/meta |
| Two translations, switchable | Saheeh Int'l + Clear Quran fetched together; `TranslationSelector` toggles visibility per translation (both / one / none = Arabic only) |
| More translations later without rebuild | Translations held as an ID array in settings; API call takes the array; UI renders N translation blocks — M5 adds IDs, nothing else |
| Word hover (desktop) / tap (mobile) tooltip | `ArabicWord` + `WordTooltip`; data pre-embedded in verse payload, zero fetch on hover |
| Word audio ready for M2 | `audio_url` word field requested from M1; `ArabicWord` exposes `onActivate` + `isPlaying`/`isHighlighted` props unused until M2 |
| Light/dark mode, saved in browser | CSS custom properties + `data-theme` on `<html>`; persisted via localStorage in `ReaderSettingsContext` |
| Mobile responsive day one | Built mobile-first; explicit pass at 375/414/768/1280px |
| No ads/pop-ups/distractions | N/A by design |

### 7.2 Theme (CSS variables)

```css
:root {
  --bg-primary:#FAFAF8; --bg-secondary:#F0EDE8; --text-primary:#1C1917;
  --text-secondary:#78716C; --accent:#15803D; --border:#E7E5E4;
}
[data-theme="dark"] {
  --bg-primary:#0C0A09; --bg-secondary:#1C1917; --text-primary:#F5F5F4;
  --text-secondary:#A8A29E; --accent:#4ADE80; --border:#292524;
}
```
Warm stone neutrals + green accent. Max two accent colours.

### 7.3 Build order

**Phase A — Foundation**: Vercel + domain live with placeholder → `ReaderSettingsContext` + localStorage → theme system + `ThemeToggle` → `Navbar` → `quranApi.ts` + types.
**Phase B — Surah list**: `SurahCard` → `SurahListPage` grid at `/` → verify all 114 render with all six data points.
**Phase C — Reader**: `AyahNumber` → `ArabicWord` → `WordTooltip` → `ArabicLine` → `TranslationBlock` → `AyahBlock` → `BismillahHeader` (all surahs except 1 & 9) → `QuranReader` with pagination.
**Phase D — Controls**: `FontSizeSelector` → `DisplayModeToggle` → `TranslationSelector` → `ReaderControls` panel → `SurahNavigator` + persistent surah dropdown in Navbar.
**Phase E — Routing**: `/[surahId]` → `/[surahId]/[ayahId]` scroll+highlight → per-surah metadata → `not-found` → param validation (1–114, 1–verses_count).
**Phase F — Polish**: mobile pass → touch tooltip handling (tap show, tap-away dismiss) → loading skeletons → keyboard prev/next → self-QA against §7.1 table → start `docs/regression-checklist.md`.

---

## 8. MILESTONE 2 — Audio & Recitation (detailed)

**Deliverable**: full listening platform — reciters, playback controls, word-sync highlighting, word-level audio, Quran Radio.

### 8.1 Architecture

- **One `<audio>` element** managed by `useAudioPlayer` hook; all state in `audioStore` (Zustand or Context — decide with a spike): `{ reciterId, queue: verseKey[], currentIndex, isPlaying, speed, repeat: { mode: 'ayah'|'range'|'off', from, to, count, remaining }, currentTime }`.
- **Reciter registry** (`lib/audioSources.ts`): `{ id, name, arabicName, audioBaseUrl or apiRecitationId, hasWordTiming }`. M2 ships 2 reciters (e.g. Mishary Alafasy, Al-Sudais); M5 grows this to 20+ by adding entries only.
- **Continuous surah playback**: queue of ayah audio URLs; `ended` event advances the queue (respecting repeat config). Prefetch next ayah's audio for gapless feel.
- **Speed**: `audio.playbackRate` (0.75/1/1.25/1.5).
- **Mini player** (`AudioPlayerBar`): fixed bottom bar, appears whenever audio is active — surah/ayah label, play/pause, prev/next ayah, reciter switch, speed, repeat, close. Persists across route changes (lives in root layout).

### 8.2 Word-by-word sync (the hard part)

- **Research order** (document outcome in submission): (1) Quran.com API v4 audio endpoints with `segments` — word-level `[wordIndex, startMs, endMs]` arrays for supported reciters, same API family we already use; (2) EveryAyah timing files as fallback; (3) if neither covers a reciter, that reciter plays without sync — brief explicitly permits this, document the limitation.
- `useWordSync`: on `timeupdate` (plus a rAF interpolation for smoothness), binary-search segments for current word → set `highlightedWordId` in store → `ArabicWord` receives `isHighlighted` (prop already exists from M1). Highlight must move word-by-word, not ayah-by-ayah.
- Reciter registry's `hasWordTiming` flag drives UI (sync badge / graceful degradation).

### 8.3 Word-level audio (click to hear)

- `audio_url` per word already fetched since M1 (`audio.qurancdn.com/wbw/…` pattern — confirm at build).
- Click word → play via a lightweight secondary mechanism (pausing main recitation if playing). This is the `onActivate` handler slot reserved in M1.
- On mobile, tap = tooltip (M1 behaviour); tooltip gains a small play button so tap-to-hear and tap-for-meaning don't conflict.

### 8.4 Quran Radio

- `/radio` page: continuous queue from current position (or Al-Fatiha) through the whole mushaf, auto-advancing across surah boundaries; reciter selectable. Reuses the exact same store/queue machinery — Radio is just "queue = everything."

### 8.5 Build order

Reciter registry + audio URL research spike → `useAudioPlayer` + store → per-ayah play button → continuous surah playback → mini player bar → speed control → repeat (single ayah × N, custom range × N with the memorisation use-case in mind) → segments/timing research spike → `useWordSync` + highlight rendering → word-click audio → Quran Radio → mobile audio pass (iOS autoplay restrictions: audio must start from a user gesture) → regression pass on all M1 features.

---

## 9. MILESTONE 3 — Study Tools (detailed)

### 9.1 Tafsir
- `GET /tafsirs/{id}/by_ayah/{verse_key}` (Ibn Kathir English — verify ID via `/resources/tafsirs`).
- `TafsirPanel`: opens below the ayah (mobile) / side panel (desktop), lazy-fetched on demand, cached.
- Multi-book ready: panel takes a `tafsirId`; a selector UI exists from day one even with one book — M5 adds registry entries.

### 9.2 Tajweed colour coding
- **Research spike**: API `fields=text_uthmani_tajweed` returns HTML-annotated text (`<tajweed class=…>` markup) — likely the cleanest path since it's our existing API. Compare with cpfair/quran-tajweed and alquran.cloud's tajweed edition; document choice.
- Toggle in `ReaderSettingsContext` (`tajweedOn`); render annotated text with a colour map via CSS classes; include a `TajweedLegend` (what each colour means).
- Constraint: tajweed rendering must coexist with word-sync highlighting (M2) — test both on together.

### 9.3 Keyword search
- `GET /search?q=…` (api.quran.com) searches Arabic + translations; results show ayah text with highlighted match + surah/ayah reference → click jumps to `/[surah]/[ayah]`.
- `/search` page + search box in Navbar. Debounced input. Target < 2s (API is typically well under; add loading state).
- If API search quality disappoints in English, fallback plan: client-side index of translation text (e.g. FlexSearch) — research only if needed.

### 9.4 Word morphology & grammar
- Word click behaviour gains a third layer: hover=tooltip (M1), click=play audio (M2), **"details" affordance in the tooltip → `MorphologyPanel`** (root, lemma, grammatical form: verb/noun/particle, morphological breakdown).
- Data: word fields (`root`, `lemma`, `verse_key`, POS data) from the API; cross-reference Quranic Arabic Corpus if API fields are thin. Document source.

### 9.5 Asbab al-Nuzul (reasons for revelation)
- Toggleable panel per ayah, shown only where data exists (partial coverage is expected and fine).
- Research spike: Al-Wahidi dataset availability (altafsir.com, quranx.com, open GitHub datasets). If no clean API exists, a static JSON dataset bundled with the app is acceptable — it's small, historical, unchanging content (this does not violate the "fetch from API" rule, which is about the Quran text itself; document the reasoning).

### 9.6 Build order
Tafsir panel → tajweed spike + implementation + legend → search page → morphology panel → asbab research + panel → regression pass (M1 reading + M2 audio, especially tajweed × word-sync interaction).

---

## 10. MILESTONE 4 — User Accounts & Personal Features (detailed)

### 10.1 Data layer
- MongoDB Atlas + Mongoose. Models:
  - **User**: email, passwordHash, settings, `profile { displayName }`, `roles: []`, `moderation { flagged, suspended }` (future-proofing, unused now), timestamps.
  - **Bookmark**: userId, verseKey, collectionId, createdAt.
  - **Collection**: userId, name (defaults seeded: "Favourites"; user-creatable, e.g. "For memorisation").
  - **Note**: userId, verseKey, text (plain text — rich text explicitly not required), timestamps. Private to owner.
  - **ProgressEvent**: userId, surah, fromAyah, toAyah, date (event stream — supports M5 hifz + future learning plans).
  - **Goal**: userId, type ('pages' | 'ayahs'), target, createdAt.
  - **StreakState** (or computed from ProgressEvents): currentStreak, lastMetDate.
- API route handlers under `app/api/…`; all user endpoints auth-guarded.

### 10.2 Auth
- Auth.js credentials provider, bcrypt hashing, session via JWT cookies.
- Register / login / logout / forgot-password (email reset link via Resend or host SMTP) / account settings (change email, change password).

### 10.3 Features
- **Bookmarks**: `BookmarkButton` on every `AyahBlock` (visible when logged in); bookmarks page grouped by collection with jump links; create/rename/delete collections.
- **Notes**: `NoteEditor` attached to any ayah; notes page lists all notes with ayah reference + link back.
- **Last position / continue**: reader records position (throttled) → "Continue where you left off" prompt on return.
- **Progress tracker**: surah marked read once viewed; progress view by surah (percentage of 114 + visual grid).
- **Streaks & goals**: user sets daily goal (pages/day or ayahs/day); daily-met calculation from ProgressEvents; simple streak display (current streak count + calendar-style indicator). Brief says keep it simple.
- **Quran Media Maker**: pick ayah → card with Arabic + translation + reference + RememberQuran.com branding → a few background/colour presets → download PNG (shareable). Spike `@vercel/og` vs client `html-to-image` first; pick the one with better Arabic font rendering.
  - **Optional stretch — video export via Remotion**: the brief requires an image; a video mode (recitation audio + synced word highlighting over the card, exported MP4) would be a strong differentiator and reuses M2's audio/timing data. Quran.com's media maker is itself Remotion-based. Plan: `@remotion/player` for free in-browser preview; MP4 export requires Remotion Lambda (AWS) or a small render server — **Vercel functions cannot render video**. Spike at M4; if the pipeline is heavy, ship image-only in M4 (meets the brief) and move video export to M5. Load the `remotion-best-practices` skill when implementing. Candidate answer for the M6 product-thinking question on differentiation.

### 10.4 Build order
DB + models + Auth.js flows (register/login/reset/settings) → bookmarks + collections → notes → last-position + progress → goals + streaks → media maker → **regression pass: logged-OUT experience must be 100% unchanged** (M1–M3 features never require an account) → full regression M1–M3.

---

## 11. MILESTONE 5 — Expansion (detailed)

Everything here validates the M1–M4 architecture: expansion should be data entries + small features, not new systems.

- **Reciters → 20+**: add registry entries (Saad Al-Ghamdi, Maher Al-Muaiqly, Hani Ar-Rifai, Khalid Al-Jaleel, Al-Minshawi, …). Per reciter: verify audio source + timing availability; set `hasWordTiming` honestly; document each source. Reciter picker UI upgraded to a searchable list.
- **Translations → 10+**: add IDs from `/resources/translations` (Pickthall, Yusuf Ali, Abdul Haleem, Shakir; Urdu — Fateh Muhammad Jalandhari or similar; simplified Arabic). Translation selector upgraded to grouped-by-language searchable list. RTL translations (Urdu/Arabic) need `dir="rtl"` on their blocks — small render tweak.
- **Tafsir → 5+ books**: add registry entries (Al-Sa'di, Al-Jalalayn, Al-Tabari where English exists — verify availability, document). Tafsir panel gains book switcher (built in M3).
- **Memorisation tools**:
  - **Hide mode**: blur/hide Arabic text of selected ayahs, tap to reveal — pure frontend state on `AyahBlock`.
  - **Memorisation repeat**: preset UI over the M2 repeat-range machinery + configurable pause between repetitions (small `useAudioPlayer` addition — pause-between-repeats).
  - **Hifz tracker**: mark ayahs "memorised" (new `MemorisedAyah` model or flag on ProgressEvent stream); progress views by surah and by juz (juz mapping available from API/static data).
- Regression: full M1–M4 pass, with extra attention to audio (new reciters must not break sync for existing ones).

---

## 12. MILESTONE 6 — Final Polish & Sign-Off (detailed)

No new features.

- **Performance**: target < 3s initial load on slow mobile; audio start < 2s after play. Levers: font subsetting/`font-display: swap`, verse payload trimming (only requested fields), route-level code splitting (audio/study/account bundles lazy), image/OG optimisation, API response caching review, skeleton tuning. Lighthouse + PageSpeed before/after scores documented.
- **Cross-browser**: Chrome, Firefox, Safari, Edge; desktop + tablet + mobile (iOS Safari is the risk area for audio autoplay and Arabic font rendering — test early, not last). Document known issues.
- **Full regression**: run the complete `docs/regression-checklist.md` (grown since M1) end-to-end on the live domain.
- **Final README**: whole project — tech stack, every data source, deployment instructions.
- **Product thinking answers** (brief §6): draft during M5–M6 while it's fresh — (1) 2–3 features that would make someone choose this over Quran.com and why; (2) what I'd redo in audio/word-sync knowing what I know; (3) biggest technical risk at scale (many users, many simultaneous audio streams) and how to begin addressing it.

---

## 13. Regression Checklist Strategy

Maintain `docs/regression-checklist.md` from M1: every milestone appends its features as one-line testable checks (e.g. "hover word in 2:255 shows meaning tooltip", "switching reciter mid-surah continues from same ayah"). Before each QA handover, run the full list top-to-bottom **on the live domain** and state the confirmation in the submission (§5.5 of the brief requires this exact confirmation).

---

## 14. Submission Template (per milestone — brief §5)

```
Milestone N — Ready for QA

1. Live: https://rememberquran.com
2. Repo: <GitHub link / same as previously shared>
3. Built this milestone: <summary>
4. Data sources used: <every API/dataset/library + why chosen>  ← keep §3 table updated
5. "I have tested all previous milestone features and confirm they are still working correctly."
6. Known limitations: <list, e.g. reciter X has no word-timing data>
7. How to test (steps for Hafiz Saad): <numbered steps>
```
M6 additionally: Lighthouse/PageSpeed scores (before/after), cross-browser/device results, full project README.

---

## 15. Open Questions (confirm before/at M1 start — none block starting)

1. **Hosting**: recommend Vercel with DNS pointed from existing hosting — confirm acceptable given "hosting access already provided" (if the provided hosting is cPanel/shared, it likely can't run Next.js well; Vercel + DNS is the standard answer).
2. **Quran Foundation API credentials**: apply early (api-docs.quran.foundation) so the credentialed API is an option before launch; legacy open API carries us regardless.
3. **Clear Quran translation ID**: verify via `/resources/translations` at build time (do not trust memory for resource IDs — verify all of them).
4. **Long surah loading UX** (Al-Baqarah, 286 ayahs): recommend server-render first page + stream/lazy-load the rest — decide during Phase C with real payload sizes in hand.
```
