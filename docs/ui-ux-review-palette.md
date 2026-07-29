# RememberQuran — UI/UX & Colour Review

**Scan only — no files were modified.** Date: 2026-07-25
Scope: `src/app/globals.css`, layout chrome (Navbar, Footer), home (HomeHero, QuickAccess, SurahCard), auth shell, reader tokens.

---

## 1. Verdict in one paragraph

The palette direction is already right: **parchment + deep jade + manuscript gold** is a distinctive, mature choice for a Quran app and it beats the generic "emerald on white" every competitor uses. It does not need replacing. What it needs is **contrast repair in light mode, one real bug fix in dark mode, and a semantic token layer**. Structurally, the app is feature-rich but the home page does not sell *why to create an account*, which is the single biggest lever on the retention goal ("people stay and work on it").

---

## 2. What is broken today (measured)

Contrast ratios computed against your actual token values (WCAG 2.1).

### 2.1 Gold fails in light mode — highest priority

`--brand-gold: #b58a45`

| On | Ratio | Verdict |
|---|---|---|
| `--background` #f7f3e8 | **2.83** | FAIL (needs 4.5) |
| `--card` #fffcf5 | **3.07** | large-text only |
| `--muted` #ebe6d9 | **2.52** | FAIL |

Gold is used as *text* in at least four places: the surah number in `SurahCard.tsx:42`, the "Makki" badge (`:62`), the "Directory" eyebrow label in `SurahListPage.tsx:21`, and the footer ayah. All of these are unreadable-grade in light mode. In dark mode gold is fine (8.64:1).

**Fix:** split the token into *ink gold* (text) and *ornament gold* (hairlines, strokes, glow). Ornament gold can stay decorative because contrast rules don't apply to purely decorative strokes.

### 2.2 Tajweed colours never switch in dark mode — a real bug

`globals.css:245` keys the dark tajweed overrides on `[data-theme="dark"]`, but `providers.tsx` runs `next-themes` with `attribute="class"`, which sets `.dark` and never sets `data-theme`. Result: in dark mode the reader renders the **light** tajweed palette (lightness 0.48–0.55) on a near-black `#0b0d0c` background. Those colours are dim and muddy exactly where accuracy matters most — recitation rules. Changing the selector to `.dark` is a one-line fix.

### 2.3 Muted text is borderline

`--muted-foreground: #667069` → 4.63 on background (barely passes), **4.12 on `--muted`** and **4.07 on `--accent`** (fails). Since muted text sits inside muted/accent surfaces constantly (hints in QuickAccess, ayah counts in SurahCard, footer links), this fails in practice.

### 2.4 Borders and inputs are invisible

`--border` #ddd7ca vs background = **1.29:1**; `--input` #d5cfc1 vs card = **1.52:1**. WCAG asks 3:1 for meaningful UI boundaries. Form fields on `/login` are effectively borderless, which reads as "is this field even editable?" — directly relevant to your login-and-stay concern. Same in dark mode (border 1.39:1).

### 2.5 No semantic colour layer

There is exactly one accent (`--primary`) plus `--destructive`. Nothing for success, warning, or info. Hifz/goals/progress features (`HifzView`, `GoalsView`, `ProgressView`) all need a "done / on-track / behind" vocabulary and currently have to borrow primary or gold, which dilutes both.

### 2.6 Global smooth scroll with no reduced-motion guard

`globals.css:321` sets `scroll-behavior: smooth` on `html` unconditionally. Two components check `prefers-reduced-motion` locally (`QuranReader.tsx:65`, `HideArabicToggle.tsx:14`), but there is no global guard. Long surahs + smooth scroll + vestibular sensitivity is a known accessibility complaint.

---

## 3. Recommended minimal palette

Same identity, repaired. **Two accents only** (jade = action, gold = reverence/ornament) plus a neutral ramp and four semantics. That is the minimum for an app this size; going below it forces overloading.

### 3.1 Light — "Parchment"

