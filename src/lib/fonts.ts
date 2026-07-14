import { Amiri, Amiri_Quran, Source_Serif_4 } from "next/font/google"

export const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
})

/**
 * Quranic variant of Amiri — required for correct harakat positioning and
 * Quranic annotation marks. Regular Amiri misplaces stacked vowel marks.
 */
export const amiriQuran = Amiri_Quran({
  weight: "400",
  subsets: ["arabic", "latin"],
  variable: "--font-amiri-quran",
  display: "swap",
})

export const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
})
