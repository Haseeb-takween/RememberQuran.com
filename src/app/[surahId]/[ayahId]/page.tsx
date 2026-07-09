import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getChapter, getAllVerses } from "@/lib/quranApi"
import { QuranReader } from "@/components/reader/QuranReader"

interface Props {
  params: Promise<{ surahId: string; ayahId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { surahId, ayahId } = await params
  const id = Number(surahId)
  const ayah = Number(ayahId)
  if (isNaN(id) || id < 1 || id > 114) return {}

  const chapter = await getChapter(id)
  if (!chapter) return {}

  const title = `${chapter.name_simple} ${id}:${ayah} (${chapter.name_arabic})`
  const description = `Surah ${chapter.name_simple}, Ayah ${ayah} — ${chapter.translated_name.name}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://rememberquran.com/${id}/${ayah}`,
    },
    twitter: { title, description },
  }
}

export default async function AyahPage({ params }: Props) {
  const { surahId, ayahId } = await params
  const id = Number(surahId)
  const ayah = Number(ayahId)

  if (isNaN(id) || id < 1 || id > 114) notFound()

  const [chapter, verses] = await Promise.all([
    getChapter(id),
    getAllVerses(id),
  ])

  if (!chapter) notFound()

  const validAyah = !isNaN(ayah) && ayah >= 1 && ayah <= chapter.verses_count ? ayah : undefined

  return <QuranReader chapter={chapter} verses={verses} targetAyahId={validAyah} />
}