| Token | Current | Recommended | Why |
|---|---|---|---|
| `--background` | `#f7f3e8` | `#f8f5ee` | Slightly lower chroma — less yellow-cast fatigue over 30-minute sessions, still warm |
| `--foreground` | `#202923` | keep `#202923` | 13.5:1, excellent |
| `--card` | `#fffcf5` | keep | Good lift off background |
| `--primary` | `#0e6b57` | keep `#0e6b57` | 5.81:1, white-on-jade 6.44:1 — solid |
| `--muted-foreground` | `#667069` | **`#5c655f`** | 5.44 on bg, 4.84 on muted — passes everywhere |
| `--border` | `#ddd7ca` | `#e0dacd` | Keep soft for cosmetic dividers |
| `--border-strong` *(new)* | — | **`#948a78`** | 3.07:1 — use on inputs, cards that are controls, table rules |
| `--input` | `#d5cfc1` | **`#948a78`** | Fields must read as fields |
| `--gold-ink` *(new)* | — | **`#8c6528`** | 4.73 on bg, 5.11 on card — legal for text |
| `--gold-ornament` | `#b58a45` | keep `#b58a45` | Hairlines, octagon stroke, gradients only |
| `--success` *(new)* | — | `#1f7a4d` | 4.80:1 |
| `--warning` *(new)* | — | `#8a5a12` | 5.33:1 |
| `--info` *(new)* | — | `#1c5f8a` | 6.20:1 |
| `--destructive` | oklch(0.52 0.14 30) | `#a33224` | 6.23:1, explicit hex for parity |

### 3.2 Dark — "Night parchment"

| Token | Current | Recommended | Why |
|---|---|---|---|
| `--background` | `#0b0d0c` | **`#101413`** | #0b0d0c is near-black; pure-white-ish text at 16.4:1 on it causes halation (glow/smear) on OLED and LCD alike. Lifting to #101413 still gives 15.6:1 — imperceptibly less contrast, noticeably less eye strain for long reading |
| `--foreground` | `#f0ebe3` | keep | Warm off-white, correct choice (never `#fff` on dark) |
| `--card` | `#141816` | `#171c1a` | Keep ~1 step above the new background |
| `--primary` | `#68b79c` | keep `#68b79c` | 8.21:1, and `--primary-foreground: #0b0d0c` on it is correct |
| `--muted-foreground` | `#b0b8b3` | keep | 9.6:1 |
| `--border` | `#2a312e` | `#2e3633` | Cosmetic |
| `--border-strong` *(new)* | — | `#525b56` | Inputs and control edges |
| `--gold-ink` *(new)* | — | `#c9a86e` | Already passing in dark; alias it so components use one name across themes |
| `--gold-ornament` | `#c9a86e` | keep | |
| `--success` / `--warning` / `--info` *(new)* | — | `#5fc98d` / `#e0b154` / `#6fbdea` | 9.0 / 9.4 / 9.0:1 |
| `--destructive` | oklch(0.60 0.14 30) | `#f08b7d` | 7.68:1 |

### 3.3 Which is better for practice — dark or light?

Honest answer: **light for daytime reading, dark for night, and neither is universally better** — so the right move is not to pick one but to make the *third* option first-class:

- **Light (parchment)** wins for sustained recitation practice in daylight. Dark polarity is measurably better for people with photophobia/migraine, and worse for people with astigmatism (halation blurs Arabic diacritics — and your app lives or dies on diacritic legibility).
- **Dark (night parchment)** wins for tahajjud / pre-Fajr / bedtime sessions, which for a memorisation app is a *large* share of usage.
- **Recommendation:** add a **Sepia** reading theme (`#efe6d3` bg, `#2b2419` text — ~11:1) as a reader-only surface option. Quran apps that offer sepia see it become the default choice for long-session users, and it's the cheapest retention win in this list. Keep the three-way system/light/dark toggle you already have for chrome, and expose sepia inside `ReaderSettingsPanel` rather than the navbar.

---

## 4. Component-level UI/UX notes

### 4.1 Navbar (`components/layout/Navbar.tsx`)

Working well: sticky, backdrop-blur, gold hairline on scroll, `aria-current`, the reader variant that aligns the logo over the 288px sidebar. The scroll listener is passive. Good.

Gaps:

1. **`ThemeToggle` and `AuthNav` are inside `<nav>`** (`:79-80`). They are not navigation landmarks. Move them into a sibling `<div>` so screen-reader users don't get two controls announced as nav links.
2. **Scroll state uses `useState` + listener** — a `IntersectionObserver` sentinel or a CSS-only `scroll-timeline`/sticky trick avoids a React re-render on every scroll frame crossing y=4.
3. **No streak / progress in the navbar.** For a habit app this is the highest-leverage retention change: a small `🔥 12` or ring next to `AuthNav` for signed-in users makes the loss aversion visible on every page. You already store `StreakState`.
4. **Search is icon-only** (`hideLabel: true`) with no `⌘K` affordance shown, even though `SurahCommand` exists. Show a `⌘K` kbd chip on `sm:` and up.
5. **4 items is right.** Don't add more; put anything new behind the account menu.

