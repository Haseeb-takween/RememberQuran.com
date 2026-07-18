import type { Metadata } from "next"
import { amiri, amiriQuran, sourceSerif4 } from "@/lib/fonts"
import { getChapters } from "@/lib/quranApi"
import Providers from "@/components/providers"
import { ChaptersProvider } from "@/context/ChaptersContext"
import { AudioPlayerBar } from "@/components/audio/AudioPlayerBar"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { SurahSheet } from "@/components/layout/SurahSheet"
import { SurahCommand } from "@/components/layout/SurahCommand"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://rememberquran.com"),
  title: {
    default: "RememberQuran — Read, Listen & Understand the Quran",
    template: "%s — RememberQuran",
  },
  description:
    "A free, public-benefit Quran platform. Read the Arabic text, explore word-by-word meanings, and study translations — for everyone.",
  icons: {
    icon: [
      { url: "/rq-favicon.svg", type: "image/svg+xml" },
      { url: "/rq-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/rq-favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/rq-appicon-512.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "RememberQuran",
    title: "RememberQuran — Read, Listen & Understand the Quran",
    description:
      "A free, public-benefit Quran platform. Read Arabic, explore meanings, study translations.",
    url: "https://rememberquran.com",
    images: [
      {
        url: "/rq-mark-512.png",
        width: 512,
        height: 529,
        alt: "Remember Quran",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "RememberQuran — Read, Listen & Understand the Quran",
    description: "A free, public-benefit Quran platform.",
    images: ["/rq-mark-512.png"],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const chapters = await getChapters()

  return (
    <html
      lang="en"
      className={`${amiri.variable} ${amiriQuran.variable} ${sourceSerif4.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <Providers>
          <ChaptersProvider chapters={chapters}>
            <Navbar />
            <main id="main" tabIndex={-1} className="min-w-0 outline-none">
              {children}
            </main>
            <Footer />
            <SurahSheet chapters={chapters} />
            <SurahCommand chapters={chapters} />
            <AudioPlayerBar />
          </ChaptersProvider>
        </Providers>
      </body>
    </html>
  )
}
