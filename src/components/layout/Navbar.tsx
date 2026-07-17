"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { RadioTower, TextSearch } from "lucide-react"
import { AuthNav } from "@/components/auth/AuthNav"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { LogoWordmark } from "@/components/layout/Logo"
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
            "mr-auto rounded-sm transition-opacity duration-150 hover:opacity-80",
            FOCUS,
          )}
        >
          <LogoWordmark size="md" />
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
