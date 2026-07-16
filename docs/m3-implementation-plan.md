# Milestone 3 — Study Tools: Implementation Plan

## Context

M1 (reading) and M2 (audio) are shipped. M3 adds the study layer: **tafsir, tajweed color coding, keyword search, word morphology, and asbab al-nuzul**. Everything must be **additive** — no regression to word tooltips, translations, display modes, or audio word-sync. All UI must work on mobile and desktop. This document is the plan only; the first implementation step is to commit it into the repo as `docs/m3-implementation-plan.md` alongside the existing `docs/plan.md` / `docs/ui-implementation-plan-m1.md`.

**Key architectural decision:** the codebase is fully **unauthenticated** (`api.quran.com/v4` + `api.qurancdn.com/api/qdc`, no OAuth/.env). M3 stays on that path — every data source below was **live-probed and confirmed working without auth** (2026-07-16).

## Verified data sources (live probes)

| Feature | Source | Verified finding |
|---|---|---|
| Tafsir | `GET api.qurancdn.com/api/qdc/tafsirs/{slug}/by_ayah/{verseKey}` | Works unauth. Ibn Kathir EN = id 169, slug `en-tafisr-ibn-kathir` (sic). Returns HTML `text` + `verses` map showing which ayahs the passage covers (API handles ayah grouping). 2:1 ≈ 22 KB of HTML. |
| Tajweed | QDC `word_fields=text_uthmani_tajweed` | **Word-level tajweed exists**: per-word `<rule class=ham_wasl>ٱ</rule>…` markup (verse-level endpoint uses `<tajweed>` tags; word-level uses `<rule>`, unquoted attrs). Rules seen: ham_wasl, laam_shamsiyah, madda_normal/permissible/necessary/obligatory, ghunnah, qalaqah, ikhafa(_shafawi), idgham_*, iqlab, slnt. Encoding ≈ text_uthmani (not QPC hafs) — font check needed. |
| Search | `GET api.qurancdn.com/api/qdc/search?q=&size=&page=` | Works unauth. English hits carry `<em>` highlights in `translations[].text`; Arabic hits carry per-word `highlight: true` flags; plain undiacritized Arabic input works; `navigation` + `pagination` included. |
| Morphology | QDC `word_fields=root,lemma` | **Returns nothing** — not on the API. Use Quranic Arabic Corpus data (mustafa0x/quran-morphology TSV, ~128k segment rows; GPL — attribution required) transformed at build time. |
| Asbab | jsDelivr `spa5k/tafsir_api`, slug `en-asbab-al-nuzul-by-al-wahidi` (`…/{surah}/{ayah}.json`) | Works, MIT, no rate limits. **Quality issues found**: mojibake (`�`), non-Wahidi filler on some ayahs (1:1, 2:30), 404s (112:1). Needs curated coverage index + text cleanup. ~570/6236 ayahs covered — sparse by nature. |

Rejected alternatives: Quran Foundation OAuth APIs (needs credentials/env the project doesn't have yet), QCF Tajweed V4 color fonts (heavy, ties to glyph rendering), cpfair/quran-tajweed (character-index output, more integration work than the API's ready-made tags), verse-level tajweed re-segmentation (fragile).

## Shared architecture: one Study Panel

Tafsir, asbab, and morphology are all "detail views anchored to an ayah (or word)" → build **one panel, three views**, instead of three ad-hoc panels.

- **`src/context/StudyPanelContext.tsx`** (new, UIContext pattern, not persisted):
  `{ target: { view: "tafsir"|"asbab"|"word", verseKey, wordPosition? } | null, openTafsir(vk), openAsbab(vk), openWord(vk,pos), setView(v), navigateAyah(±1), close() }`. Registered in `src/components/providers.tsx` inside `SurahContentProvider`; auto-closes when `surahId` changes.
