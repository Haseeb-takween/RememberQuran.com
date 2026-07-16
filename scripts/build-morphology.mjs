/**
 * One-time build script: downloads Quranic Arabic Corpus data from
 * mustafa0x/quran-morphology and outputs per-surah morphology JSON chunks to
 * public/data/morphology/v1/{1..114}.json
 *
 *   node scripts/build-morphology.mjs
 *
 * TSV format (tab-separated, no header):
 *   surah:verse:word:segment  arabicForm  posTag  features
 *   e.g. "1:1:1:2  سْمِ  N  ROOT:سمو|LEM:اسْم|M|GEN"
 *
 * Root and lemma are stored as Arabic script (already in file — no Buckwalter).
 * Only the STEM morpheme per word is stored; PREF/SUFF entries are skipped.
 *
 * Output key: "{verseNumber}:{wordPosition}" within each surah file.
 */

import { writeFile, mkdir } from "node:fs/promises"
import path from "node:path"

const TSV_URL =
  "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt"
const OUT_DIR = path.resolve(import.meta.dirname, "../public/data/morphology/v1")

// Tokens that refine the column-3 POS tag with a more specific category.
// Verb aspects (IMPF, PERF, IMPV) are NOT here — they stay in features with pos="V".
const POS_QUALIFIERS = new Set([
  "PN", "PRON", "DEM", "REL", "ADJ", "DET", "CONJ",
  "VN", "ACT_PCPL", "PASS_PCPL",
])

/**
 * Parse the features column, e.g. "ROOT:رحم|LEM:رَحْمٰن|MS|GEN|ADJ"
 * Returns { isPref, isSuff, root, lemma, posQualifier, remainingFeatures }
 */
function parseFeatures(featStr) {
  const parts = featStr.split("|")
  let isPref = false
  let isSuff = false
  let root = ""
  let lemma = ""
  let posQualifier = ""
  const remaining = []

  for (const p of parts) {
    const tok = p.trim()
    if (!tok) continue
    if (tok === "PREF") { isPref = true; continue }
    if (tok === "SUFF") { isSuff = true; continue }
    if (tok.startsWith("ROOT:")) { root = tok.slice(5); continue }
    if (tok.startsWith("LEM:")) { lemma = tok.slice(4); continue }
    // First feature that's a POS qualifier overrides column-3 POS
    if (!posQualifier && POS_QUALIFIERS.has(tok)) { posQualifier = tok; continue }
    remaining.push(tok)
  }

  return { isPref, isSuff, root, lemma, posQualifier, remaining }
}

async function main() {
  console.log("Downloading morphology data…")
  const res = await fetch(TSV_URL)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const text = await res.text()
  console.log(`Downloaded ${(text.length / 1024 / 1024).toFixed(1)} MB`)

  const lines = text.split("\n")

  // surahId → Map<"verseNum:wordPos", MorphologyEntry>
  const surahs = new Map()

  // Track which word keys have been seen (first non-PREF/SUFF segment wins)
  const seen = new Map() // surahId → Set<key>

  let processed = 0
  let prefixSkipped = 0
  let suffixSkipped = 0
  let dupSkipped = 0

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const cols = line.split("\t")
    if (cols.length < 4) continue

    const location = cols[0].trim() // "1:2:3:4"
    const posTag = cols[2]?.trim() ?? ""
    const featStr = cols[3]?.trim() ?? ""

    // Parse location: surah:verse:word:segment
    const parts = location.split(":")
    if (parts.length < 4) continue
    const surahId = Number(parts[0])
    const verseNum = Number(parts[1])
    const wordPos = Number(parts[2])
    if (!surahId || !verseNum || !wordPos) continue

    const { isPref, isSuff, root, lemma, posQualifier, remaining } =
      parseFeatures(featStr)

    if (isPref) { prefixSkipped++; continue }
    if (isSuff) { suffixSkipped++; continue }

    // Deduplicate: first non-PREF/SUFF segment per word wins
    if (!seen.has(surahId)) seen.set(surahId, new Set())
    const surahSeen = seen.get(surahId)
    const key = `${verseNum}:${wordPos}`
    if (surahSeen.has(key)) { dupSkipped++; continue }
    surahSeen.add(key)

    processed++

    if (!surahs.has(surahId)) surahs.set(surahId, new Map())
    surahs.get(surahId).set(key, {
      pos: posQualifier || posTag,
      lemma,
      root,
      // rootLatin unused (corpus uses Arabic script directly)
      rootLatin: "",
      features: remaining,
    })
  }

  console.log(
    `Parsed ${processed} word entries` +
      ` (${prefixSkipped} prefixes, ${suffixSkipped} suffixes, ${dupSkipped} dups skipped)`,
  )

  await mkdir(OUT_DIR, { recursive: true })

  let written = 0
  for (const [surahId, wordMap] of surahs) {
    const obj = Object.fromEntries(wordMap)
    const outPath = path.join(OUT_DIR, `${surahId}.json`)
    await writeFile(outPath, JSON.stringify(obj), "utf8")
    written++
  }

  console.log(`Wrote ${written} surah files to ${OUT_DIR}`)

  if (written !== 114) {
    console.warn(`Warning: expected 114 surahs, got ${written}`)
  } else {
    console.log("Done. ✓")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
