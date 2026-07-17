"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useSession } from "next-auth/react"

interface BookmarkEntry {
  verseKey: string
  collectionId: string
}

interface BookmarksContextValue {
  /** True once the signed-in user's bookmarks have loaded */
  loaded: boolean
  isBookmarked: (verseKey: string) => boolean
  isPending: (verseKey: string) => boolean
  toggle: (verseKey: string) => Promise<void>
  /** Re-sync reader icons after account-page mutations */
  refresh: () => Promise<void>
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

async function fetchBookmarkKeys(): Promise<Set<string>> {
  const res = await fetch("/api/account/bookmarks")
  if (!res.ok) return new Set()
  const data = (await res.json()) as { bookmarks?: BookmarkEntry[] }
  return new Set((data.bookmarks ?? []).map((b) => b.verseKey))
}

/**
 * One GET per session holds every saved verseKey in memory (2000 cap — a few
 * KB), so ayah icons render instantly with no per-verse requests.
 *
 * The effect uses Promise.then() chaining so setKeys is always called inside a
 * microtask callback, never synchronously in the effect body.
 */
export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  const [keys, setKeys] = useState<Set<string> | null>(null)
  /** Which user `keys` belongs to — prevents showing the previous account briefly */
  const [keysUserId, setKeysUserId] = useState<string | null>(null)
  const [pending, setPending] = useState<Set<string>>(new Set())

  // Only expose keys when they match the signed-in user
  const effectiveKeys =
    userId && keysUserId === userId ? keys : null

  // Synced after every render via useEffect so toggle always reads the latest
  // value without stale closures — written only in effects, never during render.
  const effectiveKeysRef = useRef<Set<string> | null>(null)
  const pendingRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    effectiveKeysRef.current = effectiveKeys
  })
  useEffect(() => {
    pendingRef.current = pending
  })

  // Effect uses .then() so setState runs in a microtask, not synchronously in
  // the effect body — this is what react-hooks/set-state-in-effect requires.
  useEffect(() => {
    let cancelled = false
    const fetchFor = userId

    Promise.resolve()
      .then(() => {
        if (cancelled) return
        setKeys(null)
        setKeysUserId(null)
        setPending(new Set())
        if (!fetchFor) return
        return fetchBookmarkKeys()
      })
      .then((newKeys) => {
        if (cancelled || !newKeys || !fetchFor) return
        setKeys(newKeys)
        setKeysUserId(fetchFor)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [userId])

  const refresh = useCallback(async () => {
    if (!userId) return
    try {
      const newKeys = await fetchBookmarkKeys()
      setKeys(newKeys)
      setKeysUserId(userId)
    } catch {
      // Reader stays usable — icons show unsaved state until next refresh
    }
  }, [userId])

  const isBookmarked = useCallback(
    (verseKey: string) => effectiveKeys?.has(verseKey) ?? false,
    [effectiveKeys],
  )

  const isPending = useCallback(
    (verseKey: string) => pending.has(verseKey),
    [pending],
  )

  const toggle = useCallback(async (verseKey: string) => {
    // Wait until this user's keys have loaded — otherwise we cannot tell
    // save vs remove and would always POST.
    if (effectiveKeysRef.current === null) return
    if (pendingRef.current.has(verseKey)) return
    const wasSaved = effectiveKeysRef.current.has(verseKey)

    // Optimistic flip — revert on failure, never block reading
    setPending((prev) => new Set(prev).add(verseKey))
    setKeys((prev) => {
      const next = new Set(prev ?? [])
      if (wasSaved) next.delete(verseKey)
      else next.add(verseKey)
      return next
    })

    try {
      const res = wasSaved
        ? await fetch(
            `/api/account/bookmarks?verseKey=${encodeURIComponent(verseKey)}`,
            { method: "DELETE" },
          )
        : await fetch("/api/account/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ verseKey }),
          })
      if (!res.ok) throw new Error(`Bookmark toggle failed: ${res.status}`)
    } catch {
      // Revert optimistic update
      setKeys((prev) => {
        const next = new Set(prev ?? [])
        if (wasSaved) next.add(verseKey)
        else next.delete(verseKey)
        return next
      })
    } finally {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(verseKey)
        return next
      })
    }
  }, [])

  const value = useMemo(
    () => ({
      loaded: effectiveKeys !== null,
      isBookmarked,
      isPending,
      toggle,
      refresh,
    }),
    [effectiveKeys, isBookmarked, isPending, toggle, refresh],
  )

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider")
  return ctx
}
