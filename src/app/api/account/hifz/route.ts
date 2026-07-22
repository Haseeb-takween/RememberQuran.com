import mongoose from "mongoose"
import type { NextRequest } from "next/server"
import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { connectToDatabase } from "@/lib/db"
import { parseVerseKey } from "@/lib/quran/verse-key"
import { MemorisedAyah } from "@/lib/models/MemorisedAyah"

export const runtime = "nodejs"

const MAX_MEMORISED = 6236

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown
    return typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const surahIdParam = request.nextUrl.searchParams.get("surahId")
  const query: Record<string, unknown> = { userId }

  if (surahIdParam !== null) {
    const n = Number(surahIdParam)
    if (!Number.isInteger(n) || n < 1 || n > 114) {
      return privateJson({ error: "Invalid surah." }, 400)
    }
    query.surahId = n
  }

  await connectToDatabase()
  const rows = await MemorisedAyah.find(query)
    .sort({ surahId: 1, ayahId: 1 })
    .limit(MAX_MEMORISED)
    .lean()

  return privateJson({
    ayahs: rows.map((r) => ({
      verseKey: r.verseKey,
      surahId: r.surahId,
      ayahId: r.ayahId,
      memorisedAt: r.memorisedAt,
    })),
  })
}

export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const verse = parseVerseKey(body.verseKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)
  const verseKey = `${verse.surahId}:${verse.ayahId}`

  await connectToDatabase()

  const existing = await MemorisedAyah.findOne({ userId, verseKey }).lean()
  if (existing) {
    return privateJson({
      ayah: {
        verseKey: existing.verseKey,
        surahId: existing.surahId,
        ayahId: existing.ayahId,
        memorisedAt: existing.memorisedAt,
      },
    })
  }

  const total = await MemorisedAyah.countDocuments({ userId })
  if (total >= MAX_MEMORISED) {
    return privateJson(
      { error: `You can mark at most ${MAX_MEMORISED} ayahs.` },
      400,
    )
  }

  try {
    const row = await MemorisedAyah.create({
      userId,
      verseKey,
      surahId: verse.surahId,
      ayahId: verse.ayahId,
      memorisedAt: new Date(),
    })
    return privateJson(
      {
        ayah: {
          verseKey: row.verseKey,
          surahId: row.surahId,
          ayahId: row.ayahId,
          memorisedAt: row.memorisedAt,
        },
      },
      201,
    )
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      const raced = await MemorisedAyah.findOne({ userId, verseKey }).lean()
      if (raced) {
        return privateJson({
          ayah: {
            verseKey: raced.verseKey,
            surahId: raced.surahId,
            ayahId: raced.ayahId,
            memorisedAt: raced.memorisedAt,
          },
        })
      }
    }
    console.error("Hifz create failed", error)
    return privateJson({ error: "Could not mark ayah as memorised." }, 500)
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  const rawKey = body?.verseKey ?? request.nextUrl.searchParams.get("verseKey")
  const verse = parseVerseKey(rawKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)

  await connectToDatabase()
  const result = await MemorisedAyah.deleteOne({
    userId,
    verseKey: `${verse.surahId}:${verse.ayahId}`,
  })

  return privateJson({ ok: true, removed: result.deletedCount > 0 })
}
