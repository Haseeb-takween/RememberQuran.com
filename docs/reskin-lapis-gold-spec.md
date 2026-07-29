# RememberQuran — Full Re-skin Spec: "Lapis & Gold"

**Proposal only — no files were modified.** Date: 2026-07-25
Scope: full re-skin — core tokens, semantic layer, tajweed palette, plus hero / card / hover / ornament treatments.
Companion doc: `docs/ui-ux-review-palette.md` (the audit this builds on).

---

## 1. Why lapis, not "some other green"

You asked for something more attractive. The trap with a Quran app is that "attractive" usually means "more saturated green," which lands you in the same visual bucket as every competitor.

**Lapis lazuli blue with gold gilding is the historically canonical Quran illumination palette.** Ultramarine ground from lapis was the most expensive pigment in the medieval world and was reserved for the most important manuscripts — Qurans above all — paired with gold leaf on cream vellum. So this is not a departure from the tradition to chase modern taste; it is arguably *more* rooted in it than the green you have now, while being far more visually striking on a screen.

Practical consequences:

- **Blue is the highest-legibility accent hue** on warm paper backgrounds and holds up better than green at small sizes.
- **Gold finally works.** Against a lapis-and-cream base, gold reads as gilding rather than as "slightly dirty yellow" — which is what it currently does against jade.
- **Green is retained as the success colour.** You don't lose the association; you promote it to a semantic role where it actually carries meaning (memorised, on-track, completed).
- **One real cost:** lapis occupies the blue-violet hue region that your tajweed palette currently uses for madda and idgham. §5 resolves that collision — it is the main technical work in this re-skin.

---

## 2. Core tokens — Light ("Illuminated parchment")

All ratios WCAG 2.1, measured against the stated surface. Replaces the `:root` block in `globals.css:69–97`.

| Token | Value | Contrast | Note |
|---|---|---|---|
| `--background` | `#faf7f0` | — | Warm pearl. Lower chroma than your `#f7f3e8`, so gold and lapis both sit cleanly on it |
| `--foreground` | `#16192b` | **16.25** on bg | Ink with a lapis undertone, not neutral black — ties the whole light theme to the accent |
| `--card` | `#fffdf8` | fg **17.10** | Near-white vellum, one clear step above background |
| `--popover` | `#fffdf8` | — | Matches card |
| `--primary` | `#2b4290` | **8.59** on bg | Lapis. White-on-primary **9.19** — buttons are effortless |
| `--primary-foreground` | `#ffffff` | 9.19 | |
| `--primary-hover` *(new)* | `#223673` | — | Explicit hover step; currently components improvise with opacity |
| `--secondary` | `#f0ece1` | fg 14.73 | Warm parchment step |
| `--secondary-foreground` | `#16192b` | 14.73 | |
| `--muted` | `#f0ece1` | — | |
| `--muted-foreground` | `#565b6e` | **6.30** bg / **5.71** muted+accent | Passes on every surface — fixes the audit's §2.3 failure |
| `--accent` | `#e9ecf6` | fg 14.73 | Lapis-tinted wash. This is the hover/active surface |
| `--accent-foreground` | `#22305e` | **10.77** on accent | |
| `--border` | `#e6e0d3` | — | Cosmetic dividers only |
| `--border-strong` *(new)* | `#948d7c` | **3.25** on card | Inputs, control edges, table rules — the audit's §2.4 fix |
| `--input` | `#948d7c` | 3.25 | Fields must read as fields |
| `--ring` | `#2b4290` | 8.59 | |
| `--gold-ink` *(new)* | `#8a6420` | **5.00** on bg / 4.53 on muted | Gold used as **text**: surah numbers, Makki badge, eyebrow labels, footer ayah |
| `--gold-ornament` | `#c39a3e` | decorative | Octagon strokes, footer hairline, gradients. 2.45:1 — never text |
| `--radius` | `0.625rem` | — | Up from `0.5rem`. Slightly softer reads as more polished at this density |
| `--sidebar` | `#f5f1e8` | fg 15.42 | |
| `--sidebar-accent` | `#e9ecf6` | — | |
| `--sidebar-border` | `#e6e0d3` | — | |

## 3. Core tokens — Dark ("Lapis night")

Replaces the `.dark` block in `globals.css:100–128`.

