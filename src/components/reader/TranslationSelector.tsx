"use client"

import { motion } from "motion/react"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { TRANSLATION_IDS } from "@/lib/quranApi"
import { cn } from "@/lib/utils"

type TMode = "none" | "one" | "both"

const OPTIONS: { value: TMode; label: string }[] = [
  { value: "none", label: "Arabic" },
  { value: "one", label: "+SI" },
  { value: "both", label: "+Both" },
]

const SPRING = { type: "spring" as const, stiffness: 500, damping: 40 }

function getModeFromSettings(showTranslation: boolean, activeTranslations: number[]): TMode {
  if (!showTranslation) return "none"
  return activeTranslations.length >= 2 ? "both" : "one"
}

export function TranslationSelector() {
  const { showTranslation, activeTranslations, setShowTranslation, setActiveTranslations } =
    useReaderSettings()

  const currentMode = getModeFromSettings(showTranslation, activeTranslations)

  function handleSelect(mode: TMode) {
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
    <div
      role="group"
      aria-label="Translation"
      className="flex rounded-lg bg-muted p-0.5"
    >
      {OPTIONS.map(({ value, label }) => {
        const active = currentMode === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => handleSelect(value)}
            className={cn(
              "relative rounded-md px-3 py-1 text-xs font-medium",
              "transition-colors duration-[120ms] ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {active && (
              <motion.span
                layoutId="translation-pill"
                className="absolute inset-0 z-[-1] rounded-md bg-background shadow-sm"
                transition={SPRING}
              />
            )}
            {label}
          </button>
        )
      })}
    </div>
  )
}
