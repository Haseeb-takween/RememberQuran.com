"use client"

import { useLayoutEffect } from "react"
import type { Chapter, Verse } from "@/types/quran"
import { useSurahContent } from "@/context/SurahContentContext"

interface SurahHydrateProps {
  chapter: Chapter
  verses: Verse[]
  targetAyahId?: number
}

/** Syncs server-fetched surah data into the client content store (first paint + direct URLs). */
export function SurahHydrate({ chapter, verses, targetAyahId }: SurahHydrateProps) {
  const { hydrate } = useSurahContent()

  useLayoutEffect(() => {
    hydrate({ chapter, verses, targetAyahId })
  }, [chapter, verses, targetAyahId, hydrate])

  return null
}
