"use client"

import { Bookmark } from "lucide-react"
import { useSession } from "next-auth/react"
import { useBookmarks } from "@/context/BookmarksContext"
import { useSoftGate } from "@/context/SoftGateContext"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  verseKey: string
  className?: string
  iconClassName?: string
}

/**
 * Toggle bookmark for one ayah. Guests get the soft-gate; signed-in users get
 * an optimistic filled icon that reverts if the API call fails.
 */
export function BookmarkButton({
  verseKey,
  className,
  iconClassName,
}: BookmarkButtonProps) {
  const { data: session, status } = useSession()
  const { requireAuth } = useSoftGate()
  const { loaded, isBookmarked, isPending, toggle } = useBookmarks()

  const saved = isBookmarked(verseKey)
  const pending = isPending(verseKey)
  const signedIn = Boolean(session?.user)
  // Signed-in users wait for their keys so toggle knows save vs remove
  const waitingForKeys = signedIn && !loaded

  function handleClick() {
    if (status === "loading" || waitingForKeys) return
    if (!session?.user) {
      requireAuth("bookmark")
      return
    }
    void toggle(verseKey)
  }

  return (
    <button
      type="button"
      title={saved ? "Remove bookmark" : "Bookmark"}
      aria-label={saved ? `Remove bookmark ${verseKey}` : `Bookmark ${verseKey}`}
      aria-pressed={saved}
      disabled={pending || waitingForKeys}
      onClick={handleClick}
      className={cn(className, saved && "text-primary hover:text-primary")}
    >
      <Bookmark
        className={iconClassName}
        strokeWidth={1.75}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  )
}