### 4.2 Hero (`components/surah-list/HomeHero.tsx`)

Working well: Arabic title as the visual anchor, the jade radial glow, jump field as the single primary action, honest one-line value prop. Genuinely restrained — do not add an illustration.

Gaps:

1. **No "continue where you left off" inside the hero.** `ContinuePrompt` renders *below* it as a separate block. For a returning user, resume is the primary action and the jump field is secondary. Consider having the hero swap its CTA when a saved position exists.
2. **No account value prop.** Nothing anywhere on the home page states what signing in gives you (bookmarks sync, hifz tracking, goals, streaks). This is the direct cause of "people log in but don't stay" — they never learn there's anything to come back for.
3. **Gold "Directory" eyebrow** (`SurahListPage.tsx:21`) fails contrast — switch to `--gold-ink`.
4. `text-5xl`/`6xl` Arabic with `leading-[1.5]` is safe, but check the KFGQPC font's tall diacritics at 6xl — `leading-[1.35]` is usually enough and tightens the composition.

### 4.3 Sections the home page is missing

Current order: Hero → ContinuePrompt → QuickAccess → All 114 Surahs. That is a directory, not a product. Recommended order:

1. **Hero** (resume-aware)
2. **Continue / Today** — resume card + today's streak + goal ring in one row. One glance, whole state.
3. **Your practice** *(signed in)* / **Why create an account** *(signed out)* — the missing conversion section. Four lines: bookmarks sync, hifz tracking, daily goals, notes. This is the retention section.
4. **QuickAccess** — keep, but demote below the practice row.
5. **Pick up a short surah** — 6–8 curated tiles (Fatihah, Ikhlas, Mulk, Kahf, Yasin, Rahman, the last 10 of Juz 30). Reduces "114 items, where do I start" paralysis. Your footer already curates these; the home page should too.
6. **All 114 Surahs** — add filter chips (Makki / Madani / Juz / length) and a "shortest first" sort. 114 uniform cards is a wall.
7. **Footer** — already strong.

### 4.4 Surah list & cards (`SurahCard.tsx`)

Working well: the octagonal gold frame is a genuinely nice, non-clichéd detail; two-column layout with Arabic as the trailing anchor is correct; `content-visibility: auto` with `contain-intrinsic-size` on 114 cards is a smart perf call.

Gaps:

1. Gold text (number, Makki badge) — contrast, as above.
2. **`dir="rtl"` on the grid** (`SurahListPage.tsx:39`) makes cards flow right-to-left in mushaf order. Defensible, but for an English-language UI the reading order of a 2-column grid flipping is a real "wait, what" moment. Worth an A/B or at minimum a settings toggle.
3. **No memorised/read state on the card.** You track `MemorisedAyah` and `ProgressEvent` — a thin progress bar along the card's bottom edge would make the whole directory feel like *your* progress rather than a static index. Strongest single retention change in the list view.
4. `hover:-translate-y-px` on 114 cards is subtle to the point of invisible; combine with the border+shadow change you already have (you do) and it's fine.

### 4.5 Auth (`AuthShell.tsx`, `LoginForm.tsx`)

Working well: single-composition layout (not a dashboard), stone wash + jade bloom + SVG paper grain, the `قرآن` watermark, staggered motion entrance, `noValidate` with custom validation, email preserved and password cleared on failure, full navigation after sign-in to guarantee the cookie is read. This is a well-built auth flow.

Gaps:

1. **Inputs have no visible border** (`--input` at 1.52:1) and `bg-card/60` on top of a gradient makes the field edge weaker still. Use `--border-strong`.
2. **Field labels are `text-xs text-muted-foreground`** — at 12px on a borderline-contrast token this is the weakest text in the app, on the screen where clarity matters most. Go `text-sm` and `--foreground` at `font-medium`.
3. **No password visibility toggle.** Single largest cause of failed logins on mobile.
4. **No social / passwordless option.** Credentials-only is a conversion tax; a magic link fits a devotional app well (you already have Resend wired).
5. **Nothing tells the user what they get.** The auth page subtitle is the last chance to say "your bookmarks, hifz progress, and goals, on every device."
6. `motion` is imported *only* here (`AuthShell` is the sole `motion/react` consumer in the codebase). Either use it more or replace these three entrances with the CSS `animate-fade-up` you already have and drop the dependency — currently you're shipping the whole motion runtime for one screen.

### 4.6 Reader