| Token | Value | Contrast | Note |
|---|---|---|---|
| `--background` | `#101426` | — | Deep lapis-black. Lifted off pure black (your `#0b0d0c`) to stop diacritic halation — see audit §3.2 |
| `--foreground` | `#eae8f2` | **15.06** on bg | Cool off-white, never `#fff` |
| `--card` | `#171c32` | fg 12.97-equiv | One step up, visibly lapis rather than grey |
| `--popover` | `#171c32` | — | |
| `--primary` | `#9db0ee` | **8.59** on bg | Lifted lapis. Ink-on-primary **8.88** |
| `--primary-foreground` | `#0d1020` | 8.88 | |
| `--primary-hover` *(new)* | `#b0c0f2` | — | Dark mode hovers go *lighter* |
| `--secondary` | `#1c2238` | fg 12.97 | |
| `--secondary-foreground` | `#eae8f2` | 12.97 | |
| `--muted` | `#1c2238` | — | |
| `--muted-foreground` | `#a8adc0` | **8.18** bg / 6.69 accent | |
| `--accent` | `#20263d` | fg 12.32 | |
| `--accent-foreground` | `#eae8f2` | 12.32 | |
| `--border` | `#262c44` | — | Cosmetic |
| `--border-strong` *(new)* | `#626a88` | **3.15** on card | |
| `--input` | `#626a88` | 3.15 | |
| `--ring` | `#9db0ee` | 8.59 | |
| `--gold-ink` *(new)* | `#e0bb6b` | **9.99** on bg | |
| `--gold-ornament` | `#e0bb6b` | — | Same value in dark; alias both names so components use one API |
| `--sidebar` | `#0d1020` | fg 15.58 | Recessed below background — reads as "behind" the content |
| `--sidebar-accent` | `#20263d` | — | |
| `--sidebar-border` | `#262c44` | — | |

## 4. Semantic layer (new — both themes)

The audit flagged that you have one accent and nothing for state. `HifzView`, `GoalsView` and `ProgressView` all need a done / on-track / behind vocabulary.

| Token | Light | on bg | Dark | on bg | Used for |
|---|---|---|---|---|---|
| `--success` | `#1d7a4f` | **4.97** | `#5cd196` | **9.58** | Memorised, goal met, streak alive |
| `--warning` | `#8a5c14` | **5.42** | `#e5b85c` | **9.86** | Behind on goal, streak at risk |
| `--info` | `#1a5f8f` | **6.38** | `#74c0ef` | **9.15** | Tips, "new", non-urgent notices |
| `--destructive` | `#a52f26` | **6.47** | `#f2897c` | **7.52** | Replaces the current `oklch()` values with explicit hex for light/dark parity |

Each also needs a `-foreground` (white on light-mode versions; `#0d1020` on dark-mode versions) and a `/10`–`/15` tinted surface variant for badge backgrounds.

## 5. Tajweed palette — retuned (the hard part)

**First, the bug from the audit:** `globals.css:245` uses `[data-theme="dark"]`, but `providers.tsx` sets `attribute="class"`. The selector must become `.dark` or none of the dark tajweed values ever apply. Fix this in the same pass.

**The collision:** lapis primary sits at roughly hue 265. Your current madda (260) and idgham (290) sit on top of it, so in the new theme a madda-coloured letter would look like a link. The re-tune moves the madda family to the **red** end — which is also the conventional tajweed colour for lengthening in most printed mushafs, so this is a correctness gain, not just an aesthetic one — and frees blue for hamzat wasl alone.

### Light mode

| Rule group | New value | Hex | Contrast on bg |
|---|---|---|---|
| `ham_wasl`, `laam_shamsiyah` | `oklch(0.52 0.13 215)` | `#207397` | 4.96 |
| `madda_normal`, `madda_permissible` | `oklch(0.52 0.20 27)` | `#ac3e1d` | 5.67 |
| `madda_necessary`, `madda_obligatory` | `oklch(0.45 0.22 20)` | `#9e0919` | 7.83 |
| `ghunnah` | `oklch(0.50 0.16 150)` | `#00802a` | 4.76 |
| `qalaqah` | `oklch(0.50 0.14 55)` | `#7d5b00` | 5.83 |
| `ikhafa`, `ikhafa_shafawi` | `oklch(0.52 0.17 335)` | `#b21b8f` | 5.70 |
| `idgham_ghunnah` | `oklch(0.48 0.19 300)` | `#9c00b6` | 6.35 |
| `idgham_wo_ghunnah`, `_mutajanisayn`, `_mutaqaribayn` | `oklch(0.54 0.08 300)` | `#8c5a96` | 4.88 |
| `iqlab` | `oklch(0.50 0.16 0)` | `#a62f5f` | 6.15 |
| `slnt` | `oklch(0.52 0.01 80)` | `#686a63` | 5.12 |
| `custom-alef-maksora` | `oklch(0.50 0.10 40)` | `#805835` | 5.83 |

