import type {
  Chapter,
  Verse,
  ChaptersResponse,
  ChapterResponse,
  VersesResponse,
  VerseResponse,
} from "@/types/quran"
import {
  BUNDLE_TRANSLATION_IDS,
  TRANSLATION_IDS,
  toApiTranslationIds,
} from "@/lib/translations"

export {
  DEFAULT_TRANSLATIONS,
  BUNDLE_TRANSLATION_IDS,
  TRANSLATION_IDS,
  TRANSLATION_NAMES,
  TRANSLATIONS,
  getTranslation,
  getTranslationName,
  isRegisteredTranslationId,
  MAX_ACTIVE_TRANSLATIONS,
} from "@/lib/translations"

const CHAPTERS_BASE_URL = "https://api.quran.com/api/v4"
/**
 * QDC — the API quran.com's own reader uses. Unlike the public v4 API it
 * returns word-level qpc_uthmani_hafs, the encoding the KFGQPC UthmanicHafs
 * font is built for (v4 leaves that word field empty).
 */
const VERSES_BASE_URL = "https://api.qurancdn.com/api/qdc"
/**
 * Dr Mustafa Khattab's Clear Quran is no longer served by the quran.com API
 * (IDs verified 2026-07 — resource 131 returns nothing and the translation is
 * absent from /resources/translations). Sourced instead from the static
 * quran-api CDN and merged into each verse's translations.
 */
const KHATTAB_CDN_URL =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-mustafakhattaba"

const WORD_FIELDS =
  "text_uthmani,qpc_uthmani_hafs,translation,audio_url,transliteration,text_uthmani_tajweed"
const VERSE_FIELDS =
  "text_uthmani,qpc_uthmani_hafs,verse_key,verse_number,page_number,juz_number,hizb_number"

async function apiFetch<T>(
  url: string,
  cacheOption: RequestInit["cache"] | { revalidate: number } = {
    revalidate: 86400,
  },
): Promise<T> {
  const fetchOptions: RequestInit =
    typeof cacheOption === "object" && "revalidate" in cacheOption
      ? { next: cacheOption }
      : { cache: cacheOption as RequestInit["cache"] }

  const res = await fetch(url, {
    ...fetchOptions,
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    throw new Error(`Quran API error ${res.status} ${res.statusText} — ${url}`)
  }

  return res.json() as Promise<T>
}

/** Saheeh International embeds <sup foot_note=…> markers — render plain text */
function stripHtml(text: string): string {
  return text
    .replace(/<sup[^>]*>.*?<\/sup>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim()
}

function sanitizeVerse(verse: Verse): Verse {
  return {
    ...verse,
    translations: (verse.translations ?? []).map((t) => ({
      ...t,
      text: stripHtml(t.text),
    })),
  }
}

interface KhattabChapterResponse {
  chapter: { chapter: number; verse: number; text: string }[]
}

/** Khattab translation for a chapter, keyed by ayah number */
async function getKhattabChapter(
  chapterId: number,
): Promise<Map<number, string>> {
  const data = await apiFetch<KhattabChapterResponse>(
    `${KHATTAB_CDN_URL}/${chapterId}.json`,
    "force-cache",
  )
  return new Map(data.chapter.map((v) => [v.verse, v.text]))
}

function mergeKhattab(verse: Verse, khattab: Map<number, string>): Verse {
  const text = khattab.get(verse.verse_number)
  if (!text) return verse
  return {
    ...verse,
    translations: [
      ...verse.translations,
      { resource_id: TRANSLATION_IDS.CLEAR_QURAN, text },
    ],
  }
}

/** All 114 chapters — cached indefinitely (Quran never changes) */
export async function getChapters(): Promise<Chapter[]> {
  const data = await apiFetch<ChaptersResponse>(
    `${CHAPTERS_BASE_URL}/chapters`,
    "force-cache",
  )
  return data.chapters
}

/** Single chapter metadata — cached indefinitely */
export async function getChapter(id: number): Promise<Chapter> {
  const data = await apiFetch<ChapterResponse>(
    `${CHAPTERS_BASE_URL}/chapters/${id}`,
    "force-cache",
  )
  return data.chapter
}

/** One page of verses (max 50). Khattab is merged in getAllVerses, not here. */
export async function getVerses(
  chapterId: number,
  translations: number[] = BUNDLE_TRANSLATION_IDS,
  page = 1,
): Promise<VersesResponse> {
  const apiTranslations = toApiTranslationIds(translations)
  const params = new URLSearchParams({
    words: "true",
    word_fields: WORD_FIELDS,
    fields: VERSE_FIELDS,
    per_page: "50",
    page: String(page),
  })
  if (apiTranslations.length > 0) {
    params.set("translations", apiTranslations.join(","))
  }
  const data = await apiFetch<VersesResponse>(
    `${VERSES_BASE_URL}/verses/by_chapter/${chapterId}?${params}`,
  )
  return { ...data, verses: data.verses.map(sanitizeVerse) }
}

/** All verses for a chapter — handles pagination and Khattab merge */
export async function getAllVerses(
  chapterId: number,
  translations: number[] = BUNDLE_TRANSLATION_IDS,
): Promise<Verse[]> {
  const wantsKhattab = translations.includes(TRANSLATION_IDS.CLEAR_QURAN)

  const [first, khattab] = await Promise.all([
    getVerses(chapterId, translations, 1),
    wantsKhattab ? getKhattabChapter(chapterId).catch(() => null) : null,
  ])

  let verses = first.verses
  if (first.pagination.total_pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: first.pagination.total_pages - 1 }, (_, i) =>
        getVerses(chapterId, translations, i + 2).then((r) => r.verses),
      ),
    )
    verses = [...first.verses, ...rest.flat()]
  }

  if (!khattab) return verses
  return verses.map((v) => mergeKhattab(v, khattab))
}

/** Single verse by key e.g. "2:255" */
export async function getVerseByKey(
  verseKey: string,
  translations: number[] = BUNDLE_TRANSLATION_IDS,
): Promise<Verse> {
  const apiTranslations = toApiTranslationIds(translations)
  const params = new URLSearchParams({
    words: "true",
    word_fields: WORD_FIELDS,
    fields: VERSE_FIELDS,
  })
  if (apiTranslations.length > 0) {
    params.set("translations", apiTranslations.join(","))
  }

  const [chapterId] = verseKey.split(":")
  const wantsKhattab = translations.includes(TRANSLATION_IDS.CLEAR_QURAN)

  const [data, khattab] = await Promise.all([
    apiFetch<VerseResponse>(`${VERSES_BASE_URL}/verses/by_key/${verseKey}?${params}`),
    wantsKhattab ? getKhattabChapter(Number(chapterId)).catch(() => null) : null,
  ])

  const verse = sanitizeVerse(data.verse)
  return khattab ? mergeKhattab(verse, khattab) : verse
}
