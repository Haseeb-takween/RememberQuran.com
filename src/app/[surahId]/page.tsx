import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getChapter, getAllVerses } from "@/lib/quranApi"
import { SurahHydrate } from "@/components/reader/SurahHydrate"

interface Props {
  params: Promise<{ surahId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surahId } = await params
  const id = Number(surahId)
  if (isNaN(id) || id < 1 || id > 114) return {}

  const chapter = await getChapter(id)
  if (!chapter) return {}

  const title = `Surah ${chapter.name_simple} (${chapter.name_arabic})`
  const description = `Read Surah ${chapter.name_simple} — ${chapter.translated_name.name}. ${chapter.verses_count} ayahs. ${chapter.revelation_place === "makkah" ? "Makki" : "Madani"}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://rememberquran.com/${id}`,
    },
    twitter: { title, description },
  }
}

export default async function SurahPage({ params }: Props) {
  const { surahId } = await params
  const id = Number(surahId)

  if (isNaN(id) || id < 1 || id > 114) notFound()

  const [chapter, verses] = await Promise.all([
    getChapter(id),
    getAllVerses(id),
  ])

  if (!chapter) notFound()

  return <SurahHydrate chapter={chapter} verses={verses} />
}