### Dark mode (under `.dark`, not `[data-theme]`)

| Rule group | New value | Hex | Contrast on bg |
|---|---|---|---|
| `ham_wasl`, `laam_shamsiyah` | `oklch(0.78 0.13 215)` | `#76c4eb` | 9.45 |
| `madda_normal`, `madda_permissible` | `oklch(0.72 0.18 27)` | `#ea8264` | 6.85 |
| `madda_necessary`, `madda_obligatory` | `oklch(0.66 0.20 20)` | `#e2635d` | 5.37 |
| `ghunnah` | `oklch(0.75 0.16 150)` | `#00d175` | 9.02 |
| `qalaqah` | `oklch(0.78 0.14 60)` | `#cfb352` | 8.89 |
| `ikhafa`, `ikhafa_shafawi` | `oklch(0.74 0.17 335)` | `#ff6cd5` | 7.27 |
| `idgham_ghunnah` | `oklch(0.72 0.17 300)` | `#e66bfe` | 6.87 |
| `idgham_wo_ghunnah`, `_mutajanisayn`, `_mutaqaribayn` | `oklch(0.76 0.07 300)` | `#ce9fd8` | 8.33 |
| `iqlab` | `oklch(0.72 0.16 0)` | `#f275a0` | 6.81 |
| `slnt` | `oklch(0.70 0.01 80)` | `#9e9f98` | 6.84 |
| `custom-alef-maksora` | `oklch(0.76 0.09 45)` | `#cca981` | 8.31 |

**Two honest caveats.** `ikhafa` (335) and `iqlab` (0) are adjacent — distinguishable side by side, harder in isolation; this is also true of your current palette. And ~11 visual slots for 17 rules means some grouping is unavoidable, which is why `TajweedLegend` matters more than the colours themselves. Consider adding an underline/dotted-underline as a redundant channel for the two or three rules users confuse most — that also makes the reader usable for the ~8% of male users with red-green deficiency, who currently cannot separate `ghunnah` from `qalaqah` at all.

## 6. Component treatments

### 6.1 Navbar
- Background `bg-background/85` with `backdrop-blur-xl` — the lapis base makes a stronger blur look intentional rather than washed out.
- Scrolled state: swap the gold box-shadow for a **1px gradient hairline** — `linear-gradient(to right, transparent, var(--gold-ornament) 20%, var(--gold-ornament) 80%, transparent)` at ~50% opacity. Reads as gilding across the header edge.
- Active nav item: `bg-accent text-primary` still works, but add a 2px gold underline on the active item instead of relying on the fill alone.
- Move `ThemeToggle` and `AuthNav` out of `<nav>` (audit §4.1) while you're in the file.

### 6.2 Hero
- Replace the single jade radial with a **two-layer lapis bloom**: `radial-gradient(70% 100% at 50% 0%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 65%)` over a faint gold arc at the bottom edge — `radial-gradient(120% 60% at 50% 130%, color-mix(in oklch, var(--gold-ornament) 12%, transparent), transparent 70%)`. Lapis above, gilding below, mirroring an illuminated frontispiece.
- The Arabic title moves from `--primary` to **`--gold-ink`** in light mode and `--gold-ornament` in dark. Gold Arabic on parchment framed by lapis glow is the single highest-impact change in this document.
- Tighten `leading-[1.5]` → `leading-[1.35]`.
- Add a hairline gold border on the hero card: `border-[var(--gold-ornament)]/25`.

