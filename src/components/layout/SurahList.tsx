"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { Search } from "lucide-react"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface SurahListProps {
  chapters: Chapter[]
  onNavigate?: () => void
  showSearch?: boolean
}

export function SurahList({
  chapters,
  onNavigate,
  showSearch = true,
}: SurahListProps) {
  const pathname = usePathname()
  const [query, setQuery] = useState("")

  const activeSurahId = (() => {
    const match = pathname.match(/^\/(\d+)/)
    return match ? Number(match[1]) : null
  })()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return chapters
    return chapters.filter(
      (c) =>
        String(c.id) === q ||
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(query.trim()) ||
        c.translated_name.name.toLowerCase().includes(q),
    )
  }, [chapters, query])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showSearch && (
        <div className="shrink-0 border-b border-border/60 bg-sidebar px-2 py-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search surah"
              aria-label="Search surahs"
              className="h-8 border-border/60 bg-background pl-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Native overflow so the full 114-surah list is always scrollable */}
      <nav
        aria-label="Surahs"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <ul className="space-y-0.5 px-2 py-2">
          {filtered.map((chapter) => {
            const isActive = activeSurahId === chapter.id
            return (
              <li key={chapter.id} className="relative">
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.span
                      layoutId="surah-active-indicator"
                      className="absolute bottom-1 left-0 top-1 w-0.5 rounded-full bg-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </AnimatePresence>
                <Link
                  href={`/${chapter.id}`}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5",
                    "text-sm transition-colors duration-[120ms] ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary/5 font-medium text-primary"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground active:bg-secondary",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {chapter.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{chapter.name_simple}</span>
                  <span
                    className="font-uthmani shrink-0 text-base leading-none text-foreground/50"
                    dir="rtl"
                    lang="ar"
                  >
                    {chapter.name_arabic}
                  </span>
                </Link>
              </li>
            )
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">
              No surahs match “{query}”
            </li>
          )}
        </ul>
      </nav>
    </div>
  )
}
