import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"
import { NOTE_TEXT_MAX_LENGTH } from "@/lib/notes/text"

const noteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verseKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 16,
    },
    /** Plain text only — never render as HTML */
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: NOTE_TEXT_MAX_LENGTH,
    },
  },
  {
    timestamps: true,
    collection: "notes",
  },
)

noteSchema.index({ userId: 1, verseKey: 1 }, { unique: true })

export type NoteDocument = InferSchemaType<typeof noteSchema> & {
  _id: mongoose.Types.ObjectId
}

export type NoteModel = Model<NoteDocument>

export const Note: NoteModel =
  (mongoose.models.Note as NoteModel | undefined) ??
  mongoose.model<NoteDocument>("Note", noteSchema)
