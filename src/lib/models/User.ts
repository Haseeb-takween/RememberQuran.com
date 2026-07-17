import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

const lastPositionSchema = new Schema(
  {
    verseKey: { type: String, required: true },
    surahId: { type: Number, required: true, min: 1, max: 114 },
    ayahId: { type: Number, required: true, min: 1 },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
)

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    profile: {
      displayName: { type: String, trim: true, maxlength: 80, default: "" },
      avatarUrl: { type: String, trim: true, maxlength: 2048, default: null },
    },
    /** Future community — unused in M4 UI */
    roles: {
      type: [String],
      default: () => ["user"],
    },
    /** Future moderation — enforce suspended check on login */
    moderation: {
      flagged: { type: Boolean, default: false },
      suspended: { type: Boolean, default: false },
    },
    settings: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    lastPosition: {
      type: lastPositionSchema,
      default: null,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },
    passwordResetRequestedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
)

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId
}

export type UserModel = Model<UserDocument>

export const User: UserModel =
  (mongoose.models.User as UserModel | undefined) ??
  mongoose.model<UserDocument>("User", userSchema)
