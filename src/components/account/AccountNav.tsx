"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bookmark, LayoutGrid, NotebookPen, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/account", label: "Overview", icon: LayoutGrid },
  { href: "/account/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/account/notes", label: "Notes", icon: NotebookPen },
  { href: "/account/settings", label: "Settings", icon: Settings2 },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Account" className="mb-8 flex gap-1 border-b border-border">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/account" ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-11 items-center gap-2 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active && "text-foreground",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
            {label}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-px bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
