// Quick probe: which Arabic fonts can next/og (satori) actually parse?
// Run: node scripts/test-satori-fonts.mjs
import { ImageResponse } from "next/og.js"

const ARABIC = "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650 1:1"

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
  const res = await fetch(resource[1])
  if (!res.ok) throw new Error(`download failed for ${family}`)
  return res.arrayBuffer()
}

const candidates = [
  "Noto Sans Arabic",
  "Noto Kufi Arabic",
  "Cairo",
  "Tajawal",
  "Almarai",
  "IBM Plex Sans Arabic",
  "Reem Kufi",
  "Changa",
  "Scheherazade New",
  "Lateef",
  "Markazi Text",
  "Amiri Quran",
]

for (const family of candidates) {
  try {
    const data = await loadGoogleFont(family, ARABIC)
    const img = new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            fontFamily: family,
            fontSize: 48,
            color: "#000",
            backgroundColor: "#fff",
          },
          children: ARABIC,
        },
      },
      {
        width: 600,
        height: 200,
        fonts: [{ name: family, data, style: "normal", weight: 400 }],
      },
    )
    const buf = await img.arrayBuffer()
    console.log(`OK    ${family} (${data.byteLength}B font, ${buf.byteLength}B png)`)
  } catch (err) {
    console.log(`FAIL  ${family}: ${err?.message ?? err}`)
  }
}
