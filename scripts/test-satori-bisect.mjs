// Find which word of a verse crashes satori's font shaper.
import { ImageResponse } from "next/og.js"

const key = process.argv[2] ?? "2:255"
const res = await fetch(
  `https://api.quran.com/api/v4/verses/by_key/${key}?fields=text_uthmani`,
)
const json = await res.json()
const arabic = json.verse.text_uthmani.trim()

const ARABIC_FONT = "Markazi Text"

async function loadGoogleFont(family, text) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}&text=${encodeURIComponent(text)}`
  const css = await (
    await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.100 Safari/534.30",
      },
    })
  ).text()
  const resource = css.match(/src:\s*url\((.+?)\)/)
  if (!resource) throw new Error(`no css src for ${family}`)
  const r = await fetch(resource[1])
  if (!r.ok) throw new Error(`download failed for ${family}`)
  return r.arrayBuffer()
}

const fontData = await loadGoogleFont(ARABIC_FONT, arabic)

async function renders(text) {
  try {
    const img = new ImageResponse(
      {
        type: "div",
        props: {
          style: { display: "flex", fontFamily: ARABIC_FONT, fontSize: 48 },
          children: text,
        },
      },
      {
        width: 800,
        height: 200,
        fonts: [{ name: ARABIC_FONT, data: fontData, style: "normal", weight: 400 }],
      },
    )
    await img.arrayBuffer()
    return true
  } catch {
    return false
  }
}

const words = arabic.split(/\s+/).filter(Boolean)
console.log(`${words.length} words`)
const bad = []
for (const word of words) {
  const ok = await renders(word)
  if (!ok) {
    bad.push(word)
    const codepoints = [...word]
      .map((ch) => "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"))
      .join(" ")
    console.log(`BAD word: ${word}`)
    console.log(`  codepoints: ${codepoints}`)
  }
}
if (bad.length === 0) console.log("no single bad word — maybe a combination issue")

// Collect all unique codepoints in bad words for analysis
const allBadCps = new Set()
for (const w of bad) for (const ch of w) allBadCps.add(ch.codePointAt(0))
if (bad.length) {
  console.log(
    "unique codepoints in bad words:",
    [...allBadCps]
      .map((cp) => "U+" + cp.toString(16).toUpperCase().padStart(4, "0"))
      .join(" "),
  )
}
