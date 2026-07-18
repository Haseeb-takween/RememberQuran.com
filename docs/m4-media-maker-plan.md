# M4 Phase 5 — Quran Media Maker Implementation Plan

**Status:** Implemented  
**Depends on:** M1 verse APIs + reader ayah actions  
**Done when:** User can open Media Maker for any ayah, pick a preset, preview a branded card, and download/share a PNG  
**Sources:** Brief §3.4.6 · `docs/m4-implementation-plan.md` §3.4.6

---

## Goal

Generate a shareable ayah card (Arabic + translation + reference + RememberQuran.com) as PNG.

**Locked decisions:**

| Decision | Choice |
|----------|--------|
| Engine | **`next/og` `ImageResponse`** (satori) — consistent server PNG |
| Auth | **Public** — no login required |
| Route | `/media-maker?verse=2:255` |
| Image API | `GET /api/og/ayah?verse=2:255&preset=olive` |
| Size | 1200×630 (social-friendly) |
| Fonts | Amiri (Arabic+Latin) fetched once + cached in route |
| Presets | 4: olive, forest, sand, night |
| Translation | Default Saheeh International; strip HTML |
| Long text | Scale Arabic font; truncate translation ~280 chars |
| Video / Remotion | **Out of scope** (M5 stretch) |

---

## Build steps

M0 plan → M1 OG API + presets → M2 designer page → M3 ayah + hub entry → M4 typecheck
