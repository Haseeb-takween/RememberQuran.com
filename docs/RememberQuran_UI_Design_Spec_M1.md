# RememberQuran.com — UI Design Spec
## Milestone 1: Core Reading Experience
Stack: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + motion (Framer Motion)

---

## 1. Tech setup

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js App Router, TypeScript | matches brief, matches Quran.com reference codebase |
| Styling | Tailwind CSS | required by shadcn/ui |
| Components | shadcn/ui (Radix primitives) | accessible by default, unstyled enough to keep the "clean, minimal" look |
| Dark mode | `next-themes` | handles class-based dark mode + persists to localStorage, works with shadcn out of the box |
| Motion | `motion` (npm package, formerly `framer-motion`) | structural transitions only — sidebar, sheet, page crossfade |
| Arabic font | `next/font/local` with a Uthmani (QPC v2 / KFGQPC Hafs) `.woff2` | self-hosted, subsettable, avoids FOUT on RTL text |
| English font | `next/font/google` — a serif (e.g. Lora or Source Serif 4) for translations, system sans for UI chrome | serif for reading, sans for controls — signals "content" vs "interface" |

Install:
```bash
npx shadcn@latest init
npx shadcn@latest add sidebar sheet command toggle-group tooltip popover switch dialog skeleton progress scroll-area
npm install motion next-themes
```

---

## 2. Folder structure

```
app/
  [surah]/[ayah]/page.tsx        # e.g. /2/255 — server component, fetches ayah data
  layout.tsx                      # wraps ThemeProvider, loads fonts
components/
  reading/
    surah-sidebar.tsx             # desktop Sidebar
    surah-sheet.tsx                # mobile Sheet (same data, different shell)
    surah-command.tsx             # Cmd+K jump-to-surah/ayah
    top-bar.tsx                   # surah name, prev/next, translation toggle, font stepper, theme switch
    ayah-block.tsx                 # one ayah: number, Arabic line, translation(s)
    arabic-word.tsx                # single word: Tooltip (desktop) / Popover (mobile)
    translation-toggle.tsx         # ToggleGroup: Arabic only / +1 / +2
    font-size-stepper.tsx          # ToggleGroup: 4 fixed sizes
    audio-dock-placeholder.tsx     # empty reserved strip — real player lands in Milestone 2
  ui/                              # shadcn generated components live here, do not hand-edit
lib/
  quran-api.ts                     # Quran Foundation / Al-Quran Cloud client
  types.ts                         # Surah, Ayah, Word, Translation types
```

---

## 3. Layout

- **Desktop**: fixed-width left `Sidebar` (surah list) + flexible content column. Sidebar is collapsible but defaults open.
- **Mobile**: sidebar becomes a `Sheet` triggered by a hamburger icon in the top bar. Never force it always-visible on small screens.
- **Top bar**: sticky, holds surah name + ayah number + prev/next arrows, translation `ToggleGroup`, font `ToggleGroup`, theme `Switch`.
- **Content column**: stacked `ayah-block` components, verse-by-verse by default.
- **Bottom strip**: reserved empty div, ~64px, `data-slot="audio-dock"` — do not remove this in Milestone 1 even though nothing renders there yet. Milestone 2's persistent mini player mounts here without a layout change.

```tsx
// app/[surah]/[ayah]/layout.tsx (simplified)
<div className="flex min-h-screen">
  <SurahSidebar className="hidden md:flex w-[180px] shrink-0" />
  <div className="flex-1 flex flex-col min-w-0">
    <TopBar />
    <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
    <div data-slot="audio-dock" className="h-16 border-t" />
  </div>
</div>
```

---

## 4. Component mapping (shadcn)

| UI piece | Component | Notes |
|---|---|---|
| Surah list, desktop | `Sidebar` + `ScrollArea` | 114 items, needs virtualized or lazy render if perf suffers |
| Surah list, mobile | `Sheet` (side="left") | same data source as sidebar |
| Fast jump to surah/ayah | `Command` (⌘K) | faster than scrolling for 114 surahs |
| Translation display toggle | `ToggleGroup` (single select) | Arabic only / +1 / +2 — not a `Select`, this is core and frequent |
| Font size | `ToggleGroup` (single select), 4 fixed steps | not a `Slider` — readers want fixed sizes |
| Theme toggle | `Switch` or icon `Toggle` | paired with `next-themes` |
| Word meaning, desktop | `Tooltip` | hover only |
| Word meaning, mobile | `Popover` | tap-triggered — `Tooltip` does not work reliably on touch |
| Word morphology detail (M3) | `Popover`, escalate to `Sheet` if content is long | triggered from same word component |
| New bookmark collection | `Dialog` | |
| Secondary settings (reciter, etc., M2+) | `Dialog` | keep out of the top bar |
| Ayah loading state | `Skeleton` | |
| Reading progress / streak (M4) | `Progress` | |