- **`src/components/study/StudyPanel.tsx`** (new), mounted once in `src/app/[surahId]/layout.tsx`. Reuses `src/components/ui/sheet.tsx`:
  - **Mobile** (`useIsMobile()`, <768px): `SheetContent side="bottom"`, `max-h-[75dvh]`, ScrollArea body, safe-area padding. Overlays AudioPlayerBar; audio keeps playing.
  - **Desktop**: `SheetContent side="right" modal={false}` (`sm:max-w-lg`), no backdrop — reader stays scrollable, playback + word highlight continue while studying.
  - **Header**: `2:255 — Al-Baqarah`, prev/next ayah chevrons (clamped to `verses_count`), tab strip (ToggleGroup): **Tafsir | Context | Word** (Word tab enabled only with a wordPosition).
  - **Body**: `TafsirView` / `AsbabView` / `WordDetailView`, each with skeleton + error + empty states.
- **`src/lib/studyApi.ts`** (new): client fetchers with module-level promise caches (the `audioApi.ts` pattern). Server proxy routes under `src/app/api/` follow the `/api/surah/[surahId]` conventions (`params: Promise<…>`, `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`). Types in `src/types/study.ts`.

## Phases (ordered by dependency/risk)

### Phase 1 — Study Panel infra + Tafsir (3.3.1)

**Create:** `StudyPanelContext.tsx`, `study/StudyPanel.tsx`, `study/TafsirView.tsx`, `study/StudyPanelSkeleton.tsx`, `lib/studyApi.ts` (incl. `TAFSIR_RESOURCES` registry — M5 multi-book = append entries), `types/study.ts`, `app/api/tafsir/[slug]/[surahId]/[ayahId]/route.ts`.
**Modify:** `providers.tsx` (+provider), `[surahId]/layout.tsx` (+`<StudyPanel/>`), `reader/AyahBlock.tsx` (+BookOpen button in existing meta bar → `openTafsir`), `ReaderSettingsContext.tsx` (+`tafsirSlug`, default `en-tafisr-ibn-kathir`, with migration), `globals.css` (+`.study-prose`).

The API route validates the slug against the registry (no open proxy), fetches QDC, and **sanitizes HTML server-side** with `sanitize-html` (new server-only dep; allowlist p/h3/h4/strong/em/ul/ol/li/blockquote/span/br/a[href^=http], strip other attrs). Client renders via `dangerouslySetInnerHTML` — safe because sanitized at our single choke point (covers all future M5 books too).

**Edge cases** — best: short tafsir, instant from promise cache on reopen. Worst: 2:282-scale 20 KB+ HTML (ScrollArea, no virtualization needed); grouped passages (show "Covers 2:285–286" chip, prime cache for all covered keys); missing tafsir (friendly empty state); network failure (error card + retry, evict cache entry); malicious HTML in source (sanitizer).

### Phase 2 — Asbab al-Nuzul (3.3.5)

**Create:** `scripts/build-asbab-index.mjs` (one-time, output committed: enumerate CDN files, subtract `empty_ayahs.json`, quality-filter the non-Wahidi filler → `src/data/asbab-index.json` `{ "2": [44, 62, …] }`, few KB, imported statically), `study/AsbabView.tsx` (with attribution: "Asbāb al-Nuzūl by al-Wāḥidī, trans. Mokrane Guezzou"), `app/api/asbab/[surahId]/[ayahId]/route.ts` (jsDelivr fetch, mojibake/quote cleanup, 404 → `{ text: null }` with 200 — absence is expected), `lib/asbabIndex.ts` (`hasAsbab(verseKey)`).
**Modify:** `studyApi.ts` (+`getAsbab`), `AyahBlock.tsx` (subtle ScrollText icon **only when `hasAsbab()`** — presence indicates availability, zero clutter on the ~5,600 uncovered ayahs), StudyPanel Context tab (empty state explains only ~570 ayahs have one).

**Edge cases** — best: indexed ayah, clean text. Worst: mojibake/filler text (server cleanup + index filter); CDN 404 despite index (null-text empty state); grouped empty ayahs (index maps to group-head entry); long isnad chains (scroll).

### Phase 3 — Tajweed color coding (3.3.2)

**Approach: word-level tajweed** — keeps every M1/M2 word behavior intact in both display modes.

