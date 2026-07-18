import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import {
  Bookmark,
  NotebookPen,
  Settings2,
  Target,
  TrendingUp,
} from "lucide-react"
import { AccountNav } from "@/components/account/AccountNav"

export const metadata: Metadata = {
  title: "Account",
}

export const dynamic = "force-dynamic"

const links = [
  {
    href: "/account/bookmarks",
    label: "Bookmarks",
    description: "Saved ayahs and collections",
    icon: Bookmark,
    soon: false,
  },
  {
    href: "/account/notes",
    label: "Notes",
    description: "Private notes on ayahs",
    icon: NotebookPen,
    soon: false,
  },
  {
    href: "/account/progress",
    label: "Progress",
    description: "Continue where you left off",
    icon: TrendingUp,
    soon: true,
  },
  {
    href: "/account/goals",
    label: "Goals & streaks",
    description: "Daily reading goals",
    icon: Target,
    soon: true,
  },
  {
    href: "/account/settings",
    label: "Settings",
    description: "Profile, email, and password",
    icon: Settings2,
    soon: false,
  },
] as const

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account")
  }

  const name =
    session.user.name?.trim() ||
    session.user.email?.split("@")[0] ||
    "friend"

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <AccountNav />
      <h1 className="font-serif text-3xl font-medium tracking-tight">
        Assalamu alaikum, {name}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your personal space. Reading the Quran stays free — these tools save
        your journey.
      </p>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {links.map(({ href, label, description, icon: Icon, soon }) => {
          const row = (
            <>
              <Icon className="mt-0.5 size-4 text-primary" strokeWidth={1.75} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {label}
                  {soon && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-normal text-muted-foreground">
                      Coming next
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {description}
                </span>
              </span>
            </>
          )

          return (
            <li key={href}>
              {soon ? (
                <div className="flex items-start gap-3 py-4 opacity-80">{row}</div>
              ) : (
                <Link
                  href={href}
                  className="flex items-start gap-3 border-l-2 border-l-transparent py-4 pl-3 transition-all duration-200 hover:border-l-primary hover:bg-accent/40 hover:pl-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {row}
                </Link>
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-6 text-xs text-muted-foreground">
        Signed in as {session.user.email}
      </p>
    </div>
  )
}
