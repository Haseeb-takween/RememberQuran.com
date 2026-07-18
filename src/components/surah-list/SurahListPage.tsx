import { getChapters } from "@/lib/quranApi"
import { ContinuePrompt } from "@/components/account/ContinuePrompt"
import { HomeJumpField } from "./HomeJumpField"
import { SurahCard } from "./SurahCard"

export async function SurahListPage() {
  const chapters = await getChapters()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col items-center gap-4 text-center">
        <p
          className="font-uthmani text-5xl leading-[1.6] text-foreground/75 sm:text-6xl"
          dir="rtl"
          lang="ar"
        >
          ٱلْقُرْآنُ ٱلْكَرِيمُ
        </p>
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Read the Quran
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Arabic text, meanings, and study tools — free for everyone.
          </p>
        </div>
        <HomeJumpField />
      </header>

      <ContinuePrompt className="mx-auto mb-10 w-full max-w-2xl" />

      <section aria-labelledby="all-surahs-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
              Directory
            </p>
            <h2
              id="all-surahs-heading"
              className="mt-1 font-serif text-xl font-medium tracking-tight"
            >
              All 114 Surahs
            </h2>
          </div>
        </div>

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
      </section>
    </div>
  )
}
