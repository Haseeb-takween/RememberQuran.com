import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { connectToDatabase } from "@/lib/db"
import { ProgressEvent } from "@/lib/models/ProgressEvent"
import { evaluateGoalAndStreak } from "@/lib/goals/evaluate"
import { utcDayStart } from "@/lib/progress/date"
import { getAyahCount } from "@/lib/quran/verse-key"

export const runtime = "nodejs"

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

export async function PUT(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const surah = Number(body.surah)
  let fromAyah = Number(body.fromAyah)
  let toAyah = Number(body.toAyah)

  if (!Number.isInteger(surah) || surah < 1 || surah > 114) {
    return privateJson({ error: "Invalid surah." }, 400)
  }

  const count = getAyahCount(surah)
  if (count === null) return privateJson({ error: "Invalid surah." }, 400)

  if (
    !Number.isInteger(fromAyah) ||
    !Number.isInteger(toAyah) ||
    fromAyah < 1 ||
    toAyah < 1
  ) {
    return privateJson({ error: "Invalid ayah range." }, 400)
  }

  if (fromAyah > toAyah) {
    const tmp = fromAyah
    fromAyah = toAyah
    toAyah = tmp
  }

  if (toAyah > count) {
    return privateJson({ error: "Invalid ayah range." }, 400)
  }

  // Server owns the calendar day — ignore client date
  const date = utcDayStart()

  await connectToDatabase()

  const existing = await ProgressEvent.findOne({ userId, surah, date }).lean()

  if (existing) {
    const nextFrom = Math.min(existing.fromAyah, fromAyah)
    const nextTo = Math.max(existing.toAyah, toAyah)
    if (nextFrom !== existing.fromAyah || nextTo !== existing.toAyah) {
      await ProgressEvent.updateOne(
        { _id: existing._id, userId },
        { $set: { fromAyah: nextFrom, toAyah: nextTo } },
      )
    }
    void evaluateGoalAndStreak(userId).catch(() => {})
    return privateJson({
      event: {
        surah,
        fromAyah: nextFrom,
        toAyah: nextTo,
        date,
      },
    })
  }

  try {
    const event = await ProgressEvent.create({
      userId,
      surah,
      fromAyah,
      toAyah,
      date,
    })
    void evaluateGoalAndStreak(userId).catch(() => {})
    return privateJson({
      event: {
        surah: event.surah,
        fromAyah: event.fromAyah,
        toAyah: event.toAyah,
        date: event.date,
      },
    })
  } catch (error) {
    // Concurrent tab raced the unique index — merge ranges
    const raced = await ProgressEvent.findOne({ userId, surah, date }).lean()
    if (raced) {
      const nextFrom = Math.min(raced.fromAyah, fromAyah)
      const nextTo = Math.max(raced.toAyah, toAyah)
      await ProgressEvent.updateOne(
        { _id: raced._id, userId },
        { $set: { fromAyah: nextFrom, toAyah: nextTo } },
      )
      void evaluateGoalAndStreak(userId).catch(() => {})
      return privateJson({
        event: {
          surah,
          fromAyah: nextFrom,
          toAyah: nextTo,
          date,
        },
      })
    }
    console.error("ProgressEvent create failed", error)
    return privateJson({ error: "Could not save progress." }, 500)
  }
}
