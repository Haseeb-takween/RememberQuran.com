# RememberQuran

A free, distraction-free Quran reading platform built as a public good (sadaqah jariyah) by Haseeb Sajjad for Takween Centre UK Ltd. No ads, no pop-ups, no commercial motive — just the Quran.

**Live site**: [rememberquran.com](https://rememberquran.com)

---

## What it does

### Reading (M1)
- Browse all 114 surahs with Arabic names, English meanings, ayah counts, and Makki/Madani labels
- Read the full Quran in authentic Uthmani script with correct diacritics
- Hover or tap any Arabic word to instantly see its English meaning and transliteration
- Choose between two English translations: Saheeh International and The Clear Quran (Dr Mustafa Khattab)
- Switch between verse-by-verse and continuous reading modes
- Adjust Arabic font style and text size to your preference
- Light and dark mode, saved automatically across visits
- Direct shareable links to any specific ayah (e.g. `/2/255`)
- Copy or share any ayah with one click

### Audio (M2)
- Listen with Alafasy or Sudais (reciter registry ready for M5 expansion)
- Per-ayah, continuous surah, and gapless playback with a persistent mini player
- Word-by-word highlight sync and click-to-hear word pronunciation
- Repeat single ayah or a range (including infinite), plus playback speed control
- Quran Radio at `/radio`

### Study tools (M3)
- Tafsir (Ibn Kathir, English) in a shared study panel
- Tajweed colour coding on Arabic text
- Keyword search across Arabic and English (`/search`)
- Word morphology (root, lemma, grammatical form)
- Asbab al-Nuzul (reasons for revelation) where coverage exists

### Accounts & personal features (M4)
- Email/password accounts with password reset (Auth.js)
- Bookmarks and collections; private per-ayah notes
- Reading progress tracking, daily goals, and streaks
- Media Maker — design and export shareable ayah images (`/media-maker`)
- Reading, audio, and study stay fully usable without an account (soft-gate for personal features)

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui + Base UI |
| Icons | Lucide React |
| Animation | Motion (Framer Motion) |
| Auth | Auth.js (NextAuth v5) — credentials + bcrypt |
| Database | MongoDB Atlas + Mongoose (user data only) |
| Email | Resend (password-reset) |
| Media Maker | `html-to-image` + OG image route |
| Package manager | pnpm |

---

## Data sources

| Source | Used for |
|---|---|
| Quran.com API v4 (`api.quran.com/api/v4`) | Chapters, verses, words, translations |
| Quran.com CDN / QDC (`api.qurancdn.com`) | Audio + segments, tafsir, search, tajweed fields |
| Quran.com audio CDN | Word pronunciation MP3s and chapter recitations |
| Translation ID 131 — Saheeh International | English translation |
| Translation ID 57 — The Clear Quran (Dr Mustafa Khattab) | English translation |
| Tafsir `en-tafisr-ibn-kathir` (Ibn Kathir EN) | Study panel tafsir |
| spa5k/tafsir_api (Asbab al-Nuzul) | Reasons for revelation |
| Quranic Arabic Corpus (build-time morphology) | Root / lemma / form data |
| KFGQPC Uthmanic Hafs font | Primary Arabic script font |
| Amiri (Google Fonts) | Secondary Arabic font option |

Quran text is always fetched from the APIs — never stored in our database. MongoDB holds **user data only** (accounts, bookmarks, notes, progress, goals). API access is centralised under `src/lib/` (`quranApi.ts`, `audioApi.ts`, `studyApi.ts`, etc.) so sources can change in one place.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                         # "/" Surah list
│   ├── [surahId]/                       # Surah reader + ayah deep links
│   ├── search/                          # Keyword search
│   ├── radio/                           # Quran Radio
│   ├── media-maker/                     # Ayah image designer
│   ├── login/ · register/ · reset/      # Auth flows
│   ├── account/                         # Bookmarks, notes, progress, goals, settings
│   └── api/                             # Auth, account, surah, tafsir, search, media, health
├── components/
│   ├── layout/ · reader/ · surah-list/
│   ├── audio/ · study/ · search/
│   ├── account/ · auth/ · media-maker/
│   └── ui/                              # shadcn primitives
├── context/                             # Reader, audio, study, bookmarks, notes, soft-gate, UI
├── lib/
│   ├── quranApi.ts · audioApi.ts · studyApi.ts · searchApi.ts
│   ├── models/                          # User, Bookmark, Note, Progress, Streak, …
│   ├── auth/ · goals/ · bookmarks/ · media/ · quran/
│   └── db.ts
├── hooks/ · types/
docs/                                    # Milestone plans and regression checklist
```

---

## Running locally

```bash
# Install dependencies
pnpm install

# Copy env template and fill in values (required for auth / account features)
cp .env.example .env

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Environment variables** (see `.env.example`):

| Variable | Purpose |
|---|---|
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `AUTH_SECRET` | Auth.js secret |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `RESEND_API_KEY` | Password-reset email |
| `EMAIL_FROM` | From address for transactional email |

Reading, audio, and study work without MongoDB/auth. Account features need the env vars above.

Optional: `pnpm build:morphology` rebuilds morphology data from the corpus source.

---

## Deployment

Deployed on Vercel with the custom domain rememberquran.com. Every push to `main` auto-deploys to the live site. Set the same env vars in the Vercel project for production auth and account features.

---

## Milestones

| # | Milestone | Status |
|---|---|---|
| M1 | Core reading experience | Complete |
| M2 | Audio & recitation | Complete |
| M3 | Study tools (tafsir, tajweed, search, morphology, asbab) | Complete |
| M4 | User accounts, bookmarks, notes, progress, goals, media maker | Complete |
| M5 | Expansion (20+ reciters, 10+ translations) | Upcoming |
| M6 | Final polish & performance | Upcoming |

Detailed plans live in `docs/` (`plan.md`, `m2.md`, `m3-implementation-plan.md`, `m4-*.md`, `m5-implementation-plan.md`, `regression-checklist.md`).

---

## Guiding principles

- Quran content is never stored in our database — always fetched from the API; Mongo holds user data only
- No ads, no pop-ups, no commercial aesthetics
- Account features are additive — guests keep full reading, audio, and study access
- Every previous milestone's features are regression-tested before the next milestone begins
- The live domain reflects ongoing progress at all times
