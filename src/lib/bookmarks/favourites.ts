import mongoose from "mongoose"
import {
  BookmarkCollection,
  type BookmarkCollectionDocument,
} from "@/lib/models/BookmarkCollection"

export const FAVOURITES_NAME = "Favourites"

/**
 * Every bookmark needs a collection, and registration seeds "Favourites" —
 * this is the safety net for legacy users created before the seed existed.
 */
export async function getOrCreateFavourites(
  userId: string,
): Promise<BookmarkCollectionDocument> {
  const existing = await BookmarkCollection.findOne({
    userId,
    isDefault: true,
  })
  if (existing) return existing

  try {
    return await BookmarkCollection.create({
      userId,
      name: FAVOURITES_NAME,
      isDefault: true,
    })
  } catch (error) {
    // A non-default collection already named "Favourites" — promote it
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      const byName = await BookmarkCollection.findOneAndUpdate(
        { userId, name: FAVOURITES_NAME },
        { $set: { isDefault: true } },
        { new: true },
      )
      if (byName) return byName
    }
    throw error
  }
}
