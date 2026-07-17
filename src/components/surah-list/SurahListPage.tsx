import { getChapters } from "@/lib/quranApi"
import { SurahCard } from "./SurahCard"

export async function SurahListPage() {
  const chapters = await getChapters()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col items-center gap-3 text-center">
        <p
          className="font-uthmani text-5xl leading-[1.6] text-foreground/75 sm:text-6xl"
          dir="rtl"
          lang="ar"
        >
          ٱلْقُرْآنُ ٱلْكَرِيمُ
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          RememberQuran
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Read the Arabic text, explore meanings, and study translations — free
          for everyone.
        </p>
        <p className="text-xs tabular-nums text-muted-foreground/70">
          114 Surahs
        </p>
      </header>

      {/* dir="rtl" makes surahs flow right-to-left (mushaf order); each card
          resets to ltr so its internal layout is unchanged */}
      <div
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
        dir="rtl"
        role="list"
        aria-label="List of Surahs"
      >
        {chapters.map((chapter, index) => (
          <div
            key={chapter.id}
            role="listitem"
            dir="ltr"
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(index * 10, 250)}ms` }}
          >
            <SurahCard chapter={chapter} />
          </div>
        ))}
      </div>
    </div>
  )
}
