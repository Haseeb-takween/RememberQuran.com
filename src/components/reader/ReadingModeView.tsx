"use client"

import type { Verse } from "@/types/quran"
import { useHighlightedWord } from "@/lib/playbackStore"
import { ArabicWord } from "./ArabicWord"
import { AyahEndMarker } from "./AyahEndMarker"
import { TranslationBlock } from "./TranslationBlock"
import { cn } from "@/lib/utils"

interface ReadingModeViewProps {
  verses: Verse[]
  showTranslation: boolean
  activeTranslationIds: number[]
  targetAyahId?: number
}

/** One verse span — separate component so the playback-highlight
 * subscription is per verse and only the recited verse re-renders. */
function ReadingVerse({ verse, isTarget }: { verse: Verse; isTarget: boolean }) {
  const highlightedPosition = useHighlightedWord(verse.verse_key)
  const words = (verse.words ?? []).filter(
    (w) => w.char_type_name === "word" || w.char_type_name === "end",
  )

  return (
    <span
      id={`ayah-${verse.verse_number}`}
      className={cn(
        "scroll-mt-28",
        isTarget && "rounded-sm bg-primary/8",
      )}
    >
      {words.map((word, i) =>
        word.char_type_name === "end" ? (
          <AyahEndMarker
            key={word.id}
            digits={word.qpc_uthmani_hafs || word.text_uthmani}
            ariaLabel={`Ayah ${verse.verse_number}`}
          />
        ) : (
          <span key={word.id}>
            <ArabicWord
              word={word}
              isHighlighted={highlightedPosition === word.position}
              verseKey={verse.verse_key}
            />
            {i < words.length - 1 ? " " : null}
          </span>
        ),
      )}{" "}
    </span>
  )
}

/**
 * Continuous Arabic flow (quran.com "Reading" preference).
 * Words stream RTL; end-of-ayah glyphs mark verse boundaries.
 * Optional translations appear as a compact list below the mushaf block.
 */
export function ReadingModeView({
  verses,
  showTranslation,
  activeTranslationIds,
  targetAyahId,
}: ReadingModeViewProps) {
  return (
    <div className="space-y-10">
      <div
        dir="rtl"
        lang="ar"
        className="quran-arabic text-justify leading-[2.15]"
      >
        {verses.map((verse) => (
          <ReadingVerse
            key={verse.id}
            verse={verse}
            isTarget={targetAyahId === verse.verse_number}
          />
        ))}
      </div>

      {showTranslation && (
        <div className="space-y-6 border-t border-border/40 pt-8" dir="ltr">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Translation
          </p>
          {verses.map((verse) => {
            const active = verse.translations.filter((t) =>
              activeTranslationIds.includes(t.resource_id),
            )
            if (!active.length) return null
            return (
              <div
                key={verse.id}
                className="scroll-mt-28"
                id={`ayah-trans-${verse.verse_number}`}
              >
                <p className="mb-1 text-xs tabular-nums text-muted-foreground/70">
                  {verse.verse_key}
                </p>
                {active.map((t) => (
                  <TranslationBlock key={t.resource_id} translation={t} />
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
