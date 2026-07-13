"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useUI } from "@/context/UIContext"
import { SurahList } from "./SurahList"
import type { Chapter } from "@/types/quran"

interface SurahSheetProps {
  chapters: Chapter[]
}

function isSurahPath(pathname: string) {
  return /^\/\d+/.test(pathname)
}

export function SurahSheet({ chapters }: SurahSheetProps) {
  const pathname = usePathname()
  const { mobileNavOpen, setMobileNavOpen } = useUI()

  // Home already lists every surah — close the sheet if we leave the reader
  useEffect(() => {
    if (!isSurahPath(pathname)) {
      setMobileNavOpen(false)
    }
  }, [pathname, setMobileNavOpen])

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="flex h-dvh w-72 flex-col gap-0 p-0 sm:max-w-72">
        <SheetHeader className="shrink-0 border-b border-border px-4 py-3">
          <SheetTitle className="text-sm font-medium">Surahs</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          <SurahList
            chapters={chapters}
            onNavigate={() => setMobileNavOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
