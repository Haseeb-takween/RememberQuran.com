import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

const streakStateSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentStreak: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    longestStreak: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    /** Last calendar day (UTC midnight) the daily goal was met */
    lastMetDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "streak_states",
  },
)

export type StreakStateDocument = InferSchemaType<typeof streakStateSchema> & {
  _id: mongoose.Types.ObjectId
}

export type StreakStateModel = Model<StreakStateDocument>

export const StreakState: StreakStateModel =
  (mongoose.models.StreakState as StreakStateModel | undefined) ??
  mongoose.model<StreakStateDocument>("StreakState", streakStateSchema)
