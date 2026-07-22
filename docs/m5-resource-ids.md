# M5 Phase 0 — Live resource inventory

**Verified:** 2026-07-22  
**Method:** `node scripts/m5-phase0-inventory.mjs` → `docs/m5-resource-ids.json`  
**Hosts:** `api.qurancdn.com/api/qdc` (audio + tafsirs), `api.quran.com/api/v4` (translations + recitation metadata)

Phase 0 only — **do not expand app registries until Phase 1+**. This file is the allowlist for those phases.

---

## Finding: reciter pool is smaller than the brief’s “20+”

| Source | Count |
|--------|------:|
| QDC `GET /audio/reciters?locale=en` | **14** (all have chapter audio + word segments on ch. 1 & 2) |
| V4 `GET /resources/recitations` | **12** (subset; names/styles only) |
| Extra ID working on QDC `audio_files` but **absent** from QDC list | **8** (Minshawi Mujawwad) — timed |
| V4 id **11** (`Mohamed al-Tablawi`) | Audio file exists, **0 word segments**; CDN path is `abdul_muhsin_alqasim` — **do not ship as Tablawi** without a product decision |

**Implication for M5 acceptance:** the public QDC chapter-audio surface currently yields **~15 timed recitations** (14 listed + id 8), not 20+. Hitting a hard “20+” requires another source (e.g. credentialed Quran Foundation API) or revising the goal to “all verified QDC chapter reciters.” Document that gap in the submission; do not invent IDs.

---

## Recommended reciters (Phase 1)

All rows below checked with  
`GET …/audio/reciters/{id}/audio_files?chapter=1&segments=true`  
and chapter 2 for QDC-listed ids. Arabic display names are product copy (QDC list does not return `arabicName`).

| ID | Name | Style | Word timing | Notes |
|---:|------|-------|:-----------:|-------|
| **7** | Mishary Rashid Alafasy | Murattal | ✓ | **Keep as default** (shipped M2) |
| **3** | Abdur-Rahman as-Sudais | Murattal | ✓ | Shipped M2 |
| 97 | Yasser Ad-Dussary | Murattal | ✓ | |
| 2 | AbdulBaset AbdulSamad | Murattal | ✓ | |
| 1 | AbdulBaset AbdulSamad | Mujawwad | ✓ | Separate style id |
| 4 | Abu Bakr al-Shatri | Murattal | ✓ | |
| 5 | Hani ar-Rifai | Murattal | ✓ | |
| 6 | Mahmoud Khalil Al-Husary | Murattal | ✓ | |
| 12 | Mahmoud Khalil Al-Husary | Muallim | ✓ | Teaching pace |
| 10 | Saud ash-Shuraym | Murattal | ✓ | |
| 161 | Khalifah Al Tunaiji | Murattal | ✓ | |
| 9 | Mohamed Siddiq al-Minshawi | Murattal | ✓ | |
| **8** | Mohamed Siddiq al-Minshawi | Mujawwad | ✓ | Not in QDC list; V4 + direct `audio_files` OK |
| 168 | Mohamed Siddiq al-Minshawi | Kids repeat | ✓ | Optional / niche — include if picker groups by style |

### Optional / caution

| ID | Verdict |
|---:|---------|
| 173 | Second Alafasy Murattal (`…/streaming/mp3/`). Timed, but duplicates 7 with a shorter file — **skip** unless we want an explicit “streaming” variant. |
| 11 | Untimed chapter MP3; V4 name ≠ CDN folder. **Exclude** from Phase 1 unless relabeled and marked `hasWordTiming: false`. |

**Phase 1 registry size if we take the recommended table (excl. 168):** **13** unique ids, or **14** with Kids repeat. Re-run the inventory script before shipping if the list grows.

---

## Recommended translations (Phase 2)

API IDs from `GET /resources/translations`. Spot-checked `verses/by_key/2:255?translations=…` for English + Urdu samples.

| ID | Language | Name | Direction | Source |
|---:|----------|------|-----------|--------|
| **20** | English | Saheeh International | LTR | API — **keep default** |
| **131** | English | The Clear Quran — Dr Mustafa Khattab | LTR | **CDN merge only** (not in `/resources/translations`; never send to quran.com) |
| 85 | English | M.A.S. Abdel Haleem | LTR | API |
| 19 | English | M. Pickthall | LTR | API |
| 22 | English | A. Yusuf Ali | LTR | API |
| 84 | English | T. Usmani (Mufti Taqi Usmani) | LTR | API |
| 203 | English | Al-Hilali & Khan | LTR | API |
| 95 | English | A. Maududi (Tafhim commentary) | LTR | API |
| 149 | English | Fadel Soliman, Bridges’ translation | LTR | API |
| **54** | Urdu | Maulana Muhammad Junagarhi | **RTL** | API — primary RTL pick |

**Count:** 10 (9 API + Clear Quran CDN). Alternate Urdu if needed: **819** (Maulana Wahiduddin Khan).

**Do not** use resource **57** (Transliteration) as a translation option unless product wants it explicitly.

**Product default (open Q4):** cap simultaneous selected translations at **3** in the reader UI (defaults can still be 20 + 131).

---

## Recommended tafsirs (Phase 3)

From `GET …/resources/tafsirs` (20 books). Spot-checked `…/tafsirs/{slug}/by_ayah/2:255` on QDC.

### English (prefer for Study Panel default set)

| ID | Slug | Name | 2:255 |
|---:|------|------|------:|
| **169** | `en-tafisr-ibn-kathir` | Ibn Kathir (Abridged) | ✓ (~15k chars) — **keep default** |
| 168 | `en-tafsir-maarif-ul-quran` | Ma'arif al-Qur'an | ✓ |
| 817 | `tazkirul-quran-en` | Tazkirul Quran (Wahiduddin Khan) | ✓ (shorter) |

Only **three** English books exist on this QDC list. To reach **≥ 5 books**, add verified non-English (or dual) works:

| ID | Slug | Name | Lang | 2:255 |
|---:|------|------|------|------:|
| 91 | `ar-tafseer-al-saddi` | Al-Sa'di | Arabic | ✓ |
| 16 | `ar-tafsir-muyassar` | Tafsir Muyassar | Arabic | ✓ |

**Optional extras:** `ru-tafseer-al-saddi` (Russian), `tafseer-ibn-e-kaseer-urdu`, `tazkiru-quran-ur`, `tafsir-bayan-ul-quran` — all returned HTML on 2:255.

**Phase 3 minimum set:** Ibn Kathir EN + Ma'arif EN + Tazkirul EN + Al-Sa'di AR + Muyassar AR (**5**).

---

## Product notes resolved in Phase 0

| # | Question | Decision for later phases |
|---|----------|---------------------------|
| 1 | Exact 20+ reciter IDs | **Not available** on public QDC today — ship all verified timed chapter ids (~13–14); escalate goal or Foundation API separately |
| 2 | Translation IDs | Table above (20, 131, 85, 19, 22, 84, 203, 95, 149, 54) |
| 3 | English tafsirs | Only 3 EN slugs; pad with AR for ≥5 |
| 4 | Max simultaneous translations | Recommend **cap 3** |
| 5 | Hide mode scope | Recommend **per-ayah** first (Phase 4) |

---

## Re-verify

```bash
node scripts/m5-phase0-inventory.mjs
# or: pnpm m5:inventory
```

Compare new `docs/m5-resource-ids.json` counts before expanding `RECITERS` / translation allowlists / `TAFSIR_RESOURCES`.
