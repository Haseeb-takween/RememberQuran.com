import Link from "next/link"
import { LogoMark } from "@/components/layout/Logo"

const YEAR = new Date().getFullYear()

const footerLinks = [
  {
    heading: "Quran",
    links: [
      { label: "Al-Fatihah", href: "/1" },
      { label: "Al-Baqarah", href: "/2" },
      { label: "Yasin", href: "/36" },
      { label: "Al-Mulk", href: "/67" },
      { label: "Al-Kahf", href: "/18" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { label: "All Surahs", href: "/" },
      { label: "Search", href: "/search" },
      { label: "Radio", href: "/radio" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "Bookmarks", href: "/account/bookmarks" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              aria-label="RememberQuran — home"
              className="inline-flex items-center gap-2 text-foreground transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
            >
              <LogoMark size={26} className="text-primary" />
              <span className="font-medium tracking-tight">
                Remember
                <span className="font-serif text-primary">Quran</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Read, listen, and understand the Quran. Free for everyone,
              forever.
            </p>
            <p className="mt-4 font-uthmani text-xl leading-loose text-foreground/60" dir="rtl" lang="ar">
              ٱقْرَأْ بِٱسْمِ رَبِّكَ
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Read in the name of your Lord — 96:1
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {YEAR} RememberQuran. Public-benefit — no ads, no tracking.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Quran text: King Fahd Complex (Hafs). Translations © respective translators.
          </p>
        </div>
      </div>
    </footer>
  )
}
