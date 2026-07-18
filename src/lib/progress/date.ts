/**
 * Client-safe progress date helpers. Must never import Mongoose models
 * (ProgressTracker / ContinuePrompt run in the browser).
 */

/** UTC midnight for the calendar day of `d` (default: now). */
export function utcDayStart(d: Date = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export const TOTAL_SURAHS = 114
export const PROGRESS_DWELL_MS = 3_000
export const POSITION_THROTTLE_MS = 8_000
export const EVENT_DEBOUNCE_MS = 15_000

export const CONTINUE_DISMISS_KEY = "rq-continue-dismissed"
