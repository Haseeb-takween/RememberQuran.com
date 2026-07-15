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

export function getWordAudioUrl(word: Word): string | null {
  if (!word.audio_url) return null
  if (/^https?:\/\//.test(word.audio_url)) return word.audio_url
  return WORD_AUDIO_BASE_URL + word.audio_url
}
