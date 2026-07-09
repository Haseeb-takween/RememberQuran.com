"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function RouteChangeEffect() {
  const pathname = usePathname()

  useEffect(() => {
    document.getElementById("main")?.focus()
  }, [pathname])

  return null
}
