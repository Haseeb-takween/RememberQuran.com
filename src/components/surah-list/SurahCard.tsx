import Link from "next/link"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface SurahCardProps {
  chapter: Chapter
}

/** Home chapter tile — layout inspired by quran.com ChapterBlock */
export function SurahCard({ chapter }: SurahCardProps) {
  const isMakki = chapter.revelation_place === "makkah"

  return (
    <Link
      href={`/${chapter.id}`}
      className={cn(
        "group flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-4",
        "transition-[background-color,border-color,box-shadow,transform] duration-[150ms] ease-out",
        "hover:-translate-y-px hover:border-primary/25 hover:bg-accent hover:shadow-sm hover:shadow-primary/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="w-7 shrink-0 pt-0.5 text-sm tabular-nums text-muted-foreground transition-colors duration-[150ms] group-hover:text-primary/70">
          {chapter.id}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-tight text-foreground">
            {chapter.name_simple}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {chapter.translated_name.name}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className="font-uthmani text-2xl leading-none text-foreground/80 transition-colors duration-[150ms] group-hover:text-foreground"
          dir="rtl"
          lang="ar"
        >
          {chapter.name_arabic}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="tabular-nums">{chapter.verses_count} ayahs</span>
          <span aria-hidden>·</span>
          <span
            className={cn(
              "rounded px-1.5 py-px text-[10px] font-medium leading-none",
              isMakki
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                : "bg-primary/10 text-primary",
            )}
          >
            {isMakki ? "Makki" : "Madani"}
          </span>
        </div>
      </div>
    </Link>
  )
}
