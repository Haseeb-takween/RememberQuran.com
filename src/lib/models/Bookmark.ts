import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

const bookmarkSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /** Canonical ayah id, e.g. "2:255" */
    verseKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 16,
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "BookmarkCollection",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "bookmarks",
  },
)

bookmarkSchema.index({ userId: 1, verseKey: 1 }, { unique: true })
bookmarkSchema.index({ userId: 1, collectionId: 1 })

export type BookmarkDocument = InferSchemaType<typeof bookmarkSchema> & {
  _id: mongoose.Types.ObjectId
}

export type BookmarkModel = Model<BookmarkDocument>

export const Bookmark: BookmarkModel =
  (mongoose.models.Bookmark as BookmarkModel | undefined) ??
  mongoose.model<BookmarkDocument>("Bookmark", bookmarkSchema)
