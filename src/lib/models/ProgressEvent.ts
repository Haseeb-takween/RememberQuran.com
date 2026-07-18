import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/**
 * Reading activity event stream — powers progress %, daily goals, and later
 * learning plans (M5). One row can cover a viewed ayah range within a surah.
 */
const progressEventSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    surah: {
      type: Number,
      required: true,
      min: 1,
      max: 114,
    },
    fromAyah: {
      type: Number,
      required: true,
      min: 1,
    },
    toAyah: {
      type: Number,
      required: true,
      min: 1,
    },
    /** Calendar day key — store UTC date at midnight for consistent streak days */
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "progress_events",
  },
)

progressEventSchema.index({ userId: 1, date: 1 })
progressEventSchema.index({ userId: 1, surah: 1 })
/** One upsertable row per user / surah / UTC day */
progressEventSchema.index({ userId: 1, surah: 1, date: 1 }, { unique: true })

export type ProgressEventDocument = InferSchemaType<
  typeof progressEventSchema
> & {
  _id: mongoose.Types.ObjectId
}

export type ProgressEventModel = Model<ProgressEventDocument>

export const ProgressEvent: ProgressEventModel =
  (mongoose.models.ProgressEvent as ProgressEventModel | undefined) ??
  mongoose.model<ProgressEventDocument>("ProgressEvent", progressEventSchema)
