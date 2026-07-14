import type { Word } from "@/types/quran"

export function WordMeaningContent({ word }: { word: Word }) {
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
    </div>
  )
}
