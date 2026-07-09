"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Render a size-matched placeholder before mount to avoid layout shift
  if (!mounted) {
    return <div className="size-9" aria-hidden />
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative size-9 text-muted-foreground hover:text-foreground"
    >
      <Sun
        className="absolute size-4 transition-all duration-200"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? "rotate(90deg) scale(0.8)" : "rotate(0deg) scale(1)",
        }}
      />
      <Moon
        className="absolute size-4 transition-all duration-200"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.8)",
        }}
      />
    </Button>
  )
}
