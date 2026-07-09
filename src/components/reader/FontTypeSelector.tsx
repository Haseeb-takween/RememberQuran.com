"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { QURAN_FONT_OPTIONS, type QuranFont } from "@/lib/readerFonts"
import { cn } from "@/lib/utils"

export function FontTypeSelector() {
  const { quranFont, setQuranFont } = useReaderSettings()

  return (
    <div className="space-y-1.5" role="radiogroup" aria-label="Quran font">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Arabic font
      </p>
      {QURAN_FONT_OPTIONS.map((opt) => {
        const active = quranFont === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setQuranFont(opt.value as QuranFont)}
            className={cn(
              "flex w-full flex-col items-start rounded-md px-2.5 py-2 text-left",
              "transition-colors duration-[120ms]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-accent",
            )}
          >
            <span
              className={cn(
                "text-lg leading-none",
                opt.value === "uthmani" ? "font-uthmani" : "font-arabic",
              )}
              dir="rtl"
              lang="ar"
            >
              بِسْمِ ٱللَّهِ
            </span>
            <span className="mt-1 text-sm font-medium">{opt.label}</span>
            <span className="text-[11px] text-muted-foreground">
              {opt.description}
            </span>
          </button>
        )
      })}
    </div>
  )
}
