import mongoose from "mongoose"
import type { NextRequest } from "next/server"
import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { getOrCreateFavourites } from "@/lib/bookmarks/favourites"
import { connectToDatabase } from "@/lib/db"
import { parseVerseKey } from "@/lib/quran/verse-key"
import { Bookmark } from "@/lib/models/Bookmark"
import { BookmarkCollection } from "@/lib/models/BookmarkCollection"

export const runtime = "nodejs"

const MAX_BOOKMARKS = 2000

function parseId(input: unknown): string | null {
  return typeof input === "string" && mongoose.Types.ObjectId.isValid(input)
    ? input
    : null
}

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

/** Resolve the collection a bookmark should live in, enforcing ownership */
async function resolveCollection(
  userId: string,
  collectionId: unknown,
): Promise<mongoose.Types.ObjectId | "not-found"> {
  if (collectionId == null) {
    return (await getOrCreateFavourites(userId))._id
  }
  const id = parseId(collectionId)
  if (!id) return "not-found"
  const owned = await BookmarkCollection.findOne({ _id: id, userId })
    .select("_id")
    .lean()
  return owned ? owned._id : "not-found"
}

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const params = request.nextUrl.searchParams
  const collectionId = params.get("collectionId")
  const surahId = params.get("surahId")

  const query: Record<string, unknown> = { userId }

  if (collectionId !== null) {
    const id = parseId(collectionId)
    if (!id) return privateJson({ error: "Collection not found." }, 404)
    query.collectionId = id
  }

  // Reader batch: one request per surah so every ayah icon renders without N+1
  if (surahId !== null) {
    const n = Number(surahId)
    if (!Number.isInteger(n) || n < 1 || n > 114) {
      return privateJson({ error: "Invalid surah." }, 400)
    }
    query.verseKey = { $regex: `^${n}:` }
  }

  await connectToDatabase()
  const bookmarks = await Bookmark.find(query)
    .sort({ createdAt: -1 })
    .limit(MAX_BOOKMARKS)
    .lean()

  return privateJson({
    bookmarks: bookmarks.map((b) => ({
      verseKey: b.verseKey,
      collectionId: b.collectionId.toString(),
      createdAt: b.createdAt,
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

  const existing = await Bookmark.findOne({ userId, verseKey }).lean()
  if (existing) {
    return privateJson({
      bookmark: {
        verseKey: existing.verseKey,
        collectionId: existing.collectionId.toString(),
      },
    })
  }

  const total = await Bookmark.countDocuments({ userId })
  if (total >= MAX_BOOKMARKS) {
    return privateJson(
      { error: `You can save at most ${MAX_BOOKMARKS} bookmarks.` },
      400,
    )
  }

  const collectionId = await resolveCollection(userId, body.collectionId)
  if (collectionId === "not-found") {
    return privateJson({ error: "Collection not found." }, 404)
  }

  try {
    const bookmark = await Bookmark.create({ userId, verseKey, collectionId })
    return privateJson(
      {
        bookmark: {
          verseKey: bookmark.verseKey,
          collectionId: bookmark.collectionId.toString(),
        },
      },
      201,
    )
  } catch (error) {
    // Concurrent tab already saved it — idempotent success
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      const raced = await Bookmark.findOne({ userId, verseKey }).lean()
      if (raced) {
        return privateJson({
          bookmark: {
            verseKey: raced.verseKey,
            collectionId: raced.collectionId.toString(),
          },
        })
      }
    }
    console.error("Bookmark create failed", error)
    return privateJson({ error: "Could not save the bookmark." }, 500)
  }
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const verse = parseVerseKey(body.verseKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)
  const verseKey = `${verse.surahId}:${verse.ayahId}`

  await connectToDatabase()

  const collectionId = await resolveCollection(userId, body.collectionId)
  if (collectionId === "not-found") {
    return privateJson({ error: "Collection not found." }, 404)
  }

  const bookmark = await Bookmark.findOneAndUpdate(
    { userId, verseKey },
    { $set: { collectionId } },
    { new: true },
  ).lean()
  if (!bookmark) return privateJson({ error: "Bookmark not found." }, 404)

  return privateJson({
    bookmark: {
      verseKey: bookmark.verseKey,
      collectionId: bookmark.collectionId.toString(),
    },
  })
}

export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  const rawKey = body?.verseKey ?? request.nextUrl.searchParams.get("verseKey")
  const verse = parseVerseKey(rawKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)

  await connectToDatabase()
  const result = await Bookmark.deleteOne({
    userId,
    verseKey: `${verse.surahId}:${verse.ayahId}`,
  })

  return privateJson({ ok: true, removed: result.deletedCount > 0 })
}
