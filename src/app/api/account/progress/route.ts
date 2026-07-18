import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { connectToDatabase } from "@/lib/db"
import { ProgressEvent } from "@/lib/models/ProgressEvent"
import { User } from "@/lib/models/User"
import { TOTAL_SURAHS } from "@/lib/progress/date"
import { parseVerseKey } from "@/lib/quran/verse-key"

export const runtime = "nodejs"

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  await connectToDatabase()

  const [user, surahIds] = await Promise.all([
    User.findById(userId).select("lastPosition").lean(),
    ProgressEvent.distinct("surah", { userId }),
  ])

  const raw = user?.lastPosition ?? null
  let lastPosition: {
    verseKey: string
    surahId: number
    ayahId: number
    updatedAt: string
  } | null = null

  if (raw?.verseKey) {
    const parsed = parseVerseKey(raw.verseKey)
    if (parsed) {
      lastPosition = {
        verseKey: `${parsed.surahId}:${parsed.ayahId}`,
        surahId: parsed.surahId,
        ayahId: parsed.ayahId,
        updatedAt:
          raw.updatedAt instanceof Date
            ? raw.updatedAt.toISOString()
            : String(raw.updatedAt ?? ""),
      }
    }
  }

  const viewedSurahIds = (surahIds as number[])
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= TOTAL_SURAHS)
    .sort((a, b) => a - b)

  return privateJson({
    lastPosition,
    viewedSurahIds,
    viewedCount: viewedSurahIds.length,
    total: TOTAL_SURAHS,
  })
}
