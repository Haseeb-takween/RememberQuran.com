import type { Reciter } from "@/types/audio"

/**
 * Chapter-audio reciters verified in M5 Phase 0 (`docs/m5-resource-ids.md`).
 * Adding a row here is enough for player, radio, and settings pickers.
 */
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
  {
    id: 97,
    name: "Yasser Ad-Dussary",
    arabicName: "ياسر الدوسري",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 2,
    name: "AbdulBaset AbdulSamad",
    arabicName: "عبد الباسط عبد الصمد",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 1,
    name: "AbdulBaset AbdulSamad",
    arabicName: "عبد الباسط عبد الصمد",
    style: "Mujawwad",
    hasWordTiming: true,
  },
  {
    id: 4,
    name: "Abu Bakr al-Shatri",
    arabicName: "أبو بكر الشاطري",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 5,
    name: "Hani ar-Rifai",
    arabicName: "هاني الرفاعي",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 6,
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 12,
    name: "Mahmoud Khalil Al-Husary",
    arabicName: "محمود خليل الحصري",
    style: "Muallim",
    hasWordTiming: true,
  },
  {
    id: 10,
    name: "Saud ash-Shuraym",
    arabicName: "سعود الشريم",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 161,
    name: "Khalifah Al Tunaiji",
    arabicName: "خليفة الطنيجي",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 9,
    name: "Mohamed Siddiq al-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    style: "Murattal",
    hasWordTiming: true,
  },
  {
    id: 8,
    name: "Mohamed Siddiq al-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    style: "Mujawwad",
    hasWordTiming: true,
  },
  {
    id: 168,
    name: "Mohamed Siddiq al-Minshawi",
    arabicName: "محمد صديق المنشاوي",
    style: "Kids repeat",
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

export function getWordAudioUrl(word: import("@/types/quran").Word): string | null {
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
