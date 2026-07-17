import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/**
 * Bookmark folder. Named BookmarkCollection in code so it is not confused
 * with MongoDB's native Collection type; stored as `collections` in Atlas.
 */
const bookmarkCollectionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    /** Seeded "Favourites" — protect from delete in API layer */
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    collection: "collections",
  },
)

bookmarkCollectionSchema.index(
  { userId: 1, name: 1 },
  { unique: true },
)

export type BookmarkCollectionDocument = InferSchemaType<
  typeof bookmarkCollectionSchema
> & {
  _id: mongoose.Types.ObjectId
}

export type BookmarkCollectionModel = Model<BookmarkCollectionDocument>

export const BookmarkCollection: BookmarkCollectionModel =
  (mongoose.models.BookmarkCollection as BookmarkCollectionModel | undefined) ??
  mongoose.model<BookmarkCollectionDocument>(
    "BookmarkCollection",
    bookmarkCollectionSchema,
  )
