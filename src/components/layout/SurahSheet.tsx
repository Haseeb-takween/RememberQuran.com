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

export function SurahSheet({ chapters }: SurahSheetProps) {
  const pathname = usePathname()
  const { mobileNavOpen, setMobileNavOpen } = useUI()

  useEffect(() => {
    if (!isSurahPath(pathname)) {
      setMobileNavOpen(false)
    }
  }, [pathname, setMobileNavOpen])

  // Same navigation panel as the desktop sidebar, as a full-height drawer
  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-80 max-w-[85vw] flex-col gap-0 p-0"
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
