import { compare } from "bcryptjs"
import mongoose from "mongoose"
import { auth } from "@/auth"
import { privateJson } from "@/lib/auth/api-response"
import { validateEmail } from "@/lib/auth/credentials"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/User"

export const runtime = "nodejs"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return privateJson({ error: "Unauthorized." }, 401)
  }

  let body: { email?: unknown; currentPassword?: unknown }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  const email = validateEmail(body.email)
  if (!email.success) return privateJson({ error: email.error }, 400)

  if (typeof body.currentPassword !== "string") {
    return privateJson({ error: "Current password is required." }, 400)
  }

  try {
    await connectToDatabase()
    const user = await User.findById(session.user.id)
      .select("+passwordHash")
      .exec()

    if (!user) return privateJson({ error: "Account not found." }, 404)

    const correctPassword = await compare(
      body.currentPassword,
      user.passwordHash,
    )
    if (!correctPassword) {
      return privateJson({ error: "Current password is incorrect." }, 400)
    }

    if (user.email === email.email) {
      return privateJson({ ok: true, email: user.email })
    }

    user.email = email.email
    user.emailVerified = null
    await user.save()

    return privateJson({
      ok: true,
      email: user.email,
      reauthenticate: true,
    })
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
      return privateJson(
        { error: "An account with this email already exists." },
        409,
      )
    }
    console.error("Change email failed", error)
    return privateJson({ error: "Could not change email. Please try again." }, 500)
  }
}
