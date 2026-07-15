"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useUI } from "@/context/UIContext"
import { SurahNavigationPanel } from "./SurahNavigationPanel"
import type { Chapter } from "@/types/quran"

interface SurahSheetProps {
  chapters: Chapter[]
}

function isSurahPath(pathname: string) {
  return /^\/\d+/.test(pathname)
}

/** Navbar (h-14) + reader toolbar (h-11) — panel anchors below both bars */
const SURAH_PICKER_TOP = "top-[6.25rem]"

export function SurahSheet({ chapters }: SurahSheetProps) {
  const pathname = usePathname()
  const { mobileNavOpen, setMobileNavOpen } = useUI()

  useEffect(() => {
    if (!isSurahPath(pathname)) {
      setMobileNavOpen(false)
    }
  }, [pathname, setMobileNavOpen])

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="top"
        showCloseButton={false}
        className={`${SURAH_PICKER_TOP} flex max-h-[min(28rem,calc(100dvh-6.25rem))] flex-col gap-0 border-b p-0 sm:max-w-none`}
      >
        <SurahNavigationPanel
          chapters={chapters}
          onClose={() => setMobileNavOpen(false)}
          closeOnNavigate
        />
      </SheetContent>
    </Sheet>
  )
}
