"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

/**
 * Client account links so the root layout Footer does not call `auth()`.
 * Server `auth()` in Footer forced every page to `private, no-store` (no CDN cache).
 */
export function FooterAccountLinks() {
  const { data: session, status } = useSession()
  const signedIn = status === "authenticated" && Boolean(session?.user?.id)

  const links = signedIn
    ? [
        { label: "Overview", href: "/account" },
        { label: "Bookmarks", href: "/account/bookmarks" },
        { label: "Settings", href: "/account/settings" },
      ]
    : [
        { label: "Sign in", href: "/login" },
        { label: "Register", href: "/register" },
        { label: "Bookmarks", href: "/account/bookmarks" },
      ]

  return (
    <ul className="flex flex-col gap-2">
      {links.map(({ label, href }) => (
        <li key={href}>
          <Link
            href={href}
            className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