---

## 5. Word tooltip — desktop vs mobile

Detect touch vs hover capability rather than screen width (a touch laptop is still "hover: none" in some cases, and desktop-width tablets exist):

```tsx
const isTouch = useMediaQuery("(hover: none)");
return isTouch ? <ArabicWordPopover word={word} /> : <ArabicWordTooltip word={word} />;
```

`ArabicWordTooltip` and `ArabicWordPopover` should share the same inner content component so the meaning/transliteration markup isn't duplicated.

---

## 6. Typography

| Token | Value |
|---|---|
| Arabic script | Uthmani (QPC v2 / KFGQPC Hafs), loaded via `next/font/local`, subset per surah if file size is a problem |
| Arabic base size | 26px, adjustable in 4 fixed steps: 22 / 26 / 30 / 34px |
| Translation font | Serif (Lora or Source Serif 4), 14–15px, line-height 1.7 |
| UI chrome font | System sans (Tailwind default stack) |
| Direction | Arabic block: `dir="rtl" lang="ar"`. Translation block stays `dir="ltr"`. |

---

## 7. Color tokens

Define as CSS variables in `globals.css`, consumed by Tailwind via `tailwind.config.ts` `extend.colors`. Both light and dark values must be set — never hardcode a hex in a component.

```css
:root {
  --background: 40 25% 97%;      /* warm off-white, not pure white */
  --foreground: 20 8% 15%;
  --accent: 165 45% 32%;         /* muted teal/green */
  --accent-foreground: 0 0% 100%;
  --border: 20 8% 88%;
}
[data-theme="dark"] {
  --background: 20 8% 10%;       /* charcoal, not pure black */
  --foreground: 40 15% 92%;
  --accent: 165 40% 55%;
  --accent-foreground: 20 8% 10%;
  --border: 20 8% 20%;
}
```

Rule: one accent color only. No decorative gradients or patterns — the brief explicitly asks for restraint.

---

## 8. Motion

Use `motion` for structural transitions only. Use plain Tailwind/CSS `transition` for hover/tap feedback — it's lighter and there's no need for a JS animation library firing on every word hover.

| Interaction | Duration | Easing | Tool |
|---|---|---|---|
| Sidebar / Sheet open-close | 200ms | ease-out | `motion` |
| Word tooltip / popover | 120–150ms | ease-out, fade + 2px scale | CSS transition |
| Translation toggle switch (Arabic only ↔ +1 ↔ +2) | 150ms | crossfade, not hard cut | CSS transition |
| Dark/light switch | 250ms | crossfade bg + text color | CSS transition on `background-color`/`color` |
| Current-ayah highlight (audio sync, M2) | 150–200ms | ease-in-out | CSS transition |
| Bookmark/save tap | ~150ms | scale 1 → 1.15 → 1, low-stiffness spring | `motion` (only tactile-feedback spring in the app) |
| Surah/ayah navigation | 150ms | crossfade content area only | CSS transition |

**Do not animate:**
- The Arabic text itself on load or scroll — no fade-in, no blur-in, no stagger per ayah. This is read dozens of times a day; entrance animation on the actual verse text becomes fatiguing fast.
- Any bounce/elastic easing near the reading column.
- Full-screen page-transition wipes between surahs.
- Background patterns, particles, parallax.

Respect `prefers-reduced-motion: reduce` — disable the `motion` transitions (fall back to instant) when it's set; CSS transitions under 200ms are generally fine to leave as-is.

---

## 9. Responsive rules

- Sidebar: visible flex column ≥768px, `Sheet` below that.
- Top bar controls wrap to a second row on narrow viewports rather than shrinking below 44px tap targets.
- Arabic text size steps stay the same across breakpoints — do not auto-shrink Arabic script on mobile, let the user control it explicitly.

---

## 10. Accessibility

- `dir="rtl" lang="ar"` on every Arabic text container.
- Tooltip/Popover content should also be reachable via keyboard (`tabIndex={0}` on the word span, opens on focus not just hover).
- `Command` palette (⌘K) gives keyboard-only users a full alternative to sidebar navigation.
- Respect `prefers-reduced-motion` as above.
- Color contrast: verify both light and dark accent values against WCAG AA before locking the palette.

---

## 11. Architecture reserved for later milestones

- Bottom `data-slot="audio-dock"` strip — Milestone 2's persistent mini player mounts here.
- `ArabicWord` component should accept an optional `onWordClick` prop now (unused in M1) — Milestone 2 wires it to word-level audio playback, Milestone 3 wires a second interaction to the morphology panel.
- Ayah block should support an optional collapsible panel slot below the translation — Milestone 3's tafsir panel and Milestone 5's morphology detail both attach here without restructuring `ayah-block.tsx`.
