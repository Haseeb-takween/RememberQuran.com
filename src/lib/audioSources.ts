import type { Reciter } from "@/types/audio"
import type { Word } from "@/types/quran"


export const RECITERS: Reciter[] = [
  {
    id: 7,
    name: "Mishary Rashid Alafasy",
    arabicName: "مشاري راشد العفاسي",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 3,
    name: "Abdur-Rahman as-Sudais",
    arabicName: "عبدالرحمن السديس",
    style: "Murattal",
    hasWordTiming: true,
  },
]

export const DEFAULT_RECITER_ID = 7

/** Unknown/removed ids fall back to the default reciter — never throws */
export function getReciter(id: number): Reciter {
  return (
    RECITERS.find((r) => r.id === id) ??
    RECITERS.find((r) => r.id === DEFAULT_RECITER_ID) ??
    RECITERS[0]
  )
}


const WORD_AUDIO_BASE_URL = "https://audio.qurancdn.com/"
const WORD_AUDIO_FILE_RE = /(\d{3}_\d{3}_)\d{3}(\.mp3(?:\?.*)?)$/

export function getWordAudioUrl(word: Word): string | null {
  if (!word.audio_url) return null

  // QDC's audio_url suffix can count pause/end-marker entries, while
  // Word.position counts actual spoken words. After the first marker this
  // makes every clip point at a later word (e.g. 3:4 word 10 → file 11).
  // The WBW CDN filename uses the spoken-word index, so normalize its suffix.
  const position = String(word.position).padStart(3, "0")
  const normalized = word.audio_url.replace(
    WORD_AUDIO_FILE_RE,
    `$1${position}$2`,
  )

  if (/^https?:\/\//.test(normalized)) return normalized
  return WORD_AUDIO_BASE_URL + normalized
}
