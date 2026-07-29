import { hash } from "bcryptjs"
import mongoose from "mongoose"
import { NextResponse } from "next/server"
import { validateCredentials } from "@/lib/auth/credentials"
import { connectToDatabase } from "@/lib/db"
import { BookmarkCollection } from "@/lib/models/BookmarkCollection"
import { User } from "@/lib/models/User"

export const runtime = "nodejs"
export const maxDuration = 30

const MAX_REQUEST_BYTES = 16_384
const DISPLAY_NAME_MAX_LENGTH = 80

interface RegisterBody {
  email?: unknown
  password?: unknown
  displayName?: unknown
}

function json(
  body: Record<string, unknown>,
  status: number,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > MAX_REQUEST_BYTES) {
    return json({ error: "Request is too large." }, 413)
  }

  let body: RegisterBody
  try {
    body = (await request.json()) as RegisterBody
  } catch {
    return json({ error: "Invalid JSON body." }, 400)
  }

  const parsed = validateCredentials(body.email, body.password)
  if (!parsed.success) {
    return json({ error: parsed.error }, 400)
  }

  const displayName =
    typeof body.displayName === "string" ? body.displayName.trim() : ""

  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return json(
      {
        error: `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`,
      },
      400,
    )
  }

  try {
    await connectToDatabase()

    // Ensure unique indexes exist before first registration (idempotent).
    await Promise.all([User.init(), BookmarkCollection.init()])

    const existingUser = await User.exists({ email: parsed.data.email })
    if (existingUser) {
      return json({ error: "An account with this email already exists." }, 409)
    }

    const passwordHash = await hash(parsed.data.password, 12)

    // Avoid multi-document transactions — they can hang indefinitely on some
    // Atlas / serverless setups and leave the Create account button stuck.
    const user = await User.create({
      email: parsed.data.email,
      passwordHash,
      profile: { displayName },
    })

    try {
      await BookmarkCollection.create({
        userId: user._id,
        name: "Favourites",
        isDefault: true,
      })
    } catch (collectionError) {
      // Best-effort cleanup so a half-created account does not block re-register
      await User.deleteOne({ _id: user._id }).catch(() => undefined)
      throw collectionError
    }

    return json(
      {
        user: {
          id: user._id.toString(),
          email: parsed.data.email,
          name: displayName || null,
        },
      },
      201,
    )
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000
    ) {
      return json({ error: "An account with this email already exists." }, 409)
    }

    console.error("Registration failed", error)
    return json(
      { error: "Could not create your account. Please try again." },
      500,
    )
  }
}
