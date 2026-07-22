"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

function nextTheme(current: string | undefined): "light" | "dark" | "system" {
  if (current === "dark") return "system"
  if (current === "system") return "light"
  return "dark"
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Render a size-matched placeholder before mount to avoid layout shift
  if (!mounted) {
    return <div className="size-9" aria-hidden />
  }

  const mode = theme ?? "system"
  const isSystem = mode === "system"
  const isDark = resolvedTheme === "dark"

  const label =
    mode === "light"
      ? "Theme: light. Switch to dark"
      : mode === "dark"
        ? "Theme: dark. Switch to system"
        : "Theme: system. Switch to light"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={
        mode === "light"
          ? "Light"
          : mode === "dark"
            ? "Dark"
            : "System"
      }
      onClick={() => setTheme(nextTheme(mode))}
      className="relative size-9 text-muted-foreground hover:text-foreground"
    >
      {isSystem ? (
        <Monitor className="size-4" strokeWidth={1.75} />
      ) : (
        <>
          <Sun
            className="absolute size-4 transition-all duration-200"
            style={{
              opacity: isDark ? 0 : 1,
              transform: isDark
                ? "rotate(90deg) scale(0.8)"
                : "rotate(0deg) scale(1)",
            }}
          />
          <Moon
            className="absolute size-4 transition-all duration-200"
            style={{
              opacity: isDark ? 1 : 0,
              transform: isDark
                ? "rotate(0deg) scale(1)"
                : "rotate(-90deg) scale(0.8)",
            }}
          />
        </>
      )}
    </Button>
  )
}
