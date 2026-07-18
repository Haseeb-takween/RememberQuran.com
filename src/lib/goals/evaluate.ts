import { Goal, type GoalType } from "@/lib/models/Goal"
import { ProgressEvent } from "@/lib/models/ProgressEvent"
import { StreakState } from "@/lib/models/StreakState"
import { countInGoalUnits } from "@/lib/goals/constants"
import { utcDayStart } from "@/lib/progress/date"

function addUtcDays(day: Date, days: number): Date {
  const next = new Date(day)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function sameUtcDay(a: Date | null | undefined, b: Date): boolean {
  if (!a) return false
  return utcDayStart(a).getTime() === b.getTime()
}

/** Sum ayahs covered by ProgressEvents on a given UTC day. */
export async function sumAyahsForDay(
  userId: string,
  day: Date,
): Promise<number> {
  const events = await ProgressEvent.find({ userId, date: day })
    .select("fromAyah toAyah")
    .lean()
  let total = 0
  for (const e of events) {
    total += Math.max(0, e.toAyah - e.fromAyah + 1)
  }
  return total
}

export interface GoalSnapshot {
  goal: {
    type: GoalType
    target: number
  } | null
  todayAyahs: number
  todayCount: number
  metToday: boolean
  streak: {
    currentStreak: number
    longestStreak: number
    lastMetDate: string | null
  }
  /** Last 7 UTC days ending today — true if goal was met that day (approx via lastMet + events) */
  week: Array<{ date: string; met: boolean }>
}

/**
 * Recompute streak against the active goal using today's ProgressEvents.
 * Safe to call often (idempotent for same day).
 */
export async function evaluateGoalAndStreak(userId: string): Promise<GoalSnapshot> {
  const today = utcDayStart()
  const yesterday = addUtcDays(today, -1)

  const [goal, todayAyahs, streakDoc] = await Promise.all([
    Goal.findOne({ userId, active: true }).lean(),
    sumAyahsForDay(userId, today),
    StreakState.findOne({ userId }).lean(),
  ])

  let currentStreak = streakDoc?.currentStreak ?? 0
  let longestStreak = streakDoc?.longestStreak ?? 0
  let lastMetDate: Date | null = streakDoc?.lastMetDate
    ? utcDayStart(streakDoc.lastMetDate)
    : null

  const todayCount = goal
    ? countInGoalUnits(todayAyahs, goal.type as GoalType)
    : todayAyahs
  const metToday = Boolean(goal && todayCount >= goal.target)

  if (goal) {
    if (metToday) {
      if (sameUtcDay(lastMetDate, today)) {
        // already counted today
      } else if (sameUtcDay(lastMetDate, yesterday)) {
        currentStreak += 1
        lastMetDate = today
      } else {
        currentStreak = 1
        lastMetDate = today
      }
      longestStreak = Math.max(longestStreak, currentStreak)
    } else if (lastMetDate && lastMetDate.getTime() < yesterday.getTime()) {
      // Missed at least one full day
      currentStreak = 0
    }

    await StreakState.findOneAndUpdate(
      { userId },
      {
        $set: {
          currentStreak,
          longestStreak,
          lastMetDate,
        },
        $setOnInsert: { userId },
      },
      { upsert: true, new: true },
    )
  } else if (lastMetDate && lastMetDate.getTime() < yesterday.getTime()) {
    // No active goal — still clear stale current streak on miss
    currentStreak = 0
    await StreakState.findOneAndUpdate(
      { userId },
      { $set: { currentStreak: 0, longestStreak, lastMetDate } },
      { upsert: true },
    )
  }

  // Week strip: for each of last 7 days, mark met if we have enough ayahs
  // that day against current goal target (historical days use today's goal)
  const week: Array<{ date: string; met: boolean }> = []
  for (let i = 6; i >= 0; i--) {
    const day = addUtcDays(today, -i)
    const ayahs = i === 0 ? todayAyahs : await sumAyahsForDay(userId, day)
    const count = goal
      ? countInGoalUnits(ayahs, goal.type as GoalType)
      : 0
    const met = Boolean(goal && count >= goal.target)
    week.push({ date: day.toISOString(), met })
  }

  return {
    goal: goal
      ? { type: goal.type as GoalType, target: goal.target }
      : null,
    todayAyahs,
    todayCount: goal ? todayCount : 0,
    metToday,
    streak: {
      currentStreak,
      longestStreak,
      lastMetDate: lastMetDate ? lastMetDate.toISOString() : null,
    },
    week,
  }
}
