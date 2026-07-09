"use client"

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { DEFAULT_TRANSLATIONS } from "@/lib/quranApi"
import {
  type QuranFont,
  type FontScale,
  DEFAULT_ARABIC_SCALE,
  DEFAULT_TRANSLATION_SCALE,
  ARABIC_FONT_SIZES,
  TRANSLATION_FONT_SIZES,
  QURAN_FONT_FAMILY,
  MIN_FONT_SCALE,
  MAX_FONT_SCALE,
} from "@/lib/readerFonts"

/** verse = translation/verse-by-verse view; reading = continuous Arabic (mushaf-like) */
export type DisplayMode = "verse" | "reading"

/** @deprecated Use FontScale — kept for migration from older localStorage */
export type FontSize = "small" | "medium" | "large" | "xlarge"

export interface ReaderSettings {
  quranFont: QuranFont
  arabicFontScale: FontScale
  translationFontScale: FontScale
  displayMode: DisplayMode
  activeTranslations: number[]
  showTranslation: boolean
}

interface ReaderSettingsContextValue extends ReaderSettings {
  setQuranFont: (font: QuranFont) => void
  setArabicFontScale: (scale: FontScale) => void
  setTranslationFontScale: (scale: FontScale) => void
  increaseArabicFontScale: () => void
  decreaseArabicFontScale: () => void
  increaseTranslationFontScale: () => void
  decreaseTranslationFontScale: () => void
  setDisplayMode: (mode: DisplayMode) => void
  setActiveTranslations: (ids: number[]) => void
  toggleTranslation: (id: number) => void
  setShowTranslation: (show: boolean) => void
  arabicFontSize: string
  translationFontSize: string
  arabicFontFamily: string
}

const LEGACY_SIZE_MAP: Record<FontSize, FontScale> = {
  small: 2,
  medium: 3,
  large: 4,
  xlarge: 5,
}

const DEFAULT_SETTINGS: ReaderSettings = {
  quranFont: "uthmani",
  arabicFontScale: DEFAULT_ARABIC_SCALE,
  translationFontScale: DEFAULT_TRANSLATION_SCALE,
  displayMode: "verse",
  activeTranslations: DEFAULT_TRANSLATIONS,
  showTranslation: true,
}

function clampScale(n: number): FontScale {
  return Math.min(MAX_FONT_SCALE, Math.max(MIN_FONT_SCALE, n)) as FontScale
}

function migrateSettings(raw: unknown): ReaderSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS
  const s = raw as Record<string, unknown>

  let arabicFontScale = DEFAULT_ARABIC_SCALE
  let translationFontScale = DEFAULT_TRANSLATION_SCALE

  if (typeof s.arabicFontScale === "number") {
    arabicFontScale = clampScale(s.arabicFontScale)
  } else if (typeof s.fontSize === "string" && s.fontSize in LEGACY_SIZE_MAP) {
    arabicFontScale = LEGACY_SIZE_MAP[s.fontSize as FontSize]
    translationFontScale = arabicFontScale
  }

  if (typeof s.translationFontScale === "number") {
    translationFontScale = clampScale(s.translationFontScale)
  }

  const quranFont =
    s.quranFont === "amiri" || s.quranFont === "uthmani"
      ? s.quranFont
      : DEFAULT_SETTINGS.quranFont

  const displayMode =
    s.displayMode === "reading" || s.displayMode === "verse"
      ? s.displayMode
      : DEFAULT_SETTINGS.displayMode

  return {
    quranFont,
    arabicFontScale,
    translationFontScale,
    displayMode,
    activeTranslations: Array.isArray(s.activeTranslations)
      ? (s.activeTranslations as number[])
      : DEFAULT_SETTINGS.activeTranslations,
    showTranslation:
      typeof s.showTranslation === "boolean"
        ? s.showTranslation
        : DEFAULT_SETTINGS.showTranslation,
  }
}

