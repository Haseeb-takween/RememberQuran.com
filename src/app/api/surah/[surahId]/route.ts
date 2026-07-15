import { NextResponse } from "next/server"
import { getChapter, getAllVerses } from "@/lib/quranApi"

interface RouteContext {
  params: Promise<{ surahId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { surahId } = await context.params
  const id = Number(surahId)

  if (isNaN(id) || id < 1 || id > 114) {
    return NextResponse.json({ error: "Invalid surah id" }, { status: 400 })
  }

  try {
    const [chapter, verses] = await Promise.all([
      getChapter(id),
      getAllVerses(id),
    ])

    return NextResponse.json(
      { chapter, verses },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    )
  } catch {
    return NextResponse.json({ error: "Failed to load surah" }, { status: 500 })
  }
}
