import mongoose from "mongoose"
import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { getOrCreateFavourites } from "@/lib/bookmarks/favourites"
import { connectToDatabase } from "@/lib/db"
import { Bookmark } from "@/lib/models/Bookmark"
import { BookmarkCollection } from "@/lib/models/BookmarkCollection"

export const runtime = "nodejs"

const NAME_MAX_LENGTH = 80
const MAX_COLLECTIONS = 50

function parseName(input: unknown): { name: string } | { error: string } {
  if (typeof input !== "string") return { error: "Collection name is required." }
  const name = input.trim()
  if (!name) return { error: "Collection name cannot be empty." }
  if (name.length > NAME_MAX_LENGTH) {
    return {
      error: `Collection name must be at most ${NAME_MAX_LENGTH} characters.`,
    }
  }
  return { name }
}

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

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  await connectToDatabase()
  await getOrCreateFavourites(userId)

  const [collections, counts] = await Promise.all([
    BookmarkCollection.find({ userId })
      .sort({ isDefault: -1, createdAt: 1 })
      .lean(),
    Bookmark.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$collectionId", count: { $sum: 1 } } },
    ]),
  ])

  const countById = new Map(counts.map((c) => [c._id.toString(), c.count]))

  return privateJson({
    collections: collections.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      isDefault: c.isDefault ?? false,
      count: countById.get(c._id.toString()) ?? 0,
    })),
  })
}

export async function POST(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const parsed = parseName(body.name)
  if ("error" in parsed) return privateJson({ error: parsed.error }, 400)

  await connectToDatabase()

  const total = await BookmarkCollection.countDocuments({ userId })
  if (total >= MAX_COLLECTIONS) {
    return privateJson(
      { error: `You can have at most ${MAX_COLLECTIONS} collections.` },
      400,
    )
  }

  try {
    const collection = await BookmarkCollection.create({
      userId,
      name: parsed.name,
    })
    return privateJson(
      {
        collection: {
          id: collection._id.toString(),
          name: collection.name,
          isDefault: false,
          count: 0,
        },
      },
      201,
    )
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      return privateJson(
        { error: "You already have a collection with this name." },
        409,
      )
    }
    console.error("Collection create failed", error)
    return privateJson({ error: "Could not create the collection." }, 500)
  }
}

export async function PATCH(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  const id = parseId(body.id)
  if (!id) return privateJson({ error: "Collection not found." }, 404)

  const parsed = parseName(body.name)
  if ("error" in parsed) return privateJson({ error: parsed.error }, 400)

  await connectToDatabase()

  const collection = await BookmarkCollection.findOne({ _id: id, userId })
  if (!collection) return privateJson({ error: "Collection not found." }, 404)
  if (collection.isDefault) {
    return privateJson({ error: "Favourites cannot be renamed." }, 403)
  }

  try {
    collection.name = parsed.name
    await collection.save()
    return privateJson({
      collection: {
        id: collection._id.toString(),
        name: collection.name,
        isDefault: false,
      },
    })
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      return privateJson(
        { error: "You already have a collection with this name." },
        409,
      )
    }
    console.error("Collection rename failed", error)
    return privateJson({ error: "Could not rename the collection." }, 500)
  }
}

export async function DELETE(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  const id = parseId(body?.id)
  if (!id) return privateJson({ error: "Collection not found." }, 404)

  await connectToDatabase()

  const collection = await BookmarkCollection.findOne({ _id: id, userId })
  if (!collection) return privateJson({ error: "Collection not found." }, 404)
  if (collection.isDefault) {
    return privateJson({ error: "Favourites cannot be deleted." }, 403)
  }

  // Keep the ayahs: fold them into Favourites before removing the folder
  const favourites = await getOrCreateFavourites(userId)
  const moved = await Bookmark.updateMany(
    { userId, collectionId: collection._id },
    { $set: { collectionId: favourites._id } },
  )
  await collection.deleteOne()

  return privateJson({ ok: true, movedToFavourites: moved.modifiedCount })
}
