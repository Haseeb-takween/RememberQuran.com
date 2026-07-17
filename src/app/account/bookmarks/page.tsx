import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AccountNav } from "@/components/account/AccountNav"
import {
  BookmarksView,
  type BookmarkDto,
  type CollectionDto,
} from "@/components/account/BookmarksView"
import { connectToDatabase } from "@/lib/db"
import { getOrCreateFavourites } from "@/lib/bookmarks/favourites"
import { getChapters } from "@/lib/quranApi"
import { Bookmark } from "@/lib/models/Bookmark"
import { BookmarkCollection } from "@/lib/models/BookmarkCollection"

export const metadata: Metadata = {
  title: "Bookmarks",
}

export const dynamic = "force-dynamic"

export default async function BookmarksPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?next=/account/bookmarks")
  }
  const userId = session.user.id

  await connectToDatabase()
  // Legacy accounts (pre-Favourites seed) get a default folder on first visit
  await getOrCreateFavourites(userId)

  const [collections, bookmarks, chapters] = await Promise.all([
    BookmarkCollection.find({ userId })
      .sort({ isDefault: -1, createdAt: 1 })
      .lean(),
    Bookmark.find({ userId }).lean(),
    getChapters(),
  ])

  const chapterById = new Map(chapters.map((c) => [c.id, c]))

  const collectionDtos: CollectionDto[] = collections.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    isDefault: c.isDefault ?? false,
  }))

  const bookmarkDtos: BookmarkDto[] = bookmarks
    .map((b) => {
      const [surahId, ayahId] = b.verseKey.split(":").map(Number)
      const chapter = chapterById.get(surahId)
      return {
        verseKey: b.verseKey,
        surahId,
        ayahId,
        collectionId: b.collectionId.toString(),
        surahName: chapter?.name_simple ?? `Surah ${surahId}`,
        surahArabic: chapter?.name_arabic ?? "",
      }
    })
    .sort((a, b) => a.surahId - b.surahId || a.ayahId - b.ayahId)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <AccountNav />
      <div className="mb-7">
        <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
          Your account
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight">
          Bookmarks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Saved ayahs, organised into collections. Tap any ayah to continue
          reading from it.
        </p>
      </div>

      <BookmarksView
        initialCollections={collectionDtos}
        initialBookmarks={bookmarkDtos}
      />
    </div>
  )
}
