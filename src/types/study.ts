/** A tafsir book available in the study panel (registry lives in studyApi.ts) */
export interface TafsirResource {
  /** quran.com resource id (e.g. 169 for Ibn Kathir EN) */
  id: number
  /** QDC slug used in API paths — note upstream typos are canonical */
  slug: string
  name: string
  author: string
  language: string
}

/** Sanitized tafsir passage for one ayah (may cover several grouped ayahs) */
export interface TafsirContent {
  slug: string
  resourceName: string
  /** HTML sanitized server-side in /api/tafsir — safe to inject */
  text: string
  /** Every verse_key this passage covers, e.g. ["2:285", "2:286"] */
  coveredKeys: string[]
}

/** Cleaned Asbab al-Nuzul entry — null when the ayah has no recorded reason */
export interface AsbabContent {
  text: string | null
}

/** Raw QDC response shape for /tafsirs/{slug}/by_ayah/{verse_key} */
export interface QdcTafsirResponse {
  tafsir?: {
    verses?: Record<string, unknown>
    resource_id?: number
    resource_name?: string
    slug?: string
    text?: string
  }
}
