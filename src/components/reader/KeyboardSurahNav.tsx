"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface KeyboardSurahNavProps {
  prevId: number | null
  nextId: number | null
}

export function KeyboardSurahNav({ prevId, nextId }: KeyboardSurahNavProps) {
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Skip if focus is inside a text input or contenteditable
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return
      // Skip if any modifier is held (avoid conflicting with browser shortcuts)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === "[" && prevId) {
        e.preventDefault()
        router.push(`/${prevId}`)
      } else if (e.key === "]" && nextId) {
        e.preventDefault()
        router.push(`/${nextId}`)
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [prevId, nextId, router])

  return null
}
