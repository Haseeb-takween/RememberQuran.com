"use client"

import type { Verse } from "@/types/quran"
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
        {verses.map((verse) => {
          const words = (verse.words ?? []).filter(
            (w) => w.char_type_name === "word" || w.char_type_name === "end",
          )
          const isTarget = targetAyahId === verse.verse_number

          return (
            <span
              key={verse.id}
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
                    <ArabicWord word={word} />
                    {i < words.length - 1 ? " " : null}
                  </span>
                ),
              )}{" "}
            </span>
          )
        })}
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
