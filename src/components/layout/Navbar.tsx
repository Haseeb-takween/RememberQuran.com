"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Search, RadioTower } from "lucide-react"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { useUI } from "@/context/UIContext"
import { cn } from "@/lib/utils"

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

function isMac() {
  if (typeof window === "undefined") return false
  return /mac/i.test(navigator.platform)
}

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { setCommandOpen } = useUI()

  useEffect(() => {
    setMounted(true)
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm",
        "border-b transition-[border-color] duration-[150ms] ease-out",
        scrolled ? "border-border" : "border-transparent",
      )}
    >
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
        <Link
          href="/"
          aria-label="RememberQuran — home"
          className={cn(
            "mr-auto flex items-center gap-2 rounded-sm",
            "text-foreground transition-colors duration-150 hover:text-foreground/80",
            FOCUS,
          )}
        >
          <BookOpen className="size-5 text-primary" strokeWidth={1.75} />
          <span className="font-medium tracking-tight">
            Remember<span className="text-primary">Quran</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/radio"
            aria-label="Quran Radio"
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-2.5",
              "text-xs text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground",
              pathname === "/radio" && "text-primary",
              FOCUS,
            )}
          >
            <RadioTower className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Radio</span>
          </Link>
          <button
            type="button"
            aria-label="Search surahs"
            onClick={() => setCommandOpen(true)}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md border border-border px-2.5",
              "text-xs text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground",
              FOCUS,
            )}
          >
            <Search className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Search</span>
            {mounted && (
              <kbd className="hidden rounded bg-muted px-1 py-0.5 text-[10px] font-medium sm:inline">
                {isMac() ? "⌘K" : "Ctrl K"}
              </kbd>
            )}
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
