# RememberQuran

A free, distraction-free Quran reading platform built as a public good (sadaqah jariyah) by Haseeb Sajjad for Takween Centre UK Ltd. No ads, no pop-ups, no commercial motive — just the Quran.

**Live site**: [rememberquran.com](https://remember-quran-com.vercel.app)

---

## What it does

- Browse all 114 surahs with Arabic names, English meanings, ayah counts, and Makki/Madani labels
- Read the full Quran in authentic Uthmani script with correct diacritics
- Hover or tap any Arabic word to instantly see its English meaning and transliteration
- Choose between two English translations: Saheeh International and The Clear Quran (Dr Mustafa Khattab)
- Switch between verse-by-verse and continuous reading modes
- Adjust Arabic font style and text size to your preference
- Light and dark mode, saved automatically across visits
- Direct shareable links to any specific ayah (e.g. `/2/255`)
- Copy or share any ayah with one click

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui + Base UI |
| Icons | Lucide React |
| Animation | Motion (Framer Motion) |
| Package manager | pnpm |

---

## Data sources

| Source | Used for |
|---|---|
| Quran.com API v4 (`api.quran.com/api/v4`) | All Quran content — chapters, verses, word data, translations |
| Translation ID 131 — Saheeh International | English translation |
| Translation ID 57 — The Clear Quran (Dr Mustafa Khattab) | English translation |
| KFGQPC Uthmanic Hafs font | Primary Arabic script font |
| Amiri (Google Fonts) | Secondary Arabic font option |

All Quran content is fetched from the API and never stored in our own database. All calls go through a single module (`src/lib/quranApi.ts`) so switching APIs in the future is a one-file change.

---

## Project structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout — providers, fonts, metadata
│   ├── page.tsx                    # "/" Surah list
│   ├── [surahId]/page.tsx          # "/2" Surah reader
│   └── [surahId]/[ayahId]/page.tsx # "/2/255" Reader scrolled to ayah
├── components/
│   ├── layout/                     # Navbar, Sidebar, SurahList, ThemeToggle
│   ├── reader/                     # QuranReader, AyahBlock, ArabicWord, WordTooltip,
│   │                               #   TranslationBlock, ReaderControls, BismillahHeader
│   └── surah-list/                 # SurahListPage, SurahCard
├── context/
│   ├── ReaderSettingsContext.tsx   # Theme, font, display mode, translations
│   └── UIContext.tsx               # Sidebar open/close state
├── lib/
│   ├── quranApi.ts                 # All Quran API calls — single point of change
│   ├── fonts.ts                    # Font definitions
│   └── utils.ts
├── hooks/
│   ├── useLocalStorage.ts
│   └── useIsTouch.ts
└── types/
    └── quran.ts                    # API response types
```

---

## Running locally

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

Deployed on Vercel with the custom domain rememberquran.com. Every push to `main` auto-deploys to the live site.

---

## Milestones

| # | Milestone | Status |
|---|---|---|
| M1 | Core reading experience | Complete |
| M2 | Audio & recitation | Upcoming |
| M3 | Study tools (tafsir, tajweed, search, morphology) | Upcoming |
| M4 | User accounts, bookmarks, notes, media maker | Upcoming |
| M5 | Expansion (20+ reciters, 10+ translations) | Upcoming |
| M6 | Final polish & performance | Upcoming |

---

## Guiding principles

- Quran content is never stored in our database — always fetched from the API
- No ads, no pop-ups, no commercial aesthetics
- Every previous milestone's features are regression-tested before the next milestone begins
- The live domain reflects ongoing progress at all times