const ReaderSettingsContext = createContext<ReaderSettingsContextValue | null>(
  null,
)

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useLocalStorage<unknown>(
    "rq-reader-settings",
    DEFAULT_SETTINGS,
  )
  const settings = migrateSettings(raw)

  const setSettings = useCallback(
    (updater: (prev: ReaderSettings) => ReaderSettings) => {
      setRaw((prev: unknown) => updater(migrateSettings(prev)))
    },
    [setRaw],
  )

  const setQuranFont = useCallback(
    (quranFont: QuranFont) => setSettings((p) => ({ ...p, quranFont })),
    [setSettings],
  )

  const setArabicFontScale = useCallback(
    (arabicFontScale: FontScale) =>
      setSettings((p) => ({ ...p, arabicFontScale: clampScale(arabicFontScale) })),
    [setSettings],
  )

  const setTranslationFontScale = useCallback(
    (translationFontScale: FontScale) =>
      setSettings((p) => ({
        ...p,
        translationFontScale: clampScale(translationFontScale),
      })),
    [setSettings],
  )

  const increaseArabicFontScale = useCallback(
    () =>
      setSettings((p) => ({
        ...p,
        arabicFontScale: clampScale(p.arabicFontScale + 1),
      })),
    [setSettings],
  )

  const decreaseArabicFontScale = useCallback(
    () =>
      setSettings((p) => ({
        ...p,
        arabicFontScale: clampScale(p.arabicFontScale - 1),
      })),
    [setSettings],
  )

  const increaseTranslationFontScale = useCallback(
    () =>
      setSettings((p) => ({
        ...p,
        translationFontScale: clampScale(p.translationFontScale + 1),
      })),
    [setSettings],
  )

  const decreaseTranslationFontScale = useCallback(
    () =>
      setSettings((p) => ({
        ...p,
        translationFontScale: clampScale(p.translationFontScale - 1),
      })),
    [setSettings],
  )

  const setDisplayMode = useCallback(
    (displayMode: DisplayMode) => setSettings((p) => ({ ...p, displayMode })),
    [setSettings],
  )

  const setActiveTranslations = useCallback(
    (activeTranslations: number[]) =>
      setSettings((p) => ({ ...p, activeTranslations })),
    [setSettings],
  )

  const toggleTranslation = useCallback(
    (id: number) =>
      setSettings((p) => ({
        ...p,
        activeTranslations: p.activeTranslations.includes(id)
          ? p.activeTranslations.filter((t) => t !== id)
          : [...p.activeTranslations, id],
      })),
    [setSettings],
  )

  const setShowTranslation = useCallback(
    (showTranslation: boolean) =>
      setSettings((p) => ({ ...p, showTranslation })),
    [setSettings],
  )

  return (
    <ReaderSettingsContext.Provider
      value={{
        ...settings,
        setQuranFont,
        setArabicFontScale,
        setTranslationFontScale,
        increaseArabicFontScale,
        decreaseArabicFontScale,
        increaseTranslationFontScale,
        decreaseTranslationFontScale,
        setDisplayMode,
        setActiveTranslations,
        toggleTranslation,
        setShowTranslation,
        arabicFontSize: ARABIC_FONT_SIZES[settings.arabicFontScale],
        translationFontSize: TRANSLATION_FONT_SIZES[settings.translationFontScale],
        arabicFontFamily: QURAN_FONT_FAMILY[settings.quranFont],
      }}
    >
      {children}
    </ReaderSettingsContext.Provider>
  )
}

export function useReaderSettings() {
  const ctx = useContext(ReaderSettingsContext)
  if (!ctx)
    throw new Error(
      "useReaderSettings must be used within ReaderSettingsProvider",
    )
  return ctx
}

/** Legacy class maps — prefer CSS variables from QuranReader */
export const FONT_SIZE_ARABIC = {
  small: "text-[1.375rem]",
  medium: "text-[1.625rem]",
  large: "text-[1.875rem]",
  xlarge: "text-[2.125rem]",
} as const

export const FONT_SIZE_TRANSLATION = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
  xlarge: "text-xl",
} as const
