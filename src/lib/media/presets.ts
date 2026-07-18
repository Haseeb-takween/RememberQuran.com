/**
 * Media Maker presets + helpers — client-safe (no Mongoose / Node APIs).
 */

export const MEDIA_PRESETS = [
  {
    id: "olive",
    label: "Olive",
    background: "#E8EDE4",
    foreground: "#1C2B1A",
    muted: "#5A6B56",
    accent: "#3D5A3A",
  },
  {
    id: "forest",
    label: "Forest",
    background: "#1A2F24",
    foreground: "#F2F5F0",
    muted: "#A8B8AE",
    accent: "#8FBC8F",
  },
  {
    id: "sand",
    label: "Sand",
    background: "#EDE6DC",
    foreground: "#2A241C",
    muted: "#7A7166",
    accent: "#6B5E4E",
  },
  {
    id: "night",
    label: "Night",
    background: "#12161C",
    foreground: "#EEF1F5",
    muted: "#9AA3B0",
    accent: "#7EB8D4",
  },
] as const

export type MediaPresetId = (typeof MEDIA_PRESETS)[number]["id"]

export function getMediaPreset(id: string | null | undefined) {
  return MEDIA_PRESETS.find((p) => p.id === id) ?? MEDIA_PRESETS[0]
}

export function isMediaPresetId(id: unknown): id is MediaPresetId {
  return typeof id === "string" && MEDIA_PRESETS.some((p) => p.id === id)
}

/** Strip HTML entities/tags from API translation text. */
export function plainTranslation(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
}

export function truncateText(text: string, max: number): string {
  if (text.length <= max) return text
  const candidate = text.slice(0, max - 1).trimEnd()
  const lastSpace = candidate.lastIndexOf(" ")
  const boundary = lastSpace > max * 0.7 ? lastSpace : candidate.length
  return `${candidate.slice(0, boundary).trimEnd()}…`
}

export function arabicFontSize(charCount: number): number {
  if (charCount > 280) return 36
  if (charCount > 180) return 44
  if (charCount > 100) return 52
  return 64
}
