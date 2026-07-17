import { auth } from "@/auth"
import { privateJson } from "@/lib/auth/api-response"
import { connectToDatabase } from "@/lib/db"
import { User } from "@/lib/models/User"

export const runtime = "nodejs"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return privateJson({ error: "Unauthorized." }, 401)
  }

  let body: { displayName?: unknown }
  try {
    body = (await request.json()) as { displayName?: unknown }
  } catch {
    return privateJson({ error: "Invalid JSON body." }, 400)
  }

  if (typeof body.displayName !== "string") {
    return privateJson({ error: "Display name is required." }, 400)
  }

  const displayName = body.displayName.trim()
  if (displayName.length > 80) {
    return privateJson(
      { error: "Display name must be at most 80 characters." },
      400,
    )
  }

  await connectToDatabase()
  const user = await User.findByIdAndUpdate(
    session.user.id,
    { $set: { "profile.displayName": displayName } },
    { new: true, runValidators: true },
  ).lean()

  if (!user) return privateJson({ error: "Account not found." }, 404)

  return privateJson({
    ok: true,
    profile: { displayName: user.profile?.displayName ?? "" },
  })
}