**Create:** `lib/tajweed.ts` (regex tokenizer `parseTajweedWord(text): {text, rule?}[]` — attrs are unquoted, never use innerHTML/HTML parser; `TAJWEED_RULES` map rule → {label, description, cssClass}, pass-through for unknown future classes), `reader/TajweedToggle.tsx`, `reader/TajweedLegend.tsx` (swatches + names in settings).
**Modify:** `lib/quranApi.ts` (append `text_uthmani_tajweed` to `WORD_FIELDS` — one line, ~15–25% payload growth, 24h caches roll over), `types/quran.ts` (+optional field), `ReaderSettingsContext.tsx` (+`tajweedEnabled`, default **false**, + migration), `reader/ArabicWord.tsx` (when enabled and word has `<rule`, render parsed tokens as `<span class="tj-…">` **inside the same single interactive span** — tooltip/popover trigger, click-to-play, highlight background untouched; otherwise exact current path), `globals.css` (+`--tj-*` tokens with `.dark` overrides, quran.com-style palette), `ReaderSettingsPanel.tsx` (+Tajweed section). **Colors only — never animate Arabic text (hard rule).**

**Edge cases** — best: toggle off = byte-identical current rendering path. Worst: audio word-highlight + tajweed simultaneously (highlight is background tint, tajweed is text color — they compose; verify contrast of every `--tj-*` token against `bg-primary/15` in light+dark); font/encoding drift (tajweed text ≈ Uthmani encoding, not QPC hafs — words shift glyphs slightly when toggled; verify in UthmanicHafs and Amiri, add scoped fallback stack if a codepoint misrenders); Al-Baqarah perf (6,000+ words — parse is O(len) per render, words only re-render on settings/highlight change; memoize per `word.id` in a module Map if profiling shows cost); end/pause markers unaffected (`char_type_name !== "word"` path untouched); toggle mid-playback (plain settings re-render).

### Phase 4 — Keyword search (3.3.3)

**Create:** `app/api/search/route.ts` (proxy to QDC search; `q` trimmed 1–100 chars, `size` clamped ≤20, `page`; same s-maxage=86400 + SWR headers — the corpus never changes, so warm repeat queries are near-instant, which is the "1–2s" lever), `app/search/page.tsx` (server shell, reads `?q=` for shareable URLs), `search/SearchPageClient.tsx` (Input, 300 ms debounce, AbortController + latest-query guard, `router.replace` URL sync without scroll), `search/SearchResults.tsx` + `SearchResultItem.tsx` (Arabic line RTL with `highlight: true` words emphasized statically; translation `<em>` matches rendered by **splitting into segments** — never `dangerouslySetInnerHTML`; verse_key badge; row links to `/{surah}/{ayah}` which already scroll-flashes the target via `targetAyahId`; Load-more pagination), `search/SearchEmptyState.tsx` (+optional recent searches via `useLocalStorage("rq-recent-searches")`).
**Modify:** `layout/Navbar.tsx` (+search icon → `/search`), `layout/SurahCommand.tsx` (fallthrough item "Search the Quran for '…'" when input matches no surah — palette remains a navigator).

**Edge cases** — best: cached query, results < 500 ms, highlights render. Worst: "Allah"-scale thousands of hits (server pagination, 20/page, count header); Arabic diacritics (QDC normalizes — verified); empty/gibberish query (idle/empty states); rapid typing races (debounce + abort + guard); network failure (error + retry, keep last results on screen); back/forward and link-sharing via `?q=`.

### Phase 5 — Word morphology (3.3.4)

