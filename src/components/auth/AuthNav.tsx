"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

const navLink =
  "flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground"

export function AuthNav() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  if (status === "loading") {
    return (
      <div
        aria-hidden
        className="mx-1 h-9 w-16 animate-pulse rounded-md bg-muted/50"
      />
    )
  }

  if (!session?.user) {
    return (
      <Link href="/login?next=/account" className={cn(navLink, FOCUS)}>
        <UserRound className="size-3.5" strokeWidth={1.75} />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    )
  }

  const label =
    session.user.name?.trim() ||
    session.user.email?.split("@")[0] ||
    "Account"

  return (
    <div className="flex items-center gap-0.5">
      <Link
        href="/account"
        title={session.user.email ?? "Account"}
        className={cn(
          navLink,
          pathname.startsWith("/account") && "text-primary",
          FOCUS,
        )}
      >
        <UserRound className="size-3.5" strokeWidth={1.75} />
        <span className="hidden max-w-[7rem] truncate sm:inline">{label}</span>
      </Link>
      <button
        type="button"
        title="Sign out"
        aria-label="Sign out"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={cn(navLink, FOCUS)}
      >
        <LogOut className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}
