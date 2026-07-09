import type { VerseTranslation } from "@/types/quran"
import { TRANSLATION_NAMES } from "@/lib/quranApi"

interface TranslationBlockProps {
  translation: VerseTranslation
}

export function TranslationBlock({ translation }: TranslationBlockProps) {
  const name = TRANSLATION_NAMES[translation.resource_id] ?? "Translation"

  return (
    <div className="mt-3 border-l-2 border-border/70 pl-3">
      <p dir="ltr" className="quran-translation max-w-[70ch] text-foreground/85">
        {translation.text}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground/60">— {name}</p>
    </div>
  )
}
