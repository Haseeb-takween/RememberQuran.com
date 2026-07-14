"use client"

import { useIsTouch } from "@/hooks/useIsTouch"
import type { Word } from "@/types/quran"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { WordMeaningContent } from "./WordMeaningContent"
import { cn } from "@/lib/utils"

interface ArabicWordProps {
  word: Word
  // M2 props — wired in Milestone 2
  onWordClick?: (word: Word) => void
  isHighlighted?: boolean
  isPlaying?: boolean
}

export function ArabicWord({ word, isHighlighted = false }: ArabicWordProps) {
  const isTouch = useIsTouch()

  const triggerClass = cn(
    "inline-block cursor-pointer rounded-sm px-0.5 py-1",
    "touch-manipulation",
    "transition-colors duration-[120ms] ease-out",
    "hover:bg-accent",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isHighlighted && "bg-primary/15",
  )

  if (isTouch) {
    return (
      <Popover>
        <PopoverTrigger
          render={(props) => (
            <span {...props} className={triggerClass} tabIndex={0}>
              {word.qpc_uthmani_hafs || word.text_uthmani}
            </span>
          )}
        />
        <PopoverContent side="top" className="w-auto p-3">
          <WordMeaningContent word={word} />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={(props) => (
          <span {...props} className={triggerClass} tabIndex={0}>
            {word.qpc_uthmani_hafs || word.text_uthmani}
          </span>
        )}
      />
      <TooltipContent side="top">
        <WordMeaningContent word={word} />
      </TooltipContent>
    </Tooltip>
  )
}
