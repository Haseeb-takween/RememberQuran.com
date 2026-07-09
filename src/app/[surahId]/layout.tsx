import { getChapter } from "@/lib/quranApi"
import { SurahSidebar } from "@/components/layout/SurahSidebar"
import { ReaderControls } from "@/components/reader/ReaderControls"
import { KeyboardSurahNav } from "@/components/reader/KeyboardSurahNav"

interface Props {
  children: React.ReactNode
  params: Promise<{ surahId: string }>
}

export default async function SurahLayout({ children, params }: Props) {
  const { surahId } = await params
  const id = Number(surahId)

  const chapter = !isNaN(id) && id >= 1 && id <= 114
    ? await getChapter(id)
    : null

  const prevId = chapter && chapter.id > 1 ? chapter.id - 1 : null
  const nextId = chapter && chapter.id < 114 ? chapter.id + 1 : null

  return (
    <div className="flex">
      {/* Desktop sidebar — surah pages only */}
      <SurahSidebar />

      <div className="min-w-0 flex-1">
        {chapter && <ReaderControls chapter={chapter} />}
        <KeyboardSurahNav prevId={prevId} nextId={nextId} />
        {children}
        <div data-slot="audio-dock" aria-hidden="true" className="h-0" />
      </div>
    </div>
  )
}
