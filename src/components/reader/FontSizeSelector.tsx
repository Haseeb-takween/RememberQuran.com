"use client"

import { Minus, Plus } from "lucide-react"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import {
  FONT_SCALE_LABELS,
  MIN_FONT_SCALE,
  MAX_FONT_SCALE,
  type FontScale,
} from "@/lib/readerFonts"
import { cn } from "@/lib/utils"

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

function ScaleControl({
  label,
  value,
  onDecrease,
  onIncrease,
  onSet,
}: {
  label: string
  value: FontScale
  onDecrease: () => void
  onIncrease: () => void
  onSet: (n: FontScale) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <span className="text-xs tabular-nums text-muted-foreground">
          {FONT_SCALE_LABELS[value]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= MIN_FONT_SCALE}
          onClick={onDecrease}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border border-border",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
            "disabled:opacity-30 disabled:pointer-events-none",
            FOCUS,
          )}
        >
          <Minus className="size-3.5" strokeWidth={1.75} />
        </button>
        <div
          role="group"
          aria-label={label}
          className="flex flex-1 justify-between gap-0.5 rounded-lg bg-muted p-0.5"
        >
          {([1, 2, 3, 4, 5, 6] as FontScale[]).map((step) => {
            const active = value === step
            return (
              <button
                key={step}
                type="button"
                aria-pressed={active}
                onClick={() => onSet(step)}
                className={cn(
                  "flex-1 rounded-md py-1 text-[10px] font-medium tabular-nums",
                  "transition-colors duration-[120ms]",
                  FOCUS,
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/80",
                )}
              >
                {FONT_SCALE_LABELS[step]}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= MAX_FONT_SCALE}
          onClick={onIncrease}
          className={cn(
            "flex size-8 items-center justify-center rounded-md border border-border",
            "text-muted-foreground hover:bg-accent hover:text-foreground",
            "disabled:opacity-30 disabled:pointer-events-none",
            FOCUS,
          )}
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

export function FontSizeSelector() {
  const {
    arabicFontScale,
    translationFontScale,
    setArabicFontScale,
    setTranslationFontScale,
    increaseArabicFontScale,
    decreaseArabicFontScale,
    increaseTranslationFontScale,
    decreaseTranslationFontScale,
  } = useReaderSettings()

  return (
    <div className="space-y-4">
      <ScaleControl
        label="Arabic text"
        value={arabicFontScale}
        onDecrease={decreaseArabicFontScale}
        onIncrease={increaseArabicFontScale}
        onSet={setArabicFontScale}
      />
      <ScaleControl
        label="Translation"
        value={translationFontScale}
        onDecrease={decreaseTranslationFontScale}
        onIncrease={increaseTranslationFontScale}
        onSet={setTranslationFontScale}
      />
    </div>
  )
}
