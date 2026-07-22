import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

/**
 * Memorised ayahs for hifz tracking (M5). Separate from ProgressEvent so
 * reading activity and memorisation stay distinct.
 */
const memorisedAyahSchema = new Schema(
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
    surahId: {
      type: Number,
      required: true,
      min: 1,
      max: 114,
    },
    ayahId: {
      type: Number,
      required: true,
      min: 1,
    },
    memorisedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    timestamps: false,
    collection: "memorised_ayahs",
  },
)

memorisedAyahSchema.index({ userId: 1, verseKey: 1 }, { unique: true })
memorisedAyahSchema.index({ userId: 1, surahId: 1 })

export type MemorisedAyahDocument = InferSchemaType<typeof memorisedAyahSchema> & {
  _id: mongoose.Types.ObjectId
}

export type MemorisedAyahModel = Model<MemorisedAyahDocument>

export const MemorisedAyah: MemorisedAyahModel =
  (mongoose.models.MemorisedAyah as MemorisedAyahModel | undefined) ??
  mongoose.model<MemorisedAyahDocument>("MemorisedAyah", memorisedAyahSchema)