**Create:** `scripts/build-morphology.mjs` (one-time, output committed: parse corpus TSV, Buckwalter→Arabic transliterator, group segments per word, emit **114 per-surah chunks** `public/data/morphology/v1/{surahId}.json` keyed `"{verse}:{wordPosition}"` — each entry `{ root, rootLatin, lemma, pos, segments: [{arab, tag, features}] }`; script **cross-checks per-verse word counts against QDC** and writes a mismatch report — this alignment check is the phase's risk gate; verify surahs 1 and 9 Bismillah alignment specifically; GPL attribution shipped in panel footer), `lib/morphologyApi.ts` (chunk fetch + promise cache, `getWordMorphology(verseKey, position)`), `lib/morphologyLabels.ts` (tag → "Noun/Verb/Preposition", features → "third person masculine singular" etc.), `study/WordDetailView.tsx` (large Arabic word, translation/transliteration from the existing `Word` object via SurahContentContext, play-word button reusing `useAudioPlayerActions().playWord`, Root/Lemma rows, segment breakdown).
**Modify:** `reader/WordMeaningContent.tsx` (+"Grammar" icon button beside the existing Volume2 button → `openWord`; +optional `verseKey` prop), thread optional `verseKey` down `AyahBlock` → `ArabicLine` → `ArabicWord` (and `ReadingModeView`'s ReadingVerse) — button hides when absent, fully additive. Desktop click still plays word audio; hover tooltip and touch popover each just gain one button. Add long-max-age `headers()` entry in `next.config.ts` for `/data/morphology/v1/*` (the `/v1/` segment is the cache-buster).

**Edge cases** — best: word found, full breakdown. Worst: particles/pronouns without roots (hide Root row, show POS); alignment miss (graceful "Detailed grammar unavailable" — panel still shows M1 translation/transliteration, never dead-ends); chunk fetch failure (retry, basics still shown); chunk sizes ~10–150 KB (loaded once per surah, cached immutably; prefetch on first panel open, not page load).

### Phase 6 — Cross-feature regression & polish

Full `docs/regression-checklist.md` pass plus new M3 entries (add them to that doc): tajweed ON + playback highlight sweep (both fonts/themes/display modes); panel open during playback (highlight continues, player bar reachable); panel/sidebar/settings-sheet z-index interplay (one overlay at a time on mobile); the full study loop (search → jump → tafsir → next-ayah → play); Al-Baqarah perf vs M2 baseline; pre-M3 localStorage payloads migrate cleanly; mobile Safari + Android Chrome (touch popovers, bottom sheets, safe areas).

## Non-breaking integration map (every existing-file touch)

| Existing file | Diff | Risk |
|---|---|---|
| `src/lib/quranApi.ts` | +`text_uthmani_tajweed` in WORD_FIELDS | payload size only |
| `src/types/quran.ts` | +1 optional Word field | none |
| `src/context/ReaderSettingsContext.tsx` | +`tajweedEnabled` (false), +`tafsirSlug` (+migrations) | defaults preserve behavior |
| `src/components/reader/ArabicWord.tsx` | conditional token render; optional `verseKey` prop | off by default |
| `src/components/reader/ArabicLine.tsx`, `ReadingModeView.tsx` | `verseKey` pass-through | none |
| `src/components/reader/WordMeaningContent.tsx` | +1 icon button | none |
| `src/components/reader/AyahBlock.tsx` | +tafsir button, +conditional asbab icon (existing meta bar) | none |
| `src/components/reader/ReaderSettingsPanel.tsx` | +Tajweed section | none |
| `src/components/providers.tsx` | +StudyPanelProvider | none |
| `src/app/[surahId]/layout.tsx` | +`<StudyPanel />` | none |
| `src/components/layout/Navbar.tsx`, `SurahCommand.tsx` | +search entry points | none |
| `src/app/globals.css` | +`.study-prose`, +`--tj-*` tokens | additive |

New dependency: **`sanitize-html`** (server-only). No env vars, no OAuth. Consult `node_modules/next/dist/docs/` before writing any route/App Router code (AGENTS.md rule).

## Verification (per phase, summarized)

1. **Tafsir**: open on 1:1 / 2:255 / 2:282 (long) / 2:285 (grouped) / 114:6; desktop panel non-modal (reader scrolls, audio + highlight continue); mobile bottom sheet; dark mode prose; full M1/M2 regression with panel open and closed; `pnpm lint`.
2. **Asbab**: icon on 2:222 & 2:115, absent on 1:2; 10 sampled ayahs show clean text (no `�`); tab switch preserves verseKey.
3. **Tajweed**: colors match quran.com tajweed mode on 1:1–1:7; toggle off = current behavior; both fonts × both display modes × both themes; playback sweep with tajweed on; tooltips/word audio on colored words; surah-2 scroll perf ≈ baseline.
4. **Search**: "mercy" (EN highlights), "الرحمن" (AR word flags), gibberish (empty), "Allah" (3+ pages, no dupes); click-through flash-lands on ayah; warm query < 500 ms / cold < 2 s; cmd+K fallthrough.
5. **Morphology**: 15-word spot-check vs corpus.quran.com; build-script alignment report clean (or mismatches documented); tooltip→Grammar→panel on desktop hover and mobile tap; word-audio click unchanged; chunk fetched once per surah.