The reader is the most mature part of the app — tajweed spans using `display: contents` to avoid breaking Arabic shaping (`globals.css:267`) is a genuinely sophisticated fix, and the token-per-rule tajweed system is well structured. Only issues: the `data-theme` bug (§2.2), and `--tj-slnt` at `oklch(0.55 0 0)` = grey, which on parchment reads as "not loaded yet" rather than "silent".

---

## 5. Animation recommendations

Current state: `motion` used on exactly one screen; `animate-fade-up` / `animate-fade-in` utilities defined; duration tokens (`--dur-fast/base/slow/theme`) and easings already in place and mostly respected. The system is well-specified but barely used. Suggestions, ordered by value-per-effort:

**Add these:**

1. **Global reduced-motion guard.** Wrap `scroll-behavior: smooth` in `@media (prefers-reduced-motion: no-preference)`, and add a blanket `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`. Highest priority — this is an accessibility fix, not a polish item.
2. **Ayah target highlight.** You have `transition-colors duration-[1500ms]` with `bg-primary/5` on `isTarget` (`AyahBlock.tsx`). Make it a one-shot keyframe that blooms to `primary/10` and decays to transparent over ~1.2s, so deep links visibly announce their target instead of leaving a permanent tint.
3. **Word-sync pulse during recitation.** `useHighlightedWord` already drives per-word highlight. A ~120ms background fade-in on the active word (never a transform — transforms break Arabic shaping) makes audio-follow feel alive. Cap at `--dur-fast`.
4. **Bookmark / hifz confirmation.** A 200ms scale-and-settle on the icon plus a colour flip. Micro-rewards on the exact actions you want repeated — cheap, and it's the mechanism behind habit formation.
5. **Streak / goal ring fill.** Animate `stroke-dashoffset` over ~600ms on mount in `GoalsView`/`ProgressView`. The one place a longer animation earns its keep.
6. **Sheet / sidebar / study panel.** These are the structural transitions the spec called `motion` in for; they currently rely on shadcn's `animate-in`/`animate-out`. That's fine — just verify the study panel slide uses `--dur-slow` + `--ease-out` for consistency.

**Remove or reconsider:**

7. **The 114-card stagger** (`animationDelay: min(index * 8, 200)ms` in `SurahListPage.tsx:49`) fights `content-visibility: auto`: off-screen cards skip paint, so their entrance animation has often already elapsed by the time they scroll in, and cards near the boundary can flash. Either drop the stagger and use a single container fade, or move to a scroll-triggered `animation-timeline: view()`.
8. **`disableTransitionOnChange={false}`** in `providers.tsx` — you deliberately allow the theme crossfade, and you scoped the transition to `html` only rather than `*` (correct). But `html`'s `background-color`/`color` transition doesn't cover cards, borders, or the sidebar, so theme switching currently animates the page background while every surface snaps. Either add the same transition to a short, explicit list of surfaces, or set `disableTransitionOnChange={true}` and let it snap cleanly. Half-animated is worse than either.

**Never animate:** Arabic glyph position, `font-size` on the reader, layout width of the reading column, or anything inside `.tj-span` (shaping breaks). Keep every interaction animation at or under 200ms; reserve 400–600ms for progress reveals only.

---

## 6. Fix order

| # | Change | Effort | Impact |
|---|---|---|---|
| 1 | `[data-theme="dark"]` → `.dark` for tajweed | 1 line | Dark-mode reader correctness |
| 2 | `--gold-ink` split; swap the 4 gold *text* usages | ~30 min | Light-mode legibility |
| 3 | `--muted-foreground` → `#5c655f`; `--input` → `--border-strong` | ~15 min | Passes AA; forms read as forms |
| 4 | Global `prefers-reduced-motion` guard | ~10 min | Accessibility |
| 5 | Semantic tokens (success/warning/info) | ~20 min | Unblocks goals/hifz/progress UI |
| 6 | Dark background lift `#0b0d0c` → `#101413` | 1 line | Long-session comfort |
| 7 | Home "why sign in" section + resume-aware hero | ~half day | **Retention** |
| 8 | Progress bar on `SurahCard` | ~2h | **Retention** |
| 9 | Streak in navbar | ~1h | **Retention** |
| 10 | Sepia reader theme | ~2h | Long-session retention |
| 11 | Password visibility toggle + stronger labels | ~30 min | Login completion |

Items 7–9 are the ones that answer "so people stay and work on it more." Items 1–6 are the ones that stop it feeling broken.

---

*Review only. No files were changed.*
