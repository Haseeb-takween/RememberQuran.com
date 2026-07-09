# RememberQuran — Regression Checklist

Run this checklist top-to-bottom on the **live domain** (rememberquran.com) before each milestone QA handover. Confirm all checks pass in the submission.

---

## Milestone 1 — Core Reading Experience

### Surah List (`/`)
- [ ] All 114 surahs render in the grid
- [ ] Each card shows: number, Arabic name, transliteration, English meaning, ayah count, Makki/Madani badge
- [ ] Clicking any card navigates to the correct surah route
- [ ] Page title is "RememberQuran — Read, Listen & Understand the Quran"
- [ ] Loading skeleton appears while fetching

### Surah Reader (`/[surahId]`)
- [ ] Surah header shows Arabic name, English name, translation, ayah count, revelation place
- [ ] Bismillah appears for all surahs except Al-Fatiha (1) and At-Tawbah (9)
- [ ] All ayahs render with Arabic text in Amiri font, right-to-left
- [ ] Arabic text is correct Uthmani script with diacritics
- [ ] Both translations (Saheeh International + Clear Quran) appear below each ayah
- [ ] Page `<title>` is `Surah {Name} ({Arabic}) — RememberQuran`
- [ ] OG metadata correct for social sharing

### Reader Controls bar
- [ ] Sticky below navbar, visible while scrolling
- [ ] Surah breadcrumb shows correct name + Arabic
- [ ] `[←]` Previous surah button navigates to correct surah (disabled/hidden at Al-Fatiha)
- [ ] `[→]` Next surah button navigates to correct surah (disabled/hidden at An-Nas)
- [ ] Keyboard `[` navigates to previous surah
- [ ] Keyboard `]` navigates to next surah
- [ ] Keyboard shortcuts do not fire when typing in the search input

### Font size selector (Aa popover)
- [ ] S / M / L / XL buttons are visually distinct (active pill)
- [ ] Selecting a size immediately changes Arabic text size for ALL ayahs
- [ ] Selecting a size immediately changes translation text size for ALL ayahs
- [ ] Setting persists on page reload (localStorage)

### Translation toggle (Languages popover)
- [ ] "Arabic only" hides both translations
- [ ] "Saheeh International" shows one translation
- [ ] "Both translations" shows two translations
- [ ] Setting persists on page reload

### Display mode toggle (LayoutList / AlignLeft)
- [ ] Verse mode shows ayah number badge + Arabic + translation per block
- [ ] Reading mode shows continuous Arabic text (no number badges) + translations below
- [ ] Setting persists on page reload

### Word tooltip
- [ ] Hovering a word on desktop shows tooltip with English meaning and transliteration
- [ ] Tapping a word on mobile shows popover with the same content
- [ ] Tooltip/popover dismisses on tap-away (mobile) / mouse-leave (desktop)
- [ ] Words are tabbable and show focus ring

### Direct ayah navigation (`/[surahId]/[ayahId]`)
- [ ] `/2/255` loads Al-Baqarah and scrolls to Ayah al-Kursi (2:255)
- [ ] Target ayah is briefly highlighted
- [ ] Page title is `{Surah} {id}:{ayah} — RememberQuran`
- [ ] Invalid ayah number (`/2/999`) loads surah without error (graceful)
- [ ] Invalid surah number (`/999`) shows not-found page

### ⌘K / Ctrl+K command palette
- [ ] Opens on keyboard shortcut
- [ ] Typing filters surah list
- [ ] Clicking a result navigates to surah
- [ ] `2:255` syntax navigates directly to `/2/255`
- [ ] Escape closes palette

### Sidebar / mobile drawer
- [ ] Desktop sidebar shows surah list (visible ≥ md breakpoint)
- [ ] Active surah is highlighted with sliding indicator
- [ ] Mobile hamburger opens drawer with full surah list
- [ ] Drawer closes on surah selection

### Dark mode
- [ ] Toggle switches between light and dark
- [ ] All text contrast meets AA (4.5:1 minimum)
- [ ] Preference persists on reload

### Accessibility
- [ ] Skip-to-content link appears on first Tab keypress
- [ ] Tab order is logical: skip link → navbar → reader controls → ayahs
- [ ] All interactive elements have visible focus ring (ring-2)
- [ ] Surah reader has correct `aria-label`
- [ ] Ayah list has `role="list"` with `aria-label="Ayahs"`

### Mobile (test at 375px / 414px / 768px)
- [ ] No horizontal scroll at any breakpoint
- [ ] Navbar + reader controls do not overlap content
- [ ] Touch targets are ≥ 44×44px
- [ ] Arabic text is readable at all font sizes
- [ ] Word tap (popover) works correctly on iOS Safari

### Performance
- [ ] Surah list loads (or shows skeleton) within 2s
- [ ] Long surah (Al-Baqarah) renders all 286 ayahs without crash
- [ ] Route transitions feel instant (no blank flash)

---

*Append M2 checks below this line after Audio milestone is complete.*
