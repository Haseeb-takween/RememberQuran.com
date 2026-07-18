"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpenText, Headphones, ImagePlus, Search } from "lucide-react"
import { AuthNav } from "@/components/auth/AuthNav"
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
        "border-b transition-[border-color] duration-150 ease-out",
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
            href="/"
            aria-label="Browse the Quran"
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-2.5",
              "text-xs text-muted-foreground transition-colors duration-120 hover:bg-accent hover:text-foreground",
              (pathname === "/" || /^\/\d+/.test(pathname)) && "text-primary",
              FOCUS,
            )}
          >
            <BookOpenText className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Quran</span>
          </Link>
          <Link
            href="/radio"
            aria-label="Quran Radio"
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-2.5",
              "text-xs text-muted-foreground transition-colors duration-120 hover:bg-accent hover:text-foreground",
              pathname === "/radio" && "text-primary",
              FOCUS,
            )}
          >
            <Headphones className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Listen</span>
          </Link>
          <Link
            href="/media-maker"
            aria-label="Create an ayah card"
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-2.5",
              "text-xs text-muted-foreground transition-colors duration-120 hover:bg-accent hover:text-foreground",
              pathname === "/media-maker" && "text-primary",
              FOCUS,
            )}
          >
            <ImagePlus className="size-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Create</span>
          </Link>
          <Link
            href="/search"
            aria-label="Search the Quran"
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-md px-2.5",
              "text-xs text-muted-foreground transition-colors duration-120 hover:bg-accent hover:text-foreground",
              pathname === "/search" && "text-primary",
              FOCUS,
            )}
          >
            <Search className="size-3.5" strokeWidth={1.75} />
            <span className="sr-only">Search</span>
          </Link>
          <AuthNav />
        </div>
      </div>
    </header>
  )
}
