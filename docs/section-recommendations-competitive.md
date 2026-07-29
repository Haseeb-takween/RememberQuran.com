# RememberQuran — Section & Page Recommendations

**Research + recommendations only. No files were modified.** Date: 2026-07-25
Method: reviewed the leading Quran platforms worldwide (Quran.com / Quran.Foundation, Tarteel, Greentech's *Al Quran (Tafsir & by Word)*, Ayah, Quran Majeed, Islam360, Ayat/KSU, Muslim Pro, Quran Explorer, QuranWBW, Quranic Arabic Corpus), then mapped their section structure against your existing routes in `src/app`.

---

## 1. Where you actually stand

Your 18 routes today:

```
/  ·  /[surahId]  ·  /[surahId]/[ayahId]  ·  /search  ·  /radio  ·  /media-maker
/login  /register  /reset  /reset/[token]
/account  /account/{bookmarks,goals,hifz,notes,progress,settings}
/privacy  /terms
```

**You are not behind on features — you are behind on *surfaces*.** You have tafsir, asbab al-nuzul, word-by-word morphology, tajweed, bookmarks, notes, hifz tracking, goals, progress events, streak state, audio + radio, and a media maker. That is a deeper feature set than most apps in the list above. The problem is that almost all of it is locked behind `/account` or inside the reader, so:

- Google sees ~5 indexable page types. Quran.com has thousands.
- A first-time visitor sees a hero and 114 cards, and cannot tell any of it exists.

The recommendations below are therefore weighted toward **surfacing what you already built** before adding anything new.

---

## 2. What every serious platform has that you don't

| Section | Who has it | You | Why it matters |
|---|---|---|---|
| **Juz / Hizb / Page browse** | All of them | ✗ (`JUZ_RANGES` exists in `lib/quran/juz.ts`; used by `HifzView`, but no browse route) | The #1 navigation unit in Ramadan. Pure SEO gift — 30 static pages from data you already have |
| **Reciters index** | Quran.com `/reciters`, Quran Majeed, Explorer | ✗ (selector only, in-reader) | "Mishary Alafasy Surah Rahman" is a massive search term. You have `lib/audioSources.ts` already |
| **Surah info / introduction pages** | Quran.com (Dr. Sohaib Saeed surah intros), Golden Quran | ✗ | Every surah deserves a real page: theme, revelation context, virtues, when to read |
| **Topical / thematic index** | Golden Quran (thematic highlighting), Islam360 | ✗ | "Verses about patience/anxiety/parents" is how non-Arabic speakers actually search |
| **Learning plans / guided journeys** | Quran.com — *thousands of enrollees, 3,000+ five-star ratings* | ✗ | Quran.Foundation calls this the move "from passive reading to sustained engagement." It is their single most-cited retention feature |
| **Khatmah planner** | Greentech Planner, Muslim Pro Khatam, Khatmul Quran | Partial — `/account/goals` is daily-target only | "Finish the Quran by *date X*" is a different mental model from "read N ayahs/day" and is what people actually want in Ramadan |
| **Reflections / community** | QuranReflect (1M+ visitors/yr, moderated) | ✗ | The heaviest retention mechanic in the space. Also the heaviest moderation burden — see §5 |
| **Verse comparison** | Quran.com (new this year) | ✗ | Compare translations of one ayah side by side. You already fetch multiple translations |
| **Hadith cross-reference** | Islam360, Quran.com (related hadith) | ✗ | Sunnah.com has a free API |
| **Ramadan hub** | Quran.com `/ramadan2026`, most apps | ✗ | Seasonal traffic spike is 5–10× — a landing page is the cheapest way to capture it |
| **Vocabulary / quiz mode** | Corpus, Quranic, most memorization apps | ✗ (you have the morphology data for all 114 surahs) | Turns passive word tooltips into an active learning loop |
| **About / Donate / Developers** | Quran.com all three | ✗ | You describe yourself as "public-benefit, ad-free" in the footer with no About page to back it |
| **Help / FAQ / Support** | All | ✗ | |
| **Product updates / changelog** | Quran.com `/product-updates` | ✗ | Cheap, and signals the project is alive |
| **Blog / articles** | Nearly all | ✗ | The main organic acquisition channel in this category |
| **Multi-language UI** | Quran.com — 19 UI languages, auto-localized by country | ✗ (English only) | Your biggest addressable markets are Indonesia, Pakistan, Bangladesh, Egypt, Turkey |

---

## 3. Recommended new sections, ranked

### Tier 1 — do these first (high value, low effort, data already in the repo)

**1. `/juz` and `/juz/[n]`** — 30 pages, generated from `JUZ_RANGES` which is already written and verified against KFGQPC numbering. Each page: the juz range, its surahs, a "read this juz" CTA, estimated reading time, and your progress bar through it. Add a Juz tab next to the Surah list on home. *Effort: ~half a day. This is free SEO you've already paid for.*

**2. `/reciters` and `/reciters/[slug]`** — index of every reciter in `lib/audioSources.ts`, each with a bio stub, a surah list, and playable samples. Reciter-name searches are enormous and almost entirely uncontested by small sites. *Effort: ~1 day.*

**3. `/[surahId]/about`** (or a rich block on the surah page) — name meaning, Makki/Madani, revelation order, ayah/word count, main themes, virtues, related hadith, and the asbab data you already index. 114 substantial indexable pages. *Effort: ~1 day for the shell; content can be filled progressively.*

**4. Home page section reorder** — the retention fix from the earlier audit. Current order is Hero → ContinuePrompt → QuickAccess → 114 cards, which is a directory, not a product. Recommended:

   1. Hero (resume-aware — swap the CTA to "Continue Surah X, ayah Y" when a saved position exists)
   2. **Today** — streak, goal ring, resume card, in one row
   3. **Why an account** (signed out) / **Your practice** (signed in) — the missing conversion section. You have bookmarks, notes, hifz, goals, progress and none of it is advertised on the home page
   4. **Start here** — 8 curated short surahs (Fatihah, Ikhlas, Mulk, Kahf, Yasin, Rahman, Waqi'ah, Juz Amma). Your footer already curates these; the home page doesn't
   5. QuickAccess (demoted)
   6. Browse — tabs for Surah / Juz / Page, with Makki–Madani and length filters
   7. Footer

**5. `/about`, `/donate`, `/help`** — three static pages. You claim public-benefit status in the footer with nothing behind it. Trust pages materially affect whether people create an account.

### Tier 2 — the retention layer

**6. Khatmah planner** — extend `/account/goals`. "Finish the Quran by [date]" → auto-computed daily pages, adjusts when you fall behind, optional group khatmah via invite code (Muslim Pro and Khatmul Quran both do this; the group mechanic is what makes it spread). Your `ProgressEvent` and `StreakState` models already carry the data.

**7. `/learn` — learning plans** — Quran.Foundation's own year-in-review names this their strongest engagement feature. Structure: a plan = N daily lessons, each = a few ayahs + a short reflection prompt + a completion tick. Start with three: *Juz Amma in 30 days*, *Surah Al-Mulk*, *The 40 most-repeated Quranic words*. Reuses your existing reader, notes, and progress plumbing — this is mostly content, not engineering.

**8. `/practice` — active recall** — you already have `HideArabicToggle` and `HideableArabic`. Promote it into a real mode: hide the ayah, reveal on tap, self-grade "knew it / didn't," and feed that into a spaced-repetition queue on `/account/hifz`. This is the core of what Tarteel charges $7.50–9.99/month for, minus the AI. **You can ship the 80% that doesn't need speech recognition.**

**9. `/vocab` — word trainer** — you have full morphology JSON for all 114 surahs in `public/data/morphology/v1/`. Rank words by frequency, teach the top 300 (which cover roughly half of all Quranic word occurrences), quiz with flashcards. Nobody in your competitive set does this well, and you're the only one already holding the data.

**10. `/topics/[slug]` — thematic index** — "Patience", "Anxiety", "Parents", "Death", "Gratitude". High-intent, high-conversion search traffic that the big platforms serve poorly.

### Tier 3 — reach and depth

**11. `/ramadan`** — seasonal hub: khatmah plan, Taraweeh juz tracker, night-by-night guide. Build it once, re-date it annually.
**12. Verse comparison** — `/compare/[verseKey]`, all translations of one ayah side by side.
**13. Hadith cross-reference** — via the Sunnah.com API, surfaced in your existing `StudyPanel`.
**14. `/blog`** — the acquisition channel. Even 12 posts a year moves the needle.
**15. Multi-language UI** — Indonesian, Urdu, Bengali, Turkish, Arabic first. Requires RTL chrome, which is real work, but it's where the users are.
**16. `/developers`** — you already have a clean API surface (`/api/surah`, `/api/tafsir`, `/api/asbab`, `/api/search`). Documenting it costs a day and buys backlinks.
**17. Reflections** — highest engagement, highest moderation cost. See §5 before starting.

---

## 4. Improving the sections you already have

**`/` home** — see §3.4. Also add a progress rail to each `SurahCard` (you track `MemorisedAyah` and `ProgressEvent` but show neither), and filter chips so 114 uniform cards stop being a wall.

**`/[surahId]` reader** — the strongest part of the app. Missing: a *page* view mode matching the physical Madani mushaf (Ayat/KSU built its whole reputation on this and it's what visual memorizers need), a per-surah reading-progress indicator, and an "ayah of the day" entry point.

**`/search`** — currently text-only. Competitors differentiate here: Islam360 markets itself primarily as a Quran search engine. Add root-word search (your morphology data supports it), translation-language filters, and search-within-surah.

**`/radio`** — a single well-built page. Give each station a URL so it's linkable and indexable.

**`/media-maker`** — genuinely differentiating; Ayah won a Kuwait international prize substantially on shareable verse images. Currently invisible to anyone not signed in and browsing. Put example output on the home page — it's your most shareable feature and shareability is free acquisition.

**`/account/*`** — six sub-pages, zero of them mentioned anywhere a signed-out visitor can see. Add a public marketing page per feature (`/features/hifz`, `/features/notes`) or at minimum one combined "Why an account" page.

---

## 5. Two honest cautions

**Reflections/community is a moderation commitment, not a feature.** Quran.Foundation runs QuranReflect as a "carefully moderated space" with staff, monthly themes, and live sessions. A community section on Quranic text with no moderation capacity will attract sectarian argument and misattributed tafsir. Don't ship it until you can staff it.

**Don't chase Tarteel's AI.** Real-time recitation mistake detection is their moat and it's expensive. The higher-return move is §3.8: ship excellent *non-AI* active recall — hide/reveal, spaced repetition, self-grading — which serves most of the same need at a fraction of the cost, and which you're already 60% of the way to.

---

## 6. Suggested build order

| Phase | Work | Payoff |
|---|---|---|
| **1 — Surface what exists** (2–3 wks) | `/juz`, `/reciters`, surah about pages, home reorder, `/about` + `/donate` + `/help`, SurahCard progress rail | SEO surface goes from ~5 page types to ~250 pages; signed-out visitors finally learn the app has features |
| **2 — Retention loop** (3–4 wks) | Khatmah planner, `/practice` active recall, streak in navbar, `/learn` with 3 plans | Converts one-time readers into daily users — the thing you asked about first |
| **3 — Depth & reach** (ongoing) | `/vocab`, `/topics`, verse comparison, hadith cross-ref, `/blog`, `/ramadan` | Compounding organic growth |
| **4 — Considered** (later) | Multi-language UI, reflections, `/developers` | High cost, high ceiling |

Phase 1 is almost entirely presentation of data already in the repository. If you only do one thing, do `/juz` — 30 indexable pages generated from `lib/quran/juz.ts`, which is already written and verified against KFGQPC numbering and currently only consumed internally by `HifzView`.

---

## Sources

- [Quran Foundation — Year in Review 2026](https://quran.foundation/year-in-review)
- [Quran.com — Introducing Learning Plans](https://quran.com/en/product-updates/introducing-learning-plans)
- [Quran.com — Learning Plans](https://quran.com/learning-plans)
- [Quran.com — Take Notes](https://quran.com/en/take-notes)
- [Quran.com — About Us](https://quran.com/en/about-us)
- [Quran.com — Connected Quran Apps](https://quran.com/apps)
- [Quran.com — Ramadan 2026](https://quran.com/ramadan2026)
- [Dr. Ali Rajabi — 10 Best Quran Apps for Reading, Memorization & Study 2026](https://dralirajabi.com/best-quran-apps-2026/)
- [Tarteel: AI Quran Memorization — Google Play](https://play.google.com/store/apps/details?id=com.mmmoussa.iqra)
- [Alphazed — Best Quran Memorization Apps in 2026 Compared](https://www.thealphazed.com/blog/best-quran-memorization-apps-2026)
- [Greentech Apps Foundation — Al Quran (Tafsir & By Word)](https://gtaf.org/apps/quran/)
- [Greentech — Planner: Complete the Quran on your schedule](https://gtaf.org/blog/planner-feature-in-quran-app/)
- [Muslim Pro — How to Plan My Own Khatam](https://support.muslimpro.com/hc/en-us/articles/4813190002585-How-to-Plan-My-Own-Khatam)
- [Ramadan Challenge — Gamified Islamic Worship Tracker](https://ramadanchallengeapp.com/)
- [QuranWBW.com](https://quranwbw.com/)
- [The Quranic Arabic Corpus — Word by Word Grammar & Morphology](https://corpus.quran.com/wordbyword.jsp)
- [Quran411 — Ruku Index](https://quran411.com/quran-ruku-index)

---

*Research and recommendations only. No files were changed.*
