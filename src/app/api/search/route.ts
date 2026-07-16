import { NextResponse } from "next/server"
import type { SearchResponse, SearchResult } from "@/types/study"

const QDC_SEARCH_URL = "https://api.qurancdn.com/api/qdc/search"

/** Raw QDC search response shape */
interface QdcSearchResponse {
  search?: {
    total_results?: number
    results?: Array<{
      verse_key?: string
      chapter_id?: number
      verse_number?: number
      words?: Array<{ text?: string; highlight?: boolean }>
      translations?: Array<{ resource_id?: number; text?: string }>
    }>
  }
  pagination?: {
    current_page?: number
    next_page?: number | null
    total_count?: number
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const raw = searchParams.get("q")?.trim() ?? ""
  if (!raw || raw.length > 100) {
    return NextResponse.json({ error: "q must be 1–100 characters" }, { status: 400 })
  }

  const size = Math.min(20, Math.max(1, Number(searchParams.get("size") ?? 20) || 20))
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1)

  const url = `${QDC_SEARCH_URL}?q=${encodeURIComponent(raw)}&size=${size}&page=${page}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { Accept: "application/json" },
    })

    if (!res.ok) {
      throw new Error(`QDC search error ${res.status}`)
    }

    const data = (await res.json()) as QdcSearchResponse
    const raw_results = data.search?.results ?? []
    const pagination = data.pagination

    const results: SearchResult[] = raw_results.map((r) => ({
      verse_key: r.verse_key ?? "",
      chapter_id: r.chapter_id ?? 0,
      verse_number: r.verse_number ?? 0,
      words: (r.words ?? []).map((w) => ({
        text: w.text ?? "",
        highlight: w.highlight ?? false,
      })),
      translations: (r.translations ?? []).map((t) => ({
        resource_id: t.resource_id ?? 0,
        text: t.text ?? "",
      })),
    }))

    const payload: SearchResponse = {
      results,
      totalCount: pagination?.total_count ?? data.search?.total_results ?? 0,
      currentPage: pagination?.current_page ?? page,
      nextPage: pagination?.next_page ?? null,
    }

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
