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

## Milestone 2 — Audio & Recitation

### Zero-regression gate
- [ ] With audio never started in the session, every M1 check above passes and the reader renders exactly as before (audio dock is `h-0`, no player bar)
- [ ] `rq-reader-settings` localStorage key is untouched by audio use (inspect before/after)

### Per-ayah + continuous playback
- [ ] Play button on an ayah starts recitation at that ayah
- [ ] Playing 2:255 continues automatically into 2:256 (no gap)
- [ ] Play-surah button in the reader controls plays from ayah 1
- [ ] Pause/resume works from the ayah button, controls bar, and player bar
- [ ] Playback continues while navigating to other routes

### Mini player bar
- [ ] Appears (slides in) when audio starts; hidden when idle
- [ ] Last ayah of a surah is never covered by the bar (spacer grows)
- [ ] Surah · ayah label links back to the playing ayah
- [ ] Prev/next ayah buttons seek correctly
- [ ] Close (X) stops audio and hides the bar
- [ ] Offline/airplane mode mid-playback → inline error + retry; reader still fully usable; retry resumes near the same ayah

### Reciter + speed
- [ ] Switching reciter mid-surah continues from the same ayah with the new voice
- [ ] All four speeds (0.75×/1×/1.25×/1.5×) audibly correct; word highlight stays in sync at each
- [ ] Reciter and speed persist across reload (`rq-audio-settings`)
- [ ] Hand-corrupting `rq-audio-settings` falls back to defaults without breaking anything

### Word-by-word sync
- [ ] Highlight moves word-by-word (not ayah-at-a-time) in verse mode
- [ ] Highlight moves word-by-word in reading (mushaf) mode
- [ ] Works for both reciters, and after seeking (prev/next/ayah play)
- [ ] No layout shift of Arabic text while highlighting (background-only)
- [ ] Hovering/tapping a highlighted word still shows the meaning tooltip/popover

### Repeat (memorisation)
- [ ] Repeat single ayah ×3 loops exactly 3 times, then continues
- [ ] Repeat range (e.g. 1:1–1:4) ×2 loops the range twice
- [ ] ∞ repeats until stopped; "Stop" ends the repeat
- [ ] Repeat interacts correctly with speed and reciter switching
- [ ] Quick presets (Ayah ×3 / ×5 / Range ×3) start from the current ayah
- [ ] Pause between repeats (1–5s) waits before restarting the loop; Stop cancels a pending pause

### Hide Arabic (memorisation)
- [ ] Settings → Hide Arabic blurs ayah text in verse mode; tap reveals; eye icon hides again
- [ ] Reading (mushaf) mode: tap blurred ayah to reveal/hide without breaking continuous flow
- [ ] Word tooltips/popovers suppressed while blurred; work again when revealed
- [ ] Turning Hide Arabic off clears session reveals; no account required

### Hifz tracker (signed-in)
- [ ] Guest: brain icon on an ayah opens soft-gate (no silent local persistence)
- [ ] Signed-in: mark ayah → icon fills; unmark → clears; survives refresh
- [ ] Account → Hifz: surah view shows % progress and linked ayah chips
- [ ] Account → Hifz: juz view shows all 30 juz with correct % (spot-check juz 1 and 30)
- [ ] Unmark from account page removes the ayah and updates the reader icon
- [ ] Overview card shows memorised count; Hifz appears in account nav

### Word-level audio (click to hear)
- [ ] Desktop: clicking a word plays its pronunciation in isolation
- [ ] If the surah was playing, it pauses for the word and resumes after
- [ ] Mobile: tapping a word still shows the meaning popover first (M1 behavior); the speaker button inside it plays the word
- [ ] Keyboard: Enter/Space on a focused word plays it
- [ ] End-of-ayah markers and words without audio are silent no-ops

### Quran Radio (`/radio`)
- [ ] Radio link in navbar opens the radio page
- [ ] Play starts continuous recitation from the selected surah
- [ ] Crosses surah boundaries unattended (verify one mid-Quran crossing and 113 → 114 → 1)
- [ ] Reciter selectable on the radio page
- [ ] Radio keeps playing while navigating around the site; bar shows the Radio badge

### Mobile / iOS
- [ ] Audio starts correctly from tap on iOS Safari (no silent failure)
- [ ] Radio auto-advance continues on iOS after a surah boundary
- [ ] Speed setting survives surah changes on Safari
- [ ] Phone-call/tab-background interruption leaves the player in a consistent paused state

---

*Append M3 checks below this line after Study Tools milestone is complete.*