### 6.3 Surah cards
- Keep the octagonal frame — it's the best detail in the app. Stroke stays `--gold-ornament`; the **number inside switches to `--gold-ink`** so it's legible.
- Card border `--border`; hover border `--primary/35` (not gold — reserve gold for the static ornament so hover has its own signal).
- Hover: `bg-accent` + `shadow-md shadow-primary/8` + the existing `-translate-y-px`. Against lapis-tinted accent this now actually reads.
- Arabic surah name: `--primary/85 → --primary` on hover, unchanged logic, much stronger colour.
- Makki badge → `bg-gold-ink/12 text-gold-ink`; Madani → `bg-primary/10 text-primary`. Both now legal.
- **Add the progress rail** from the audit: a 2px bar pinned to the card's bottom inside edge, `--success` fill on `--border` track, width from memorised ayah count.

### 6.4 Auth
- Atmosphere: swap the jade bloom for lapis at 16% top-left and gold at 8% bottom-right. Keep the SVG paper grain — at `opacity-.035` over parchment it's doing real work.
- Watermark `قرآن` → `--gold-ornament` at `/[0.07]` light, `/[0.10]` dark. Currently primary-tinted; gold is better.
- Inputs: `border-[var(--border-strong)]`, drop `bg-card/60` for solid `bg-card` — translucent fields over a gradient is why they disappear.
- Labels → `text-sm font-medium text-foreground` (from `text-xs text-muted-foreground`).
- Add the password visibility toggle.

### 6.5 Footer
- Gold hairline already correct — it will simply look better now.
- Footer ayah → `--gold-ink` (currently fails contrast).
- Heading eyebrows → `--muted-foreground` at `tracking-widest`, unchanged.

### 6.6 Sepia reader theme (new, third surface)
For long memorisation sessions — the cheapest retention win from the audit. Reader-only, exposed in `ReaderSettingsPanel`, not the navbar.

| Token | Value | Contrast |
|---|---|---|
| `--reader-bg` | `#efe6d3` | — |
| `--reader-fg` | `#2b2419` | **12.37** |
| `--reader-accent` | `#2b4290` | high |
| Tajweed | reuse the **light** values | all pass on `#efe6d3` |

Implement as `.theme-sepia` scoped to the reader viewport so it overrides only reading surfaces, leaving chrome in the user's light/dark choice.

## 7. Migration notes

1. **Hardcoded `var(--brand-gold)` appears in 5 component files** — `Navbar.tsx:119`, `Footer.tsx:59,76`, `SurahCard.tsx:33,42,62`, `QuickAccess.tsx:57,66`, `SurahListPage.tsx:21`. Each needs a decision: ink or ornament. Text usages → `--gold-ink`; strokes and gradients → `--gold-ornament`. Keep `--brand-gold` as an alias of `--gold-ornament` for one release so nothing breaks mid-migration.
2. **`--primary-foreground` is currently `oklch(1 0 0)` in light** — fine, but set it to `#ffffff` explicitly for consistency with the rest of the sheet.
3. **Theme transition:** the audit noted `html` transitions background/color while every surface snaps. With a stronger palette this is much more visible. Either add the transition to an explicit surface list, or set `disableTransitionOnChange={true}`. Pick one before shipping the re-skin.
4. **Add the global reduced-motion guard** in the same pass — `scroll-behavior: smooth` is still unguarded at `globals.css:321`.
5. **Update `/api/og/ayah` and the media-maker presets** (`lib/media/presets.ts`) — social cards and exported ayah images carry hardcoded colours that will drift from the app if you skip them.
6. **Re-check `public/rq-logo-horizontal-*.svg` and `rq-mark.svg`** — if the mark carries jade, it needs a lapis variant or the navbar will clash with itself.

## 8. Suggested order

| # | Step | Effort |
|---|---|---|
| 1 | Core light + dark tokens in `globals.css` | ~30 min |
| 2 | Semantic layer | ~20 min |
| 3 | Tajweed retune **+ the `.dark` selector fix** | ~45 min |
| 4 | Gold ink/ornament split across the 5 component files | ~45 min |
| 5 | Hero, card, navbar treatments | ~2h |
| 6 | Auth polish + input borders + password toggle | ~1h |
| 7 | Logo/mark lapis variant | ~30 min |
| 8 | OG route + media-maker presets | ~1h |
| 9 | Sepia reader theme | ~2h |
| 10 | Reduced-motion guard + theme transition decision | ~30 min |

Steps 1–4 give roughly 80% of the visual change and are all low-risk token work. Everything from 5 onward is polish.

---

*Proposal only. No files were changed.*
