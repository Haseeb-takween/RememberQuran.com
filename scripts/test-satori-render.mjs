// Render real Uthmani text with candidate fonts and save PNGs for visual check.
import { ImageResponse } from "next/og.js"
import { writeFile } from "node:fs/promises"

const res = await fetch(
  "https://api.quran.com/api/v4/verses/by_key/1:1?fields=text_uthmani",
)
const json = await res.json()
const ARABIC = json.verse.text_uthmani
console.log("verse:", ARABIC)

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

for (const family of ["Markazi Text", "IBM Plex Sans Arabic", "Cairo"]) {
  try {
    const data = await loadGoogleFont(family, ARABIC)
    // Satori doesn't reorder RTL runs; render each word as a flex item in
    // row-reverse so word order is controlled by flexbox.
    const words = ARABIC.split(/\s+/).map((word) => ({
      type: "span",
      props: { children: word },
    }))
    const img = new ImageResponse(
      {
        type: "div",
        props: {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row-reverse",
            flexWrap: "wrap",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            gap: 14,
            fontFamily: family,
            fontSize: 56,
            color: "#1a2e1a",
            backgroundColor: "#f5f2e8",
          },
          children: words,
        },
      },
      {
        width: 1000,
        height: 220,
        fonts: [{ name: family, data, style: "normal", weight: 400 }],
      },
    )
    const buf = Buffer.from(await img.arrayBuffer())
    const file = `scripts/out-${family.replaceAll(" ", "-")}.png`
    await writeFile(file, buf)
    console.log("OK  ", family, "->", file)
  } catch (err) {
    console.log("FAIL", family, err?.message ?? err)
  }
}
