import { NextResponse } from "next/server"
import mongoose from "mongoose"
import {
  connectToDatabase,
  getDbReadyState,
  isDbConnected,
} from "@/lib/db"

/**
 * Liveness / readiness for M4 infrastructure.
 * Always dynamic — never cache health across deploys or cold starts.
 */
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const READY_STATE_LABEL: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
}

export async function GET() {
  const started = Date.now()
  const hasUri = Boolean(process.env.MONGODB_URI?.trim())

  if (!hasUri) {
    return NextResponse.json(
      {
        ok: false,
        service: "rememberquran",
        database: {
          configured: false,
          connected: false,
          readyState: READY_STATE_LABEL[0],
          error: "MONGODB_URI is not set",
        },
        durationMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    )
  }

  try {
    await connectToDatabase()

    // Cheap round-trip so we know the socket works, not just that connect() resolved
    const db = mongoose.connection.db
    if (!db) {
      throw new Error("MongoDB connection has no database handle")
    }
    await db.admin().ping()

    const readyState = getDbReadyState()

    return NextResponse.json(
      {
        ok: true,
        service: "rememberquran",
        database: {
          configured: true,
          connected: isDbConnected(),
          readyState: READY_STATE_LABEL[readyState] ?? String(readyState),
        },
        durationMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error"

    return NextResponse.json(
      {
        ok: false,
        service: "rememberquran",
        database: {
          configured: true,
          connected: false,
          readyState: READY_STATE_LABEL[getDbReadyState()] ?? "unknown",
          error: message,
        },
        durationMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    )
  }
}
