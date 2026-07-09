import type {
  Chapter,
  Verse,
  ChaptersResponse,
  ChapterResponse,
  VersesResponse,
  VerseResponse,
} from "@/types/quran"

const BASE_URL = "https://api.quran.com/api/v4"

// Verify these IDs at build time via GET /resources/translations
export const TRANSLATION_IDS = {
  SAHEEH_INTERNATIONAL: 131,
  CLEAR_QURAN: 57,
} as const

export const DEFAULT_TRANSLATIONS = [
  TRANSLATION_IDS.SAHEEH_INTERNATIONAL,
  TRANSLATION_IDS.CLEAR_QURAN,
]

export const TRANSLATION_NAMES: Record<number, string> = {
  131: "Saheeh International",
  57: "The Clear Quran — Dr Mustafa Khattab",
}

const WORD_FIELDS = "text_uthmani,translation,audio_url,transliteration"
const VERSE_FIELDS =
  "text_uthmani,verse_key,verse_number,page_number,juz_number,hizb_number"

async function apiFetch<T>(
  path: string,
  cacheOption: RequestInit["cache"] | { revalidate: number } = {
    revalidate: 86400,
  },
): Promise<T> {
  const fetchOptions: RequestInit =
    typeof cacheOption === "object" && "revalidate" in cacheOption
      ? { next: cacheOption }
      : { cache: cacheOption as RequestInit["cache"] }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    throw new Error(
      `Quran API error ${res.status} ${res.statusText} — ${path}`,
    )
  }

  return res.json() as Promise<T>
}

/** All 114 chapters — cached indefinitely (Quran never changes) */
export async function getChapters(): Promise<Chapter[]> {
  const data = await apiFetch<ChaptersResponse>("/chapters", "force-cache")
  return data.chapters
}

/** Single chapter metadata — cached indefinitely */
export async function getChapter(id: number): Promise<Chapter> {
  const data = await apiFetch<ChapterResponse>(
    `/chapters/${id}`,
    "force-cache",
  )
  return data.chapter
}

/** One page of verses (max 50) */
export async function getVerses(
  chapterId: number,
  translations: number[] = DEFAULT_TRANSLATIONS,
  page = 1,
): Promise<VersesResponse> {
  const params = new URLSearchParams({
    translations: translations.join(","),
    words: "true",
    word_fields: WORD_FIELDS,
    fields: VERSE_FIELDS,
    per_page: "50",
    page: String(page),
  })
  return apiFetch<VersesResponse>(`/verses/by_chapter/${chapterId}?${params}`)
}

/** All verses for a chapter — handles pagination transparently */
export async function getAllVerses(
  chapterId: number,
  translations: number[] = DEFAULT_TRANSLATIONS,
): Promise<Verse[]> {
  const first = await getVerses(chapterId, translations, 1)
  if (first.pagination.total_pages <= 1) return first.verses

  const rest = await Promise.all(
    Array.from({ length: first.pagination.total_pages - 1 }, (_, i) =>
      getVerses(chapterId, translations, i + 2).then((r) => r.verses),
    ),
  )
  return [...first.verses, ...rest.flat()]
}

/** Single verse by key e.g. "2:255" */
export async function getVerseByKey(
  verseKey: string,
  translations: number[] = DEFAULT_TRANSLATIONS,
): Promise<Verse> {
  const params = new URLSearchParams({
    translations: translations.join(","),
    words: "true",
    word_fields: WORD_FIELDS,
    fields: VERSE_FIELDS,
  })
  const data = await apiFetch<VerseResponse>(
    `/verses/by_key/${verseKey}?${params}`,
  )
  return data.verse
}
