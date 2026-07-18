// Reproduce the full /api/og/ayah markup outside Next to debug satori errors.
import { ImageResponse } from "next/og.js"
import { writeFile } from "node:fs/promises"

const key = process.argv[2] ?? "1:1"
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

const latinText = `${translation} Al-Fatihah ${key} RememberQuran.com 0123456789:`
const [arabicFont, latinFont] = await Promise.all([
  loadGoogleFont(ARABIC_FONT, arabic + key),
  loadGoogleFont("Noto Sans", latinText),
])

const arabicWords = arabic.split(/\s+/).filter(Boolean)
const arabicSize = 64

const h = (type, style, children) => ({ type, props: { style, children } })

const img = new ImageResponse(
  h(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: "#E8EDE4",
      padding: "56px 64px",
      fontFamily: "Noto Sans",
    },
    [
      h(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          gap: 28,
          flex: 1,
          justifyContent: "center",
        },
        [
          h(
            "div",
            {
              display: "flex",
              flexDirection: "row-reverse",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              columnGap: Math.round(arabicSize * 0.28),
              width: "100%",
              fontFamily: ARABIC_FONT,
              fontSize: arabicSize,
              lineHeight: 1.7,
              color: "#1C2B1A",
            },
            arabicWords.map((word) => ({
              type: "span",
              props: { children: word },
            })),
          ),
          h(
            "div",
            {
              display: "flex",
              fontSize: 26,
              lineHeight: 1.45,
              color: "#5A6B56",
              maxWidth: 980,
            },
            translation,
          ),
        ],
      ),
      h(
        "div",
        {
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        },
        [
          h("div", { display: "flex", fontSize: 22, color: "#3D5A3A" }, "Al-Fatihah"),
          h("div", { display: "flex", fontSize: 20, color: "#5A6B56" }, "RememberQuran.com"),
        ],
      ),
    ],
  ),
  {
    width: 1200,
    height: 630,
    fonts: [
      { name: ARABIC_FONT, data: arabicFont, style: "normal", weight: 400 },
      { name: "Noto Sans", data: latinFont, style: "normal", weight: 400 },
    ],
  },
)

try {
  const buf = Buffer.from(await img.arrayBuffer())
  await writeFile("scripts/out-route.png", buf)
  console.log("OK ->", "scripts/out-route.png", buf.byteLength, "bytes")
} catch (err) {
  console.error("RENDER FAILED:", err)
}
