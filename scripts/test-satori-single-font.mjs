// Workaround test: one font (Markazi Text covers Arabic + Latin) for the whole card.
import { ImageResponse } from "next/og.js"
import { writeFile } from "node:fs/promises"

const key = process.argv[2] ?? "1:1"
const res = await fetch(
  `https://api.quran.com/api/v4/verses/by_key/${key}?fields=text_uthmani&translations=20`,
)
const json = await res.json()
// Strip Quranic annotation marks (small waw/yeh, sajdah signs, stop marks…)
// that regular Arabic fonts don't cover — they crash satori's shaper.
const arabic = json.verse.text_uthmani
  .replace(/[\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
  .trim()
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

const everything = `${arabic} ${translation} Al-Fatihah ${key} RememberQuran.com 0123456789:`
const fontData = await loadGoogleFont(ARABIC_FONT, everything)

const spans = arabic
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
        justifyContent: "space-between",
        backgroundColor: "#E8EDE4",
        padding: "56px 64px",
        fontFamily: ARABIC_FONT,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 28,
              flex: 1,
              justifyContent: "center",
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
                  style: {
                    display: "flex",
                    fontSize: 28,
                    lineHeight: 1.45,
                    color: "#5A6B56",
                    maxWidth: 980,
                  },
                  children: translation,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", fontSize: 24, color: "#3D5A3A" },
                  children: `Al-Fatihah ${key}`,
                },
              },
              {
                type: "div",
                props: {
                  style: { display: "flex", fontSize: 22, color: "#5A6B56" },
                  children: "RememberQuran.com",
                },
              },
            ],
          },
        },
      ],
    },
  },
  {
    width: 1200,
    height: 630,
    fonts: [{ name: ARABIC_FONT, data: fontData, style: "normal", weight: 400 }],
  },
)

const buf = Buffer.from(await img.arrayBuffer())
await writeFile("scripts/out-single-font.png", buf)
console.log("OK ->", "scripts/out-single-font.png", buf.byteLength, "bytes")
