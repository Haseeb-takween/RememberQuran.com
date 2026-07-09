import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-arabic text-6xl leading-none text-foreground/15" dir="rtl" lang="ar">
        ٤٠٤
      </p>
      <div>
        <h1 className="text-lg font-medium text-foreground">Page not found</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This page doesn&apos;t exist.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-primary transition-colors duration-[120ms] hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
      >
        <BookOpen className="size-4" strokeWidth={1.75} />
        Browse all surahs
      </Link>
    </div>
  )
}
