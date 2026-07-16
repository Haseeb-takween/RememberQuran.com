import type { SearchResponse } from "@/types/study"

/** Promise-cache keyed `${q}:${page}` — evicted on failure so retries refetch */
const searchCache = new Map<string, Promise<SearchResponse>>()

export async function searchQuran(q: string, page = 1): Promise<SearchResponse> {
  const key = `${q}:${page}`
  const cached = searchCache.get(key)
  if (cached) return cached

  const promise = (async () => {
    const res = await fetch(
      `/api/search?q=${encodeURIComponent(q)}&size=20&page=${page}`,
      { headers: { Accept: "application/json" } },
    )
    if (!res.ok) throw new Error(`Search failed (${res.status})`)
    return (await res.json()) as SearchResponse
  })()

  searchCache.set(key, promise)
  promise.catch(() => searchCache.delete(key))
  return promise
}

export interface EmHighlightSegment {
  text: string
  highlight: boolean
}

/**
 * Split a translation string containing <em>…</em> highlights into typed
 * segments. Never uses innerHTML — pure string parsing.
 *
 * Edge cases:
 * - No <em> tags → single segment, highlight: false
 * - Consecutive <em> tags → each becomes its own highlight segment
 * - Empty string → returns [{text: "", highlight: false}]
 * - Malformed/unclosed tag → rest of string treated as plain text
 */
export function splitEmHighlights(text: string): EmHighlightSegment[] {
  if (!text) return [{ text: "", highlight: false }]

  const segments: EmHighlightSegment[] = []
  const re = /<em>(.*?)<\/em>|([^<]+)|<[^>]*>/g
  let match: RegExpExecArray | null

  while ((match = re.exec(text)) !== null) {
    if (match[1] !== undefined) {
      // <em>…</em> group
      segments.push({ text: match[1], highlight: true })
    } else if (match[2] !== undefined) {
      // plain text (no angle brackets)
      segments.push({ text: match[2], highlight: false })
    }
    // Unknown tags (match[0] starts with <) are silently dropped
  }

  return segments.length ? segments : [{ text, highlight: false }]
}
