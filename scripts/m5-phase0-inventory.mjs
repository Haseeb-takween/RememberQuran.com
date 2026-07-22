/**
 * M5 Phase 0 — live resource inventory.
 *
 * Verifies QDC reciters (audio + word segments), quran.com translations,
 * and tafsir resources. Writes docs/m5-resource-ids.json for the plan.
 *
 * Usage: node scripts/m5-phase0-inventory.mjs
 */
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const QDC = "https://api.qurancdn.com/api/qdc"
const V4 = "https://api.quran.com/api/v4"

async function getJson(url) {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function countRealSegments(verseTimings) {
  if (!Array.isArray(verseTimings)) return 0
  let n = 0
  for (const vt of verseTimings) {
    const segs = vt?.segments
    if (!Array.isArray(segs)) continue
    for (const s of segs) {
      if (
        Array.isArray(s) &&
        s.length >= 3 &&
        typeof s[0] === "number" &&
        typeof s[1] === "number" &&
        typeof s[2] === "number" &&
        s[0] >= 1 &&
        s[2] > s[1]
      ) {
        n++
      }
    }
  }
  return n
}

async function checkReciterSegments(id, chapter) {
  const url = `${QDC}/audio/reciters/${id}/audio_files?chapter=${chapter}&segments=true`
  try {
    const data = await getJson(url)
    const file = data?.audio_files?.[0]
    if (!file?.audio_url) {
      return { ok: false, hasAudio: false, segmentCount: 0 }
    }
    const segmentCount = countRealSegments(file.verse_timings)
    return {
      ok: true,
      hasAudio: true,
      audioUrl: file.audio_url,
      duration: file.duration ?? null,
      segmentCount,
      hasWordTiming: segmentCount > 0,
    }
  } catch (e) {
    return { ok: false, hasAudio: false, segmentCount: 0, error: String(e) }
  }
}

async function inventoryReciters() {
  const data = await getJson(`${QDC}/audio/reciters?locale=en`)
  const list = data?.reciters ?? data?.audio_files ?? []
  // QDC shape: { reciters: [ { id, reciter_name, translated_name, style, ... } ] }
  const reciters = Array.isArray(list) ? list : []
  console.log(`Reciters listed: ${reciters.length}`)

  const results = []
  const seen = new Set()

  async function probe(id, name, arabicName, style, source) {
    if (seen.has(id)) return
    seen.add(id)
    process.stdout.write(`  #${id} ${name} … `)
    const ch1 = await checkReciterSegments(id, 1)
    await sleep(80)
    let ch2 = null
    if (ch1.hasAudio) {
      ch2 = await checkReciterSegments(id, 2)
      await sleep(80)
    }
    const hasWordTiming = Boolean(
      ch1.hasWordTiming && (ch2?.hasWordTiming ?? true),
    )
    results.push({
      id,
      name,
      arabicName,
      style: typeof style === "string" ? style : "",
      source,
      hasAudio: ch1.hasAudio,
      hasWordTiming,
      chapter1: {
        segmentCount: ch1.segmentCount,
        hasWordTiming: ch1.hasWordTiming,
        error: ch1.error,
        audioUrl: ch1.audioUrl ?? null,
      },
      chapter2: ch2
        ? {
            segmentCount: ch2.segmentCount,
            hasWordTiming: ch2.hasWordTiming,
            error: ch2.error,
          }
        : null,
    })
    console.log(
      ch1.hasAudio
        ? `audio ✓ · segments ${ch1.segmentCount}${ch2 ? ` / ch2 ${ch2.segmentCount}` : ""}`
        : `NO AUDIO`,
    )
  }

  for (const r of reciters) {
    const id = r.id
    const name =
      r.translated_name?.name ||
      r.reciter_name ||
      r.name ||
      `Reciter ${id}`
    const arabicName = r.reciter_name || r.name_arabic || ""
    const style = r.style?.name || r.style || ""
    await probe(id, name, arabicName, style, "qdc-list")
  }

  // V4-only / supplemental ids commonly referenced in docs
  console.log("  (supplemental V4 ids…)")
  await probe(
    8,
    "Mohamed Siddiq al-Minshawi",
    "",
    "Mujawwad",
    "v4-supplemental",
  )
  await probe(11, "Mohamed al-Tablawi (V4 label)", "", "", "v4-supplemental")

  return results
}

async function inventoryTranslations() {
  const data = await getJson(`${V4}/resources/translations`)
  const list = data?.translations ?? []
  console.log(`Translations listed: ${list.length}`)

  return list.map((t) => ({
    id: t.id,
    name: t.name,
    authorName: t.author_name ?? null,
    languageName: t.language_name ?? null,
    slug: t.slug ?? null,
    direction: inferDirection(t.language_name),
  }))
}

function inferDirection(languageName) {
  const lang = (languageName || "").toLowerCase()
  const rtl = [
    "arabic",
    "urdu",
    "persian",
    "farsi",
    "hebrew",
    "kurdish",
    "pashto",
    "sindhi",
  ]
  return rtl.some((x) => lang.includes(x)) ? "rtl" : "ltr"
}

async function inventoryTafsirs() {
  // Try both hosts — M3 uses QDC-style slugs
  let list = []
  for (const url of [
    `${QDC}/resources/tafsirs`,
    `${V4}/resources/tafsirs`,
  ]) {
    try {
      const data = await getJson(url)
      list = data?.tafsirs ?? data?.tafsir ?? []
      if (list.length) {
        console.log(`Tafsirs from ${url}: ${list.length}`)
        break
      }
    } catch (e) {
      console.warn(`  skip ${url}: ${e}`)
    }
  }

  return list.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    authorName: t.author_name ?? null,
    languageName: t.language_name ?? null,
  }))
}

