"use client"

import { FontSizeSelector } from "./FontSizeSelector"
import { FontTypeSelector } from "./FontTypeSelector"
import { DisplayModeToggle } from "./DisplayModeToggle"
import { TRANSLATION_IDS, TRANSLATION_NAMES } from "@/lib/quranApi"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { cn } from "@/lib/utils"

type TMode = "none" | "one" | "both"

function getMode(show: boolean, active: number[]): TMode {
  if (!show) return "none"
  return active.length >= 2 ? "both" : "one"
}

const TRANSLATION_ROWS: { mode: TMode; label: string }[] = [
  { mode: "none", label: "Arabic only" },
  { mode: "one", label: TRANSLATION_NAMES[TRANSLATION_IDS.SAHEEH_INTERNATIONAL] },
  { mode: "both", label: "Both translations" },
]

export function ReaderSettingsPanel() {
  const {
    showTranslation,
    activeTranslations,
    setShowTranslation,
    setActiveTranslations,
  } = useReaderSettings()

  const currentMode = getMode(showTranslation, activeTranslations)

  function applyMode(mode: TMode) {
    if (mode === "none") {
      setShowTranslation(false)
    } else if (mode === "one") {
      setShowTranslation(true)
      setActiveTranslations([TRANSLATION_IDS.SAHEEH_INTERNATIONAL])
    } else {
      setShowTranslation(true)
      setActiveTranslations([
        TRANSLATION_IDS.SAHEEH_INTERNATIONAL,
        TRANSLATION_IDS.CLEAR_QURAN,
      ])
    }
  }

  return (
    <div className="space-y-5">
      <section>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          View
        </p>
        <DisplayModeToggle />
        <p className="mt-1.5 text-[11px] text-muted-foreground/80">
          Verse shows translation under each ayah. Reading flows Arabic continuously.
        </p>
      </section>

      <div className="h-px bg-border/60" />

      <FontTypeSelector />

      <div className="h-px bg-border/60" />

      <FontSizeSelector />

      <div className="h-px bg-border/60" />

      <section>
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Translation
        </p>
        <div className="space-y-0.5">
          {TRANSLATION_ROWS.map(({ mode, label }) => {
            const active = currentMode === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => applyMode(mode)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm",
                  "transition-colors duration-[120ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    active ? "bg-primary" : "border border-muted-foreground/40",
                  )}
                />
                {label}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
