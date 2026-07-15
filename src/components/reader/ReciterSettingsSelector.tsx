"use client"

import { AudioLines, MicVocal } from "lucide-react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { RECITERS, getReciter } from "@/lib/audioSources"
import { cn } from "@/lib/utils"

export function ReciterSettingsSelector() {
  const { reciterId, setReciter } = useAudioPlayer()
  const current = getReciter(reciterId)

  return (
    <div
      role="radiogroup"
      aria-label="Reciter"
      className="grid grid-cols-1 gap-1.5"
    >
      {RECITERS.map((reciter) => {
        const active = reciter.id === current.id
        return (
          <button
            key={reciter.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setReciter(reciter.id)}
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
              <MicVocal className="size-3.5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{reciter.name}</span>
              <span
                className={cn(
                  "mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-snug",
                  active ? "text-primary/75" : "text-muted-foreground",
                )}
              >
                <span dir="rtl" lang="ar">
                  {reciter.arabicName}
                </span>
                {reciter.hasWordTiming && (
                  <span className="inline-flex items-center gap-0.5">
                    <AudioLines className="size-2.5" strokeWidth={2} />
                    word sync
                  </span>
                )}
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
