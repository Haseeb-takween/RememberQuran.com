"use client"

import { Volume2 } from "lucide-react"
import { useAudioPlayerActions } from "@/context/AudioPlayerContext"
import { getWordAudioUrl } from "@/lib/audioSources"
import type { Word } from "@/types/quran"

export function WordMeaningContent({ word }: { word: Word }) {
  const actions = useAudioPlayerActions()
  const hasAudio = !!getWordAudioUrl(word)

  return (
    <div className="flex min-w-[80px] max-w-[180px] flex-col items-center gap-1.5 text-center">
      <span
        className="font-arabic text-lg leading-none"
        dir="rtl"
        lang="ar"
      >
        {word.qpc_uthmani_hafs || word.text_uthmani}
      </span>
      <span className="text-xs leading-snug">
        {word.translation.text}
      </span>
      {word.transliteration?.text && (
        <span className="text-[10px] italic text-muted-foreground">
          {word.transliteration.text}
        </span>
      )}
      {hasAudio && actions && (
        <button
          type="button"
          title="Hear this word"
          aria-label="Hear this word"
          onClick={() => actions.playWord(word)}
          className="mt-0.5 flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors duration-[120ms] hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Volume2 className="size-3.5" strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}
