"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function RouteChangeEffect() {
  const pathname = usePathname()

  useEffect(() => {
    // preventScroll: focusing #main must not scroll away from a target ayah
    // when arriving at /surah/ayah URLs (QuranReader owns that scroll)
    document.getElementById("main")?.focus({ preventScroll: true })
  }, [pathname])

  return null
}
