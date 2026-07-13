"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import type { Chapter, Verse } from "@/types/quran"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { BismillahHeader } from "./BismillahHeader"
import { AyahBlock } from "./AyahBlock"
import { ReadingModeView } from "./ReadingModeView"

interface QuranReaderProps {
  chapter: Chapter
  verses: Verse[]
  targetAyahId?: number
}

export function QuranReader({ chapter, verses, targetAyahId }: QuranReaderProps) {
  const {
    displayMode,
    activeTranslations,
    showTranslation,
    arabicFontSize,
    translationFontSize,
    arabicFontFamily,
  } = useReaderSettings()
  const shouldReduceMotion = useReducedMotion()
  const [highlightActive, setHighlightActive] = useState(false)
  const clearRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!targetAyahId) return

    const el = document.getElementById(`ayah-${targetAyahId}`)
    if (!el) return

    el.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    })

    if (!shouldReduceMotion) {
      setHighlightActive(true)
      clearRef.current = setTimeout(() => setHighlightActive(false), 1500)
    }

    return () => {
      if (clearRef.current) clearTimeout(clearRef.current)
    }
  }, [targetAyahId, shouldReduceMotion])

  return (
    <article
      aria-label={`Surah ${chapter.name_simple}`}
      className="mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-10"
      style={
        {
          "--arabic-font-size": arabicFontSize,
          "--translation-font-size": translationFontSize,
          "--reader-arabic-font": arabicFontFamily,
        } as React.CSSProperties
      }
    >
      <header className="mb-8 border-b border-border/40 pb-8 text-center">
        <p
          className="font-uthmani text-[2.75rem] leading-[1.7] text-foreground sm:text-[3.25rem]"
          dir="rtl"
          lang="ar"
        >
          {chapter.name_arabic}
        </p>
        <h1 className="mt-3 text-xl font-medium tracking-tight text-foreground">
          {chapter.name_simple}
        </h1>
        <p className="mt-1 font-serif text-sm text-muted-foreground">
          {chapter.translated_name.name}
        </p>
        <p className="mt-2 text-xs tabular-nums text-muted-foreground/70">
          {chapter.verses_count} ayahs ·{" "}
          {chapter.revelation_place === "makkah" ? "Makki" : "Madani"}
        </p>
      </header>

      {chapter.bismillah_pre && <BismillahHeader />}

      {displayMode === "reading" ? (
        <ReadingModeView
          verses={verses}
          showTranslation={showTranslation}
          activeTranslationIds={activeTranslations}
          targetAyahId={highlightActive ? targetAyahId : undefined}
        />
      ) : (
        <div role="list" aria-label="Ayahs" className="divide-y divide-border/40">
          {verses.map((verse) => (
            <div key={verse.id} role="listitem">
              <AyahBlock
                verse={verse}
                displayMode="verse"
                activeTranslationIds={activeTranslations}
                showTranslation={showTranslation}
                isTarget={highlightActive && targetAyahId === verse.verse_number}
              />
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
