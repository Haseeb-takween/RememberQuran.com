import { hash } from "bcryptjs"
import mongoose from "mongoose"
import { NextResponse } from "next/server"
import { validateCredentials } from "@/lib/auth/credentials"
import { connectToDatabase } from "@/lib/db"
import { BookmarkCollection } from "@/lib/models/BookmarkCollection"
import { User } from "@/lib/models/User"

export const runtime = "nodejs"

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

    // Build unique indexes before accepting the first registration. This
    // prevents duplicate emails during concurrent requests on a fresh DB.
    await Promise.all([User.init(), BookmarkCollection.init()])

    const existingUser = await User.exists({ email: parsed.data.email })
    if (existingUser) {
      return json({ error: "An account with this email already exists." }, 409)
    }

    const passwordHash = await hash(parsed.data.password, 12)
    const session = await mongoose.startSession()
    let userId = ""

    try {
      await session.withTransaction(async () => {
        const [user] = await User.create(
          [
            {
              email: parsed.data.email,
              passwordHash,
              profile: { displayName },
            },
          ],
          { session },
        )

        userId = user._id.toString()

        await BookmarkCollection.create(
          [
            {
              userId: user._id,
              name: "Favourites",
              isDefault: true,
            },
          ],
          { session },
        )
      })
    } finally {
      await session.endSession()
    }

    if (!userId) {
      throw new Error("Registration transaction did not create a user")
    }

    return json(
      {
        user: {
          id: userId,
          email: parsed.data.email,
          name: displayName || null,
        },
      },
      201,
    )
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      return json({ error: "An account with this email already exists." }, 409)
    }

    console.error("Registration failed", error)
    return json(
      { error: "Could not create your account. Please try again." },
      500,
    )
  }
}
