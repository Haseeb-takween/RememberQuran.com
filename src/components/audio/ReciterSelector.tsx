"use client"

import { useState } from "react"
import { AudioLines, Check, MicVocal } from "lucide-react"
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

function matchesQuery(query: string, name: string, arabic: string, style?: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    name.toLowerCase().includes(q) ||
    arabic.includes(query.trim()) ||
    (style?.toLowerCase().includes(q) ?? false)
  )
}

/** Compact player-bar picker — searchable list over the full RECITERS registry. */
export function ReciterSelector() {
  const { reciterId, setReciter } = useAudioPlayer()
  const current = getReciter(reciterId)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = RECITERS.filter((r) =>
    matchesQuery(query, r.name, r.arabicName, r.style),
  )

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
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
      <PopoverContent side="top" align="end" className="flex w-80 flex-col gap-1.5 p-1.5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reciter…"
          aria-label="Search reciter"
          className={cn(
            "h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-sm",
            "outline-none placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
        />
        <div
          role="radiogroup"
          aria-label="Reciter"
          className="flex max-h-72 flex-col gap-0.5 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <p className="px-2.5 py-3 text-center text-sm text-muted-foreground">
              No reciter found.
            </p>
          ) : (
            filtered.map((reciter) => {
              const active = reciter.id === current.id
              return (
                <button
                  key={reciter.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setReciter(reciter.id)
                    setOpen(false)
                    setQuery("")
                  }}
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
                      {reciter.style ? (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          · {reciter.style}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]",
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
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
