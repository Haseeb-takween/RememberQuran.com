import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

export const GOAL_TYPES = ["pages", "ayahs"] as const
export type GoalType = (typeof GOAL_TYPES)[number]

const goalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: GOAL_TYPES,
      required: true,
    },
    target: {
      type: Number,
      required: true,
      min: 1,
      max: 6236,
    },
    /** Prefer a single active goal per user — enforce in API */
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    collection: "goals",
  },
)

goalSchema.index(
  { userId: 1, active: 1 },
  {
    unique: true,
    partialFilterExpression: { active: true },
  },
)

export type GoalDocument = InferSchemaType<typeof goalSchema> & {
  _id: mongoose.Types.ObjectId
}

export type GoalModel = Model<GoalDocument>

export const Goal: GoalModel =
  (mongoose.models.Goal as GoalModel | undefined) ??
  mongoose.model<GoalDocument>("Goal", goalSchema)
