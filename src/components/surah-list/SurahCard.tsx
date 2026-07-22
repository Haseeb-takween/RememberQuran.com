import Link from "next/link"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface SurahCardProps {
  chapter: Chapter
}

/**
 * Home chapter tile — premium two-column layout.
 * The surah number sits inside an octagonal gold frame (a nod to the
 * geometry of Islamic manuscript illumination); the Arabic name is the
 * visual anchor on the trailing edge.
 */
export function SurahCard({ chapter }: SurahCardProps) {
  const isMakki = chapter.revelation_place === "makkah"

  return (
    <Link
      href={`/${chapter.id}`}
      className={cn(
        "group relative flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5",
        "transition-[background-color,border-color,box-shadow,transform] duration-[150ms] ease-out",
        "hover:-translate-y-px hover:border-[var(--brand-gold)]/40 hover:bg-accent hover:shadow-md hover:shadow-primary/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {/* Octagonal gold number frame */}
      <span className="relative flex size-10 shrink-0 items-center justify-center">
        <svg
          aria-hidden
          viewBox="0 0 40 40"
          className="absolute inset-0 size-full text-[var(--brand-gold)]/45 transition-colors duration-[150ms] group-hover:text-[var(--brand-gold)]/80"
        >
          <polygon
            points="20,1.5 26,4 36,14 38.5,20 36,26 26,36 20,38.5 14,36 4,26 1.5,20 4,14 14,4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        <span className="relative text-xs font-semibold tabular-nums text-[var(--brand-gold)]">
          {chapter.id}
        </span>
      </span>

      {/* Name + meaning */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
          {chapter.name_simple}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {chapter.translated_name.name}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="tabular-nums">{chapter.verses_count} ayahs</span>
          <span aria-hidden>·</span>
          <span
            className={cn(
              "rounded px-1.5 py-px text-[10px] font-medium leading-none",
              isMakki
                ? "bg-[var(--brand-gold)]/12 text-[var(--brand-gold)]"
                : "bg-primary/10 text-primary",
            )}
          >
            {isMakki ? "Makki" : "Madani"}
          </span>
        </div>
      </div>

      {/* Arabic name — trailing anchor */}
      <span
        className="shrink-0 font-uthmani text-[26px] leading-none text-primary/85 transition-colors duration-[150ms] group-hover:text-primary"
        dir="rtl"
        lang="ar"
      >
        {chapter.name_arabic}
      </span>
    </Link>
  )
}
