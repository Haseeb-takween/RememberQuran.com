// Binary-search which part of the card markup crashes satori.
import { ImageResponse } from "next/og.js"

const key = "1:1"
const res = await fetch(
  `https://api.quran.com/api/v4/verses/by_key/${key}?fields=text_uthmani&translations=20`,
)
const json = await res.json()
const arabic = json.verse.text_uthmani.trim()
const translation = (json.verse.translations?.[0]?.text ?? "")
  .replace(/<[^>]*>/g, "")
  .trim()

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

const [arabicFontSubset, arabicFontWithKey, latinFont] = await Promise.all([
  loadGoogleFont(ARABIC_FONT, arabic),
  loadGoogleFont(ARABIC_FONT, arabic + key),
  loadGoogleFont("Noto Sans", `${translation} RememberQuran.com 0123456789:`),
])

const words = arabic.split(/\s+/).filter(Boolean)
const spans = words.map((w) => ({ type: "span", props: { children: w } }))

async function attempt(label, children, fonts) {
  try {
    const img = new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            fontSize: 40,
          },
          children,
        },
      },
      { width: 1200, height: 630, fonts },
    )
    await img.arrayBuffer()
    console.log("OK  ", label)
  } catch (err) {
    console.log("FAIL", label, "-", err?.message ?? err)
  }
}

const arabicRow = (font) => ({
  type: "div",
  props: {
    style: {
      display: "flex",
      flexDirection: "row-reverse",
      flexWrap: "wrap",
      columnGap: 18,
      fontFamily: ARABIC_FONT,
      fontSize: 64,
    },
    children: spans,
  },
})

const fontsA = [{ name: ARABIC_FONT, data: arabicFontSubset, style: "normal", weight: 400 }]
const fontsB = [{ name: ARABIC_FONT, data: arabicFontWithKey, style: "normal", weight: 400 }]
const fontsBoth = [
  { name: ARABIC_FONT, data: arabicFontWithKey, style: "normal", weight: 400 },
  { name: "Noto Sans", data: latinFont, style: "normal", weight: 400 },
]

await attempt("arabic spans, subset=arabic only", [arabicRow()], fontsA)
await attempt("arabic spans, subset=arabic+key", [arabicRow()], fontsB)
await attempt("arabic spans + latin font registered", [arabicRow()], fontsBoth)
await attempt(
  "translation only (Noto Sans)",
  [{ type: "div", props: { style: { display: "flex" }, children: translation } }],
  fontsBoth,
)
await attempt(
  "verseKey text 1:1 (Noto Sans)",
  [{ type: "div", props: { style: { display: "flex" }, children: "1:1" } }],
  fontsBoth,
)
await attempt(
  "arabic + translation together",
  [
    arabicRow(),
    { type: "div", props: { style: { display: "flex" }, children: translation } },
  ],
  fontsBoth,
)
