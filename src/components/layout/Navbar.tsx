"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { BookOpenText, Headphones, ImagePlus, Search } from "lucide-react"
import { AuthNav } from "@/components/auth/AuthNav"
import { LogoWordmark } from "@/components/layout/Logo"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { cn } from "@/lib/utils"

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

const NAV: {
  href: string
  label: string
  icon: LucideIcon
  match: (p: string) => boolean
  hideLabel?: boolean
}[] = [
  {
    href: "/",
    label: "Quran",
    icon: BookOpenText,
    match: (p: string) => p === "/" || /^\/\d+/.test(p),
  },
  {
    href: "/radio",
    label: "Listen",
    icon: Headphones,
    match: (p: string) => p === "/radio",
  },
  {
    href: "/media-maker",
    label: "Create",
    icon: ImagePlus,
    match: (p: string) => p === "/media-maker",
  },
  {
    href: "/search",
    label: "Search",
    icon: Search,
    match: (p: string) => p === "/search",
    hideLabel: true,
  },
]

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
        "sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md",
        "border-b transition-[border-color,box-shadow] duration-200 ease-out",
        scrolled
          ? "border-border shadow-[0_1px_0_0_color-mix(in_oklch,var(--brand-gold)_32%,transparent)]"
          : "border-border/40",
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:px-4">
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

        <nav className="flex items-center gap-0.5">
          {NAV.map(({ href, label, icon: Icon, match, hideLabel }) => {
            const active = match(pathname)
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs transition-colors duration-150",
                  active
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  FOCUS,
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {hideLabel ? (
                  <span className="sr-only">{label}</span>
                ) : (
                  <span className="hidden sm:inline">{label}</span>
                )}
              </Link>
            )
          })}
          <ThemeToggle />
          <AuthNav />
        </nav>
      </div>
    </header>
  )
}
