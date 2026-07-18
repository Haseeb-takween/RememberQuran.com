import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AccountNav } from "@/components/account/AccountNav"
import {
  NotesView,
  type AccountNoteDto,
} from "@/components/account/NotesView"
import { connectToDatabase } from "@/lib/db"
import { getChapters } from "@/lib/quranApi"
import { Note } from "@/lib/models/Note"

export const metadata: Metadata = {
  title: "Notes",
}

export const dynamic = "force-dynamic"

export default async function NotesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account/notes")
  }
  const userId = session.user.id

  await connectToDatabase()

  const [notes, chapters] = await Promise.all([
    Note.find({ userId }).sort({ updatedAt: -1 }).limit(2000).lean(),
    getChapters(),
  ])

  const chapterById = new Map(chapters.map((c) => [c.id, c]))

  const noteDtos: AccountNoteDto[] = notes.map((n) => {
    const [surahId, ayahId] = n.verseKey.split(":").map(Number)
    const chapter = chapterById.get(surahId)
    return {
      verseKey: n.verseKey,
      surahId,
      ayahId,
      text: n.text,
      surahName: chapter?.name_simple ?? `Surah ${surahId}`,
      surahArabic: chapter?.name_arabic ?? "",
      updatedAt: n.updatedAt?.toISOString?.() ?? String(n.updatedAt ?? ""),
      createdAt: n.createdAt?.toISOString?.() ?? String(n.createdAt ?? ""),
    }
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <AccountNav />
      <div className="mb-7">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Your account
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
          Notes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Private notes on ayahs. Only you can see them — tap a reference to
          jump back into reading.
        </p>
      </div>

      <NotesView initialNotes={noteDtos} />
    </div>
  )
}
