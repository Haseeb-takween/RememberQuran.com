// Test rendering text_imlaei (standard orthography) with both fonts registered.
import { ImageResponse } from "next/og.js"
import { writeFile } from "node:fs/promises"

const key = process.argv[2] ?? "1:1"
const res = await fetch(
  `https://api.quran.com/api/v4/verses/by_key/${key}?fields=text_uthmani,text_imlaei&translations=20`,
)
const json = await res.json()
const uthmani = json.verse.text_uthmani.trim()
const imlaei = json.verse.text_imlaei?.trim()
console.log("uthmani:", uthmani)
console.log("imlaei :", imlaei)

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

const translation = (json.verse.translations?.[0]?.text ?? "")
  .replace(/<[^>]*>/g, "")
  .trim()

const [arabicFont, latinFont] = await Promise.all([
  loadGoogleFont(ARABIC_FONT, imlaei + key),
  loadGoogleFont("Noto Sans", `${translation} RememberQuran.com 0123456789:`),
])

const spans = imlaei
  .split(/\s+/)
  .filter(Boolean)
  .map((w) => ({ type: "span", props: { children: w } }))

const img = new ImageResponse(
  {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 24,
        backgroundColor: "#E8EDE4",
        padding: "56px 64px",
        fontFamily: "Noto Sans",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row-reverse",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              columnGap: 18,
              fontFamily: ARABIC_FONT,
              fontSize: 64,
              lineHeight: 1.7,
              color: "#1C2B1A",
            },
            children: spans,
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", fontSize: 26, color: "#5A6B56" },
            children: translation,
          },
        },
      ],
    },
  },
  {
    width: 1200,
    height: 630,
    fonts: [
      { name: ARABIC_FONT, data: arabicFont, style: "normal", weight: 400 },
      { name: "Noto Sans", data: latinFont, style: "normal", weight: 400 },
    ],
  },
)

const buf = Buffer.from(await img.arrayBuffer())
await writeFile("scripts/out-imlaei.png", buf)
console.log("OK ->", "scripts/out-imlaei.png", buf.byteLength, "bytes")
