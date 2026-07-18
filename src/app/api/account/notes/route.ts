import type { NextRequest } from "next/server"
import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { connectToDatabase } from "@/lib/db"
import { Note } from "@/lib/models/Note"
import { normalizeNoteText } from "@/lib/notes/text"
import { parseVerseKey } from "@/lib/quran/verse-key"

export const runtime = "nodejs"

const MAX_NOTES = 2000

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

function serializeNote(note: {
  verseKey: string
  text: string
  createdAt?: Date
  updatedAt?: Date
}) {
  return {
    verseKey: note.verseKey,
    text: note.text,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }
}

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const params = request.nextUrl.searchParams
  const verseKeyParam = params.get("verseKey")
  const surahIdParam = params.get("surahId")

  await connectToDatabase()

  // Single note for the editor — missing is not an error
  if (verseKeyParam !== null) {
    const verse = parseVerseKey(verseKeyParam)
    if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)
    const verseKey = `${verse.surahId}:${verse.ayahId}`
    const note = await Note.findOne({ userId, verseKey }).lean()
    return privateJson({ note: note ? serializeNote(note) : null })
  }

  const query: Record<string, unknown> = { userId }

  // Reader batch: one request per surah so every ayah icon renders without N+1
  if (surahIdParam !== null) {
    const n = Number(surahIdParam)
    if (!Number.isInteger(n) || n < 1 || n > 114) {
      return privateJson({ error: "Invalid surah." }, 400)
    }
    query.verseKey = { $regex: `^${n}:` }
  }

  const notes = await Note.find(query)
    .sort({ updatedAt: -1 })
    .limit(MAX_NOTES)
    .lean()

  return privateJson({
    notes: notes.map(serializeNote),
  })
}

export async function PUT(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const verse = parseVerseKey(body.verseKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)
  const verseKey = `${verse.surahId}:${verse.ayahId}`

  const normalized = normalizeNoteText(body.text)
  if (!normalized.ok) return privateJson({ error: normalized.error }, 400)

  await connectToDatabase()

  // Empty / whitespace → delete (idempotent)
  if (normalized.text.length === 0) {
    await Note.deleteOne({ userId, verseKey })
    return privateJson({ deleted: true })
  }

  const existing = await Note.findOne({ userId, verseKey }).select("_id").lean()
  if (!existing) {
    const total = await Note.countDocuments({ userId })
    if (total >= MAX_NOTES) {
      return privateJson(
        { error: `You can save at most ${MAX_NOTES.toLocaleString()} notes.` },
        400,
      )
    }
  }

  const note = await Note.findOneAndUpdate(
    { userId, verseKey },
    {
      $set: { text: normalized.text },
      $setOnInsert: { userId, verseKey },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean()

  if (!note) {
    return privateJson({ error: "Could not save the note." }, 500)
  }

  return privateJson({ note: serializeNote(note) })
}

export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  const rawKey = body?.verseKey ?? request.nextUrl.searchParams.get("verseKey")
  const verse = parseVerseKey(rawKey)
  if (!verse) return privateJson({ error: "Invalid ayah reference." }, 400)
  const verseKey = `${verse.surahId}:${verse.ayahId}`

  await connectToDatabase()
  await Note.deleteOne({ userId, verseKey })

  return privateJson({ deleted: true })
}
