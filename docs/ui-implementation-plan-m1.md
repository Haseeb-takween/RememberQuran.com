# RememberQuran.com — UI Implementation Plan (Milestone 1)

**Status**: PLANNING — do not implement until instructed.
**Sources**: `docs/RememberQuran_UI_Design_Spec_M1.md` (authoritative base) · frontend-design skill · ui-ux-pro-max rules · project brief §3.1
**Stack**: Next.js 16 App Router · React 19 · Tailwind CSS v4 · shadcn/ui · next-themes · motion
**Last updated**: 2026-07-09

---

## 1. Design Point of View (the one-sentence contract)

> **A quiet, paper-like reading room. The only vivid thing on screen is the Word of Allah.**

Everything below serves this. The interface recedes: warm paper surfaces, near-silent chrome in a system sans, translations in a humanist serif — and the Uthmani script as the undisputed hero. The design's memorability comes from *restraint executed precisely*: perfect harakat rendering, generous line-height, two quiet signature motions (the sliding toggle pill and the sidebar's gliding active indicator), and a word-tooltip that feels instant and native. No gradients, no patterns, no decoration. This is intentional minimalism, not absence of design.

**Anti-goals** (from spec §8 + brief): no entrance animation on Quranic text, ever. No bounce/elastic near the reading column. No page wipes. No particles, parallax, or textures. No purple-gradient AI-slop aesthetics. One accent colour only.

---

## 2. Adaptations to the Spec (spec intent preserved, mechanics updated)

The spec was written Tailwind-v3-style; this project runs Tailwind v4 and Next.js 16. Four deliberate adaptations:

