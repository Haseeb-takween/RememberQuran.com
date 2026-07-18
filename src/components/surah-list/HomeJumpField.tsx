"use client"

import { Search } from "lucide-react"
import { useUI } from "@/context/UIContext"

/** Opens the global Surah/ayah command palette from the homepage. */
export function HomeJumpField() {
  const { setCommandOpen } = useUI()

  return (
    <button
      type="button"
      onClick={() => setCommandOpen(true)}
      className="group flex w-full max-w-xl items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
        <Search className="size-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-foreground">
          Jump to a Surah or ayah
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          Search Al-Baqarah, or type 2:255
        </span>
      </span>
      <kbd className="hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
        ⌘K
      </kbd>
    </button>
  )
}
