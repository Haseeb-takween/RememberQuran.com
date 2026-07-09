import type { Word } from "@/types/quran"
import { ArabicWord } from "./ArabicWord"

interface ArabicLineProps {
  words: Word[]
  showEndGlyph?: boolean
}

export function ArabicLine({ words, showEndGlyph = false }: ArabicLineProps) {
  const visibleWords = (words ?? []).filter(
    (w) =>
      w.char_type_name === "word" ||
      (showEndGlyph && w.char_type_name === "end"),
  )

  return (
    <div dir="rtl" lang="ar" className="quran-arabic text-foreground">
      {visibleWords.map((word, i) => (
        <span key={word.id}>
          {word.char_type_name === "end" ? (
            <span className="mx-1 inline-block text-[0.65em] text-muted-foreground/50">
              {word.text_uthmani}
            </span>
          ) : (
            <ArabicWord word={word} />
          )}
          {i < visibleWords.length - 1 && " "}
        </span>
      ))}
    </div>
  )
}