| # | Spec says | We do instead | Why |
|---|---|---|---|
| 1 | Tokens in `tailwind.config.ts` `extend.colors` | Tokens in `globals.css` via `@theme inline` (Tailwind v4 convention; shadcn's current init targets v4) | v4 has no config-file color extension; CSS-first tokens are the supported path |
| 2 | `[data-theme="dark"]` selector | next-themes `attribute="class"` + `.dark` class + `@custom-variant dark` | shadcn components ship expecting `.dark`; fighting that convention costs more than it buys. Behaviour identical: class on `<html>`, persisted to localStorage |
| 3 | Spec token `--accent` = brand green | Brand green maps to shadcn `--primary`; shadcn's own `--accent` stays a subtle warm hover-tint | In shadcn semantics, `primary` is the brand action colour and `accent` is a hover wash. Mapping wrongly breaks every generated component |
| 4 | Audio-dock: visible empty 64px strip with border | Slot stays mounted at the exact spec position (`data-slot="audio-dock"`) but **collapsed (`h-0`) in M1**; M2 expands it to `h-16` with a slide-up entrance | A visibly empty bordered strip reads as "broken" to users and wastes 64px of phone viewport for a whole milestone. The structural guarantee (slot exists, layout doesn't restructure) is preserved |
| 5 | Install list includes `progress` | Defer `progress` to M4 | It's unused until streaks/progress; keep M1 lean |

**Pre-implementation rule from `AGENTS.md`**: Next.js 16 has breaking changes — read the relevant guides in `node_modules/next/dist/docs/` **before writing any code** (routing, fonts, metadata at minimum).

---

## 3. Design Tokens (complete, both modes — copy-paste target for `globals.css`)

Warm stone neutrals (never pure white/black), one muted teal-green accent. All shadcn slots filled so generated components work untouched. **Never hardcode a hex in a component.**

```css
:root {
  --background: hsl(40 25% 97%);        /* warm paper */
  --foreground: hsl(20 8% 15%);         /* warm near-black */
  --card: hsl(40 20% 99%);
  --card-foreground: hsl(20 8% 15%);
  --popover: hsl(40 20% 99%);
  --popover-foreground: hsl(20 8% 15%);
  --primary: hsl(165 45% 32%);          /* brand green — the ONE accent */
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(40 15% 92%);         /* warm light surface */
  --secondary-foreground: hsl(20 8% 15%);
  --muted: hsl(40 15% 92%);
  --muted-foreground: hsl(20 6% 42%);   /* verify 4.5:1 on --background */
  --accent: hsl(40 18% 90%);            /* hover wash — NOT the brand green */
  --accent-foreground: hsl(20 8% 15%);
  --destructive: hsl(8 55% 45%);
  --border: hsl(20 8% 88%);
  --input: hsl(20 8% 88%);
  --ring: hsl(165 45% 32%);
  --radius: 0.5rem;                     /* calm, not pill-y */
}

.dark {
  --background: hsl(20 8% 10%);         /* warm charcoal, not black */
  --foreground: hsl(40 15% 92%);
  --card: hsl(20 8% 12%);
  --card-foreground: hsl(40 15% 92%);
  --popover: hsl(20 8% 13%);
  --popover-foreground: hsl(40 15% 92%);
  --primary: hsl(165 40% 55%);          /* lighter, slightly desaturated — not inverted */
  --primary-foreground: hsl(20 8% 10%);
  --secondary: hsl(20 8% 16%);
  --secondary-foreground: hsl(40 15% 92%);
  --muted: hsl(20 8% 16%);
  --muted-foreground: hsl(40 8% 62%);
  --accent: hsl(20 8% 18%);
  --accent-foreground: hsl(40 15% 92%);
  --destructive: hsl(8 50% 55%);
  --border: hsl(20 8% 20%);
  --input: hsl(20 8% 20%);
  --ring: hsl(165 40% 55%);
}
```

**Build-time verification task** (ui-ux-pro-max §1): run every text/background pair through a contrast checker — body ≥4.5:1, muted-foreground ≥4.5:1, primary-as-text ≥4.5:1 in **both** modes independently. Adjust lightness values if any pair fails; do not ship on assumption.

---

## 4. Typography System

| Role | Font | Loading | Size / line-height |
|---|---|---|---|
| **Arabic (hero)** | KFGQPC Uthmanic Hafs `.woff2`, self-hosted | `next/font/local`, `preload: true`, `display: swap`, `adjustFontFallback` on | Steps **22 / 26 / 30 / 34px** (user-controlled, default 26). **Line-height ≈ 2.0** — harakat need vertical air; tight leading clips diacritics |
| **Translations (reading voice)** | Source Serif 4 (variable) | `next/font/google` | 15px / 1.7 |
| **UI chrome** | System sans stack (Tailwind default) | zero bytes | 13–14px controls, `tabular-nums` on all counts/ayah numbers |

- Reading column: `max-w-[70ch]` on translation text (line-length 65–75ch rule); Arabic block spans the column at its own rhythm.
- Every Arabic container: `dir="rtl" lang="ar"`. Translation blocks: explicit `dir="ltr"`.
- Arabic font sizes **do not shrink on mobile** — the user's chosen step applies at all breakpoints (spec §9).
- Top bar surah title: serif for the transliterated name + Uthmani for the Arabic name side by side.
- **Prep task**: acquire `UthmanicHafs.woff2` from the King Fahd Complex (fonts.qurancomplex.gov.sa) or quran.com's open assets; document the source in the data-sources register (§3 of `docs/plan.md`).

Icons: **Lucide only** (ships with shadcn), one stroke width throughout, never emoji (ui-ux-pro-max hard rule).

---

## 5. Motion System

### 5.1 Motion tokens (defined once, used everywhere — no ad-hoc durations)

```
--dur-fast:   100ms   /* exits, press feedback */
--dur-base:   150ms   /* standard micro-interactions */
--dur-slow:   200ms   /* structural: sidebar, sheet */
--dur-theme:  250ms   /* theme crossfade */

--ease-out:  cubic-bezier(0.16, 1, 0.3, 1)   /* entrances — fast start, soft settle */
--ease-in:   cubic-bezier(0.7, 0, 0.84, 0)   /* exits */
(color/bg transitions: default `ease`)
```

Rules (ui-ux-pro-max §7): **transform/opacity only** — never animate width/height/top/left in micro-interactions. Exits ≈ 60–70% of entrance duration. Every animation interruptible; none block input. Nothing may cause layout shift.

### 5.2 Tooling split (spec §8 — don't over-engineer)

- **CSS transitions**: all hover/press/focus feedback, tooltips, crossfades, theme switch. (The overwhelming majority.)
- **`motion` library**: exactly three uses in M1 — (1) Sheet/Dialog structural transitions where Radix + shadcn already wire it via CSS (so effectively zero custom motion here), (2) the **layoutId sliding pill** in the two ToggleGroups, (3) the **layoutId active-surah indicator** in the sidebar. That's it.
- Wrap the app in `<MotionConfig reducedMotion="user">` — motion animations collapse to instant for `prefers-reduced-motion` users automatically. CSS transitions ≤200ms may remain (spec §8 allows this).

### 5.3 The "never animate" list (verbatim contract from spec §8)

1. Arabic text on load or scroll — no fade-in, no blur-in, no stagger per ayah. Read dozens of times daily; entrance animation fatigues.
2. Font-size changes — **instant**, no transition (animating font-size reflows thousands of glyphs = jank; feedback comes from the control's pill, not the text).
3. Bounce/elastic easing anywhere near the reading column.
4. Full-screen wipes between surahs.
5. Backgrounds: no patterns, particles, parallax.

---

## 6. Micro-Interaction Catalog (the detailed contract)

Every interactive element, every state. Format: **state → treatment @ duration/easing [tool]**.

### 6.1 Arabic word — the signature interaction (`arabic-word.tsx`)

The word span is **pre-padded** (`px-0.5 py-1 rounded-sm`) so hover only changes background colour — zero layout shift, zero text movement.

| State | Treatment |
|---|---|
| Rest | Plain text, padding invisible |
| Hover (pointer-fine only) | Background `--accent` (warm wash) fade-in @ 120ms ease-out; `cursor-pointer` (signals future M2 click) |
| Tooltip open (desktop) | Radix Tooltip: fade + translateY(2px→0) + scale(0.98→1) @ 140ms `--ease-out`; exit fade-only @ 100ms. `delayDuration=150`, `skipDelayDuration=300` — first hover waits a beat, sweeping across words feels instant |
| Focus-visible | 2px `--ring` ring; tooltip opens on focus (Radix native) — keyboard users get full parity; word spans get `tabIndex={0}` |
| Tap (touch, `hover: none`) | Radix Popover: press tint within 80ms; panel scale(0.96→1) + fade @ 160ms ease-out, transform-origin at the word; tap-away or Esc dismisses @ 120ms fade |
| `isHighlighted` (M2 audio sync — state built now, unused) | Background `--primary` at 15% opacity, 150ms ease-in-out |
| Reduced motion | Fade only (no scale/translate); same durations |

Tooltip content (shared component between Tooltip and Popover — single source, spec §5): the word in Uthmani (larger), meaning in serif below, transliteration in muted small caps if present in API data. Touch-capability detected via `useMediaQuery("(hover: none)")` (small custom hook — not in shadcn by default).

*Honest note on touch targets*: word-level targets cannot meet 44px strictly (they're inline text — same constraint Quran.com accepts). Mitigation: line-height 2.0 + `py-1` padding gives ≈40px+ effective vertical hit area at default font size; `touch-action: manipulation` kills the 300ms tap delay.

### 6.2 Ayah block & deep-link arrival

| Interaction | Treatment |
|---|---|
| Ayah blocks at rest / on scroll | **Static. No hover effects, no reveals.** The reading column is sacred ground (spec §8) |
| Arriving at `/2/255` | `scrollIntoView({ behavior: "smooth" })` (→ `"auto"` under reduced motion), `scroll-margin-top` = top-bar height + 16px; then a one-time background wash `--primary`/10% → transparent over 1500ms ease-out. Opacity-only, gentle, self-clearing |
| Ayah number badge | Static bordered circle, `tabular-nums`. No animation |

### 6.3 Sidebar (desktop) & Sheet (mobile)

| Interaction | Treatment |
|---|---|
| Sidebar collapse/expand | shadcn Sidebar's built-in CSS width transition, tuned to 200ms `--ease-out` [CSS — no custom motion] |
| Surah item hover | Background `--accent` wash @ 120ms; no transform |
| Surah item press | Background deepens (`--secondary`) within 80ms [CSS `active:`] |
| **Active surah indicator** | 2px `--primary` bar on the item's leading edge, **glides between items via `motion` layoutId** — gentle spring (stiffness ≈ 500, damping ≈ 40, no overshoot visible). Signature motion #1. Reduced motion: jumps instantly (MotionConfig handles it) |
| Active surah text | `--primary` colour + medium weight, 150ms colour transition |
| Sheet (mobile) open | Slide-in from left @ 200ms `--ease-out` + overlay fade to 50% black scrim; exit 150ms `--ease-in` [shadcn/Radix built-in, durations tuned] |
| Sheet dismiss affordances | Close button (≥44px), scrim tap, Esc — all native Radix |
| List performance | `ScrollArea`, 114 plain items — **measure before virtualizing**; virtualize only if a real jank shows (don't over-engineer) |

### 6.4 Command palette (⌘K / Ctrl+K)

| Interaction | Treatment |
|---|---|
| Open | Dialog fade + scale(0.98→1) @ 150ms `--ease-out`, input autofocused |
| Close | Fade @ 100ms `--ease-in` |
| Filtering | Instant (114 static items, zero debounce needed) |
| Input grammar | Fuzzy surah name/number, plus direct `2:255` → navigates straight to the ayah |
| Trigger | Keyboard shortcut + a visible search button in the top bar (keyboard-only feature ≠ discoverable feature); label shows `⌘K` on Mac, `Ctrl K` on Windows |

### 6.5 Top bar

| Interaction | Treatment |
|---|---|
| Stickiness | `sticky top-0`; **border/shadow fades in only after scrolling begins** — IntersectionObserver sentinel (no scroll listener), border-color fade @ 150ms. At rest the top bar is invisible chrome; scrolled, it quietly separates |
| Prev/next surah buttons | ≥44px icon buttons; hover `--accent` wash @ 120ms; press `scale(0.97)` @ 100ms [CSS `active:`]; disabled (surah 1 / 114) at 40% opacity + `cursor-default`, still visible (predictable layout) |
| Controls wrap | On narrow viewports controls wrap to a second row — tap targets never shrink below 44px (spec §9) |

### 6.6 ToggleGroups — translation display & font size

| Interaction | Treatment |
|---|---|
| **Selected pill** | Shared rounded pill slides behind the selected option via `motion` layoutId @ ~180ms gentle spring. Signature motion #2. Reduced motion: instant reposition |
| Option hover | Text colour lifts to `--foreground` @ 120ms |
| Font size change effect | Text re-renders at new size **instantly** (see never-animate list) — the pill's glide *is* the feedback |
| Translation show (Arabic-only → +1 → +2) | Newly mounted translation blocks **fade in opacity 0→1 @ 150ms ease-out. No height animation** — on a 286-ayah surah, animating collapse height on every block simultaneously means hundreds of parallel reflows. Removal: instant unmount (exit-faster principle, taken to its logical end) |
| Semantics | Radix ToggleGroup = radio semantics, arrow-key navigation free |

### 6.7 Theme toggle

| Interaction | Treatment |
|---|---|
| Control | Icon button: sun/moon crossfade + 90° rotate @ 200ms [CSS only — the standard shadcn pattern] |
| Page response | `background-color` + `color` transition @ 250ms ease on **body and the few major surfaces only** (sidebar, top bar, cards). **Never `* { transition }`** — repainting every node janks |
| First paint | Transitions gated behind a mounted flag so initial theme application is instant (no flash of animated theme on load); next-themes handles no-FOUC script injection |
| Persistence | localStorage via next-themes; `defaultTheme="system"` respected |

### 6.8 Loading & navigation

| Interaction | Treatment |
|---|---|
| Verse loading | Skeletons **shape-matched to ayah blocks** — RTL-aligned bars where Arabic goes, LTR serif-height bars where translation goes. Reserved space = zero CLS (ui-ux-pro-max §3) |
| Skeleton timing | Server-rendered pages arrive complete (no skeleton on first paint); skeletons appear only for client-side transitions, with pulse animation |
| Surah → surah navigation | New content mount-fades in @ 150ms opacity-only [CSS animation keyed on pathname]. No exit animation — instant swap + soft entrance reads as fast |
| Route change a11y | Focus moves to the main content region after navigation (screen-reader orientation, ui-ux-pro-max §9) |

### 6.9 Universal states

- **Focus-visible**: `ring-2 ring-ring ring-offset-2` on every interactive element. Never removed, never `outline: none` without replacement.
- **Press feedback**: every tappable control responds within 100ms (tint or scale 0.97).
- **Disabled**: 40% opacity + semantic `disabled` attribute + no cursor change to pointer.
- **All transitions interruptible**; nothing gates input.

---

## 7. Component Build Map (shadcn base → our component)

| Our component | shadcn/Radix base | Key props/state designed now for later milestones |
|---|---|---|
| `surah-sidebar.tsx` | `Sidebar` + `ScrollArea` | — |
| `surah-sheet.tsx` | `Sheet` side="left" | Shares `SurahList` inner component with sidebar (one data render, two shells) |
| `surah-command.tsx` | `Command` + `Dialog` | — |
| `top-bar.tsx` | composition | — |
| `theme-toggle.tsx` | `Button` + next-themes | — |
| `ayah-block.tsx` | composition | **Slot below translations** (collapsible panel area) — M3 tafsir & morphology attach here without restructuring |
| `arabic-word.tsx` | `Tooltip` / `Popover` | `onWordClick?` prop (unused M1 → M2 word audio); `isHighlighted?: boolean` (M2 sync); `isPlaying?: boolean` |
| `word-meaning-content.tsx` | shared inner | Single content component used by both Tooltip and Popover |
| `translation-toggle.tsx` | `ToggleGroup` single | Options: Arabic only / +1 / +2 |
| `font-size-stepper.tsx` | `ToggleGroup` single | 4 fixed steps — not a Slider (spec §4) |
| `audio-dock-placeholder.tsx` | plain div | `data-slot="audio-dock"`, `h-0` in M1 (see §2 adaptation 4) |
| skeletons | `Skeleton` | Shape-matched variants: `AyahSkeleton` |

Install set (trimmed): `sidebar sheet command toggle-group tooltip popover switch dialog skeleton scroll-area` + `npm i motion next-themes`.

---

## 8. Layout (from spec §3, confirmed)

- **Desktop ≥768px**: fixed sidebar (collapsible, default open) + fluid content column; reading column centered, `max-w-3xl`-ish with `max-w-[70ch]` on translation text.
- **Mobile <768px**: hamburger → Sheet. Sidebar never forced visible.
- **Vertical order**: TopBar (sticky) → main (scroll) → audio-dock slot (collapsed).
- `min-h-dvh` (not `100vh` — mobile URL-bar rule).
- Content priority mobile-first; no horizontal scroll at any width from 360px up.

---

## 9. Accessibility Checklist (gate before "UI done")

- [ ] Contrast: all token pairs ≥4.5:1 body / ≥3:1 large, verified in **both** themes with a tool, not by eye
- [ ] `dir="rtl" lang="ar"` on every Arabic container; `dir="ltr"` on translation blocks
- [ ] Word tooltips keyboard-reachable (`tabIndex={0}`, opens on focus); Command palette = full keyboard alternative to sidebar (spec §10)
- [ ] All icon-only buttons have `aria-label`
- [ ] Focus order matches visual order; skip-to-content link before the sidebar
- [ ] `prefers-reduced-motion`: MotionConfig for motion lib; long washes (deep-link highlight) reduced to static; smooth-scroll → auto
- [ ] Touch targets ≥44px for all chrome controls; `touch-action: manipulation` on interactive text
- [ ] Heading hierarchy: one `h1` per page (surah name), sequential levels
- [ ] Theme respects `system` default; no flash of wrong theme
- [ ] Zoom never disabled; layout survives 200% text zoom

---

## 10. Build Order (when implementation is green-lit)

**Phase 0 — Pre-flight**
Read `node_modules/next/dist/docs/` guides (AGENTS.md warning — Next 16 breaking changes) → acquire Uthmanic Hafs woff2 + record source in data register → `shadcn init` (Tailwind v4 flow) → paste token block (§3) → contrast-verify tokens → fonts via next/font → `next-themes` provider + `MotionConfig reducedMotion="user"` in root layout.

**Phase 1 — Shell**
Layout grid (sidebar / topbar / main / dock slot) → TopBar (title, prev/next, scroll-border behaviour) → SurahSidebar + SurahSheet (shared `SurahList`) → ThemeToggle with crossfade → active-surah layoutId indicator.

**Phase 2 — Reading surface**
`AyahBlock` (static, slot reserved) → `ArabicWord` + shared meaning content + Tooltip/Popover split via `useMediaQuery("(hover: none)")` → `TranslationBlock` (serif, 70ch) → Bismillah header → ayah-number badge → `AyahSkeleton`.

**Phase 3 — Controls**
Translation ToggleGroup + font-size ToggleGroup with the sliding pill → Command palette (⌘K + top-bar button, `2:255` grammar) → deep-link scroll + arrival wash.

**Phase 4 — Micro-interaction & polish pass**
Walk §6 catalog top to bottom, verify each state exists → reduced-motion audit → theme-switch transition gating → route-change focus management.

**Phase 5 — Responsive & a11y audit**
375 / 414 / 768 / 1024 / 1440 px passes → §9 checklist gate → keyboard-only walkthrough → both-themes visual review side by side (dark designed *with* light, not derived from it).

---

## 11. What This Plan Deliberately Does NOT Include (scope guard)

- No bookmarks/notes UI (M4), no tafsir panel UI (M3 — only its slot), no audio UI (M2 — only the collapsed dock slot and the dormant word props)
- No View Transitions API, no scroll-linked animations, no virtualization until measured need, no custom cursor, no textures/grain — all either over-engineering or explicitly against the spec's restraint rules
- No additional fonts beyond the three roles in §4