/** Spot-check tafsir HTML exists for 2:255 */
async function spotCheckTafsir(slug) {
  const urls = [
    `${QDC}/tafsirs/${slug}/by_ayah/2:255`,
    `${V4}/tafsirs/${slug}/by_ayah/2:255`,
  ]
  for (const url of urls) {
    try {
      const data = await getJson(url)
      const text =
        data?.tafsir?.text ||
        data?.text ||
        data?.tafsirs?.[0]?.text ||
        ""
      if (typeof text === "string" && text.trim().length > 40) {
        return { ok: true, chars: text.length, url }
      }
    } catch {
      // try next
    }
  }
  return { ok: false, chars: 0 }
}

async function main() {
  console.log("=== M5 Phase 0 inventory ===\n")

  console.log("1) Reciters")
  const reciters = await inventoryReciters()

  console.log("\n2) Translations")
  const translations = await inventoryTranslations()

  console.log("\n3) Tafsirs")
  const tafsirs = await inventoryTafsirs()

  console.log("\n4) Spot-check English tafsirs on 2:255")
  const englishTafsirs = tafsirs.filter((t) =>
    (t.languageName || "").toLowerCase().includes("english"),
  )
  const tafsirChecks = []
  for (const t of englishTafsirs.slice(0, 25)) {
    process.stdout.write(`  ${t.slug} … `)
    const check = await spotCheckTafsir(t.slug)
    await sleep(100)
    tafsirChecks.push({ ...t, ...check })
    console.log(check.ok ? `ok (${check.chars} chars)` : "EMPTY/FAIL")
  }

  const withAudio = reciters.filter((r) => r.hasAudio)
  const withTiming = reciters.filter((r) => r.hasWordTiming)

  const summary = {
    verifiedAt: new Date().toISOString(),
    counts: {
      recitersListed: reciters.length,
      recitersWithAudio: withAudio.length,
      recitersWithWordTiming: withTiming.length,
      translations: translations.length,
      tafsirs: tafsirs.length,
      englishTafsirsChecked: tafsirChecks.filter((t) => t.ok).length,
    },
    reciters,
    translations,
    tafsirs,
    englishTafsirSpotChecks: tafsirChecks,
  }

  const outJson = join(ROOT, "docs/m5-resource-ids.json")
  writeFileSync(outJson, JSON.stringify(summary, null, 2))
  console.log(`\nWrote ${outJson}`)
  console.log(
    `Summary: ${withAudio.length} audio / ${withTiming.length} timed / ${translations.length} translations / ${tafsirs.length} tafsirs`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
