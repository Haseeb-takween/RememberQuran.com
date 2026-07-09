"use client"

import { motion } from "motion/react"
import { useReaderSettings, type DisplayMode } from "@/context/ReaderSettingsContext"
import { cn } from "@/lib/utils"

const OPTIONS: { value: DisplayMode; label: string }[] = [
  { value: "verse", label: "Verse" },
  { value: "reading", label: "Reading" },
]

const SPRING = { type: "spring" as const, stiffness: 500, damping: 40 }

export function DisplayModeToggle() {
  const { displayMode, setDisplayMode } = useReaderSettings()

  return (
    <div
      role="group"
      aria-label="Display mode"
      className="flex rounded-lg bg-muted p-0.5"
    >
      {OPTIONS.map(({ value, label }) => {
        const active = displayMode === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => setDisplayMode(value)}
            className={cn(
              "relative rounded-md px-3 py-1 text-xs font-medium",
              "transition-colors duration-[120ms] ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {active && (
              <motion.span
                layoutId="display-mode-pill"
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
