import mongoose from "mongoose"

/**
 * Next.js (especially `next dev` + serverless) can reload modules and create
 * many Mongo connections. Cache the client on `globalThis` so hot reloads reuse
 * one connection — standard Mongoose + App Router pattern.
 */
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var -- intentional global singleton for HMR
  var mongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
}

globalThis.mongooseCache = cache

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim()
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Add it to .env (see .env.example).",
    )
  }
  return uri
}

/**
 * Connect to MongoDB Atlas. Safe to call from every Route Handler —
 * subsequent calls reuse the cached connection.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn
  }

  if (!cache.promise) {
    const uri = getMongoUri()
    cache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
  }

  try {
    cache.conn = await cache.promise
  } catch (error) {
    cache.promise = null
    throw error
  }

  return cache.conn
}

/** Ready states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting */
export function getDbReadyState(): number {
  return mongoose.connection.readyState
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1
}
