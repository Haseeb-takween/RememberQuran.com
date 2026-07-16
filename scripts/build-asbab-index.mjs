/**
 * One-time build script: generates src/data/asbab-index.json — the list of
 * ayahs that have a GENUINE Wahidi asbab al-nuzul entry in the spa5k dataset,
 * plus empty_ayahs aliased to their group-head entry.
 *
 *   node scripts/build-asbab-index.mjs
 *
 * Why filtering is needed (verified 2026-07): the "en-asbab-al-nuzul-by-al-wahidi"
 * edition pads ayahs that Wahidi never covered with mystical commentary from a
 * different book (e.g. 1:1, 2:1, 2:30 are Qushayri-style text, not asbab).
 * Genuine Wahidi entries have a fixed structure: they open with the quoted
 * verse in parentheses followed by a [surah:ayah] citation —
 *   "(They question thee...) [2:222]. Abu 'Abd al-Rahman ... informed us> ..."
 * The padding never does. This structural test excludes it cleanly (validated
 * against surah 2: catches 2:62/115/222, rejects 2:1/30/124/201).
 *
 * empty_ayahs (per-surah list in the CDN surah JSON, also at
 * …/{surah}/empty_ayahs.json) are ayahs with no own file — altafsir stored the
 * passage under a neighboring ayah. We map each to the nearest prior genuine
 * head so the icon appears on every ayah in the group and the API resolves to
 * the head's text.
 */
import { writeFile } from "node:fs/promises"
import path from "node:path"

const BASE =
  "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-asbab-al-nuzul-by-al-wahidi"
const OUT = path.resolve(import.meta.dirname, "../src/data/asbab-index.json")

const CITATION = /\[\d+:\d+\]/

function isGenuineWahidi(text) {
  if (typeof text !== "string") return false
  const t = text.trimStart()
  return t.startsWith("(") && CITATION.test(t.slice(0, 250))
}

/** Nearest prior genuine head (strictly less than ayah), or null */
function priorHead(heads, ayah) {
  for (let i = heads.length - 1; i >= 0; i--) {
    if (heads[i] < ayah) return heads[i]
  }
  return null
}

const coverage = {}
const redirects = {}
let heads = 0
let aliased = 0
let padded = 0
let orphanEmpty = 0

for (let surah = 1; surah <= 114; surah++) {
  const res = await fetch(`${BASE}/${surah}.json`)
  if (!res.ok) {
    console.warn(`surah ${surah}: HTTP ${res.status} — skipped`)
    continue
  }
  const data = await res.json()
  const ayahs = Array.isArray(data?.ayahs) ? data.ayahs : []
  const emptyAyahs = Array.isArray(data?.empty_ayahs) ? data.empty_ayahs : []

  const genuine = ayahs
    .filter((a) => isGenuineWahidi(a.text))
    .map((a) => a.ayah)
    .sort((a, b) => a - b)

  padded += ayahs.length - genuine.length

  const covered = new Set(genuine)
  for (const entry of emptyAyahs) {
    const ayah = entry?.ayah
    if (!Number.isInteger(ayah)) continue
    const head = priorHead(genuine, ayah)
    if (head == null) {
      orphanEmpty++
      continue
    }
    covered.add(ayah)
    redirects[`${surah}:${ayah}`] = `${surah}:${head}`
    aliased++
  }

  if (covered.size > 0) {
    coverage[String(surah)] = [...covered].sort((a, b) => a - b)
    heads += genuine.length
  }
  process.stdout.write(
    `\rsurah ${surah}/114 — ${heads} heads, ${aliased} aliases   `,
  )
}

const payload = { coverage, redirects }
await writeFile(OUT, JSON.stringify(payload) + "\n")
console.log(
  `\nWrote ${OUT}\n${heads} genuine heads + ${aliased} group aliases = ${heads + aliased} covered ayahs across ${Object.keys(coverage).length} surahs (${padded} padded rejected, ${orphanEmpty} empty ayahs with no prior head)`,
)
