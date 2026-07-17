"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, RadioTower, TextSearch } from "lucide-react"
import { AuthNav } from "@/components/auth/AuthNav"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { cn } from "@/lib/utils"

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
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
          <Link
            href="/search"
            aria-label="Search the Quran"
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-2.5",
              "text-xs text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground",
              pathname === "/search" && "text-primary",
              FOCUS,
            )}
          >
            <TextSearch className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Quran</span>
          </Link>
          <AuthNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
