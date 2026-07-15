"use client"

import { MicVocal, Check, AudioLines } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { RECITERS, getReciter } from "@/lib/audioSources"
import { cn } from "@/lib/utils"

const barBtn = cn(
  "flex size-8 items-center justify-center rounded-md",
  "text-muted-foreground transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
)

/** Renders the full registry — adding reciters to RECITERS is all it takes.
 * Swap the plain list for a searchable Command palette once the registry
 * grows past a screenful (M5, 20+ reciters). */
export function ReciterSelector() {
  const { reciterId, setReciter } = useAudioPlayer()
  const current = getReciter(reciterId)

  return (
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <button
            {...props}
            type="button"
            title={`Reciter: ${current.name}`}
            aria-label={`Reciter: ${current.name}`}
            className={barBtn}
          >
            <MicVocal className="size-4" strokeWidth={1.75} />
          </button>
        )}
      />
      <PopoverContent side="top" align="end" className="w-72 p-1.5">
        <div role="radiogroup" aria-label="Reciter" className="flex flex-col gap-0.5">
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
                  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left",
                  "transition-colors duration-[120ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-primary/10 text-primary" : "hover:bg-accent",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {reciter.name}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 flex items-center gap-1.5 text-[11px]",
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
                {active && <Check className="size-3.5 shrink-0" strokeWidth={2} />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
