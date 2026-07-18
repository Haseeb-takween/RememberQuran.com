import { getSessionUserId } from "@/lib/auth/session"
import { privateJson } from "@/lib/auth/api-response"
import { connectToDatabase } from "@/lib/db"
import { Goal } from "@/lib/models/Goal"
import {
  isGoalType,
  validateGoalTarget,
} from "@/lib/goals/constants"
import { evaluateGoalAndStreak } from "@/lib/goals/evaluate"

export const runtime = "nodejs"

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = (await request.json()) as unknown
    return typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export async function GET() {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  await connectToDatabase()
  const snapshot = await evaluateGoalAndStreak(userId)
  return privateJson(snapshot as unknown as Record<string, unknown>)
}

export async function PUT(request: Request) {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  const body = await readBody(request)
  if (!body) return privateJson({ error: "Invalid JSON body." }, 400)

  if (!isGoalType(body.type)) {
    return privateJson({ error: "Type must be ayahs or pages." }, 400)
  }
  const type = body.type
  const target = Number(body.target)
  const targetError = validateGoalTarget(type, target)
  if (targetError) return privateJson({ error: targetError }, 400)

  await connectToDatabase()

  let goal = await Goal.findOne({ userId, active: true })
  if (goal) {
    goal.type = type
    goal.target = target
    await goal.save()
  } else {
    try {
      goal = await Goal.create({ userId, type, target, active: true })
    } catch (error) {
      goal = await Goal.findOneAndUpdate(
        { userId, active: true },
        { $set: { type, target } },
        { new: true },
      )
      if (!goal) {
        console.error("Goal create failed", error)
        return privateJson({ error: "Could not save goal." }, 500)
      }
    }
  }

  const snapshot = await evaluateGoalAndStreak(userId)
  return privateJson({
    ...(snapshot as unknown as Record<string, unknown>),
    goal: { type: goal.type, target: goal.target },
  })
}

export async function DELETE() {
  const userId = await getSessionUserId()
  if (!userId) return privateJson({ error: "Unauthorized." }, 401)

  await connectToDatabase()
  await Goal.updateMany({ userId, active: true }, { $set: { active: false } })

  const snapshot = await evaluateGoalAndStreak(userId)
  return privateJson(snapshot as unknown as Record<string, unknown>)
}
