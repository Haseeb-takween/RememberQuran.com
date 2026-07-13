"use client"

import { BookOpen, Languages } from "lucide-react"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { TRANSLATION_IDS, TRANSLATION_NAMES } from "@/lib/quranApi"
import { cn } from "@/lib/utils"

type TMode = "none" | "si" | "both"

const OPTIONS: {
  value: TMode
  label: string
  description: string
}[] = [
  {
    value: "none",
    label: "Arabic only",
    description: "Hide translations while you read",
  },
  {
    value: "si",
    label: TRANSLATION_NAMES[TRANSLATION_IDS.SAHEEH_INTERNATIONAL],
    description: "Clear, widely used English rendering",
  },
  {
    value: "both",
    label: "Both translations",
    description: "Saheeh International and The Clear Quran",
  },
]

function getMode(showTranslation: boolean, activeTranslations: number[]): TMode {
  if (!showTranslation || activeTranslations.length === 0) return "none"
  if (
    activeTranslations.includes(TRANSLATION_IDS.SAHEEH_INTERNATIONAL) &&
    activeTranslations.includes(TRANSLATION_IDS.CLEAR_QURAN)
  ) {
    return "both"
  }
  // Legacy Clear-Quran-only → treat as both (option removed)
  if (activeTranslations.includes(TRANSLATION_IDS.CLEAR_QURAN)) return "both"
  return "si"
}

export function TranslationSelector() {
  const {
    showTranslation,
    activeTranslations,
    setShowTranslation,
    setActiveTranslations,
  } = useReaderSettings()

  const currentMode = getMode(showTranslation, activeTranslations)

  function handleSelect(mode: TMode) {
    if (mode === "none") {
      setShowTranslation(false)
      return
    }
    setShowTranslation(true)
    if (mode === "si") {
      setActiveTranslations([TRANSLATION_IDS.SAHEEH_INTERNATIONAL])
    } else {
      setActiveTranslations([
        TRANSLATION_IDS.SAHEEH_INTERNATIONAL,
        TRANSLATION_IDS.CLEAR_QURAN,
      ])
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Translation"
      className="grid grid-cols-1 gap-1.5"
    >
      {OPTIONS.map(({ value, label, description }) => {
        const active = currentMode === value
        const Icon = value === "none" ? BookOpen : Languages
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => handleSelect(value)}
            className={cn(
              "flex w-full items-start gap-3 rounded-md px-2.5 py-2.5 text-left",
              "transition-colors duration-[120ms]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-accent",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border",
                active
                  ? "border-primary/25 bg-primary/10"
                  : "border-border bg-muted/60 text-muted-foreground",
              )}
            >
              <Icon className="size-3.5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{label}</span>
              <span
                className={cn(
                  "mt-0.5 block text-[11px] leading-snug",
                  active ? "text-primary/75" : "text-muted-foreground",
                )}
              >
                {description}
              </span>
            </span>
            <span
              className={cn(
                "mt-1 size-1.5 shrink-0 rounded-full",
                active ? "bg-primary" : "border border-muted-foreground/40",
              )}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
