"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Languages,
  AlignLeft,
  LayoutList,
  Bookmark,
  Play,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize,
  Minimize,
} from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { useUI } from "@/context/UIContext"
import { TRANSLATION_IDS, TRANSLATION_NAMES } from "@/lib/quranApi"
import { ReaderSettingsPanel } from "./ReaderSettingsPanel"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface ReaderControlsProps {
  chapter: Chapter
}

const iconBtn = cn(
  "flex size-8 items-center justify-center rounded-md",
  "text-muted-foreground transition-colors duration-[120ms]",
  "hover:bg-accent hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:opacity-30 disabled:pointer-events-none",
)

type TMode = "none" | "one" | "both"

function getMode(show: boolean, active: number[]): TMode {
  if (!show) return "none"
  return active.length >= 2 ? "both" : "one"
}

const TRANSLATION_ROWS: { mode: TMode; label: string }[] = [
  { mode: "none", label: "Arabic only" },
  { mode: "one", label: TRANSLATION_NAMES[TRANSLATION_IDS.SAHEEH_INTERNATIONAL] },
  { mode: "both", label: "Both translations" },
]

export function ReaderControls({ chapter }: ReaderControlsProps) {
  const {
    displayMode,
    setDisplayMode,
    showTranslation,
    activeTranslations,
    setShowTranslation,
    setActiveTranslations,
  } = useReaderSettings()
  const { sidebarOpen, toggleSidebar } = useUI()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", onFsChange)
    return () => document.removeEventListener("fullscreenchange", onFsChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  const id = chapter.id
  const prevId = id > 1 ? id - 1 : null
  const nextId = id < 114 ? id + 1 : null
  const currentMode = getMode(showTranslation, activeTranslations)

  function applyMode(mode: TMode) {
    if (mode === "none") {
      setShowTranslation(false)
    } else if (mode === "one") {
      setShowTranslation(true)
      setActiveTranslations([TRANSLATION_IDS.SAHEEH_INTERNATIONAL])
    } else {
      setShowTranslation(true)
      setActiveTranslations([
        TRANSLATION_IDS.SAHEEH_INTERNATIONAL,
        TRANSLATION_IDS.CLEAR_QURAN,
      ])
    }
  }

  return (
    <>
      <div className="sticky top-14 z-30 border-b border-border/50 bg-background/98 backdrop-blur-sm">
        <div className="flex h-11 items-center justify-between gap-2 px-3 sm:px-4">
          {/* Sidebar toggle — desktop surah reader only */}
          <div className="flex min-w-0 items-center gap-0.5">
            <button
              type="button"
              title={sidebarOpen ? "Hide surah list" : "Show surah list"}
              aria-pressed={sidebarOpen}
              onClick={toggleSidebar}
              className={cn(iconBtn, "mr-0.5 hidden md:flex")}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="size-4" strokeWidth={1.75} />
              ) : (
                <PanelLeftOpen className="size-4" strokeWidth={1.75} />
              )}
            </button>
            {prevId ? (
              <Link
                href={`/${prevId}`}
                aria-label="Previous surah"
                title="Previous surah"
                className={iconBtn}
              >
                <ChevronLeft className="size-4" strokeWidth={1.75} />
              </Link>
            ) : (
              <span
                className={cn(iconBtn, "pointer-events-none opacity-30")}
                aria-hidden="true"
              >
                <ChevronLeft className="size-4" strokeWidth={1.75} />
              </span>
            )}

            <div className="flex min-w-0 items-baseline gap-2 px-1">
              <span className="truncate text-sm font-medium text-foreground">
                {chapter.name_simple}
              </span>
              <span
                className="font-uthmani hidden text-base leading-none text-foreground/40 sm:inline"
                dir="rtl"
                lang="ar"
              >
                {chapter.name_arabic}
              </span>
            </div>

            {nextId ? (
              <Link
                href={`/${nextId}`}
                aria-label="Next surah"
                title="Next surah"
                className={iconBtn}
              >
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </Link>
            ) : (
              <span
                className={cn(iconBtn, "pointer-events-none opacity-30")}
                aria-hidden="true"
              >
                <ChevronRight className="size-4" strokeWidth={1.75} />
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {/* Quick Aa opens full settings on mobile; desktop uses settings sheet */}
            <button
              type="button"
              title="Reading settings"
              onClick={() => setSettingsOpen(true)}
              className={cn(iconBtn, "w-auto px-1.5 text-[13px] font-semibold tracking-tight")}
            >
              Aa
            </button>

            <Popover>
              <PopoverTrigger title="Translation" className={cn(iconBtn, "hidden sm:flex")}>
                <Languages className="size-4" strokeWidth={1.75} />
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" sideOffset={8} className="w-52 p-1">
                <p className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Translation
                </p>
                {TRANSLATION_ROWS.map(({ mode, label }) => {
                  const active = currentMode === mode
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => applyMode(mode)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm",
                        "transition-colors duration-[120ms]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground hover:bg-accent",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          active ? "bg-primary" : "border border-muted-foreground/40",
                        )}
                      />
                      {label}
                    </button>
                  )
                })}
              </PopoverContent>
            </Popover>

            <div className="ml-0.5 hidden items-center gap-px rounded-md border border-border/60 p-0.5 sm:flex">
              <button
                type="button"
                title="Verse by verse"
                aria-pressed={displayMode === "verse"}
                onClick={() => setDisplayMode("verse")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-sm transition-colors duration-[120ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  displayMode === "verse"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutList className="size-3.5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                title="Reading mode"
                aria-pressed={displayMode === "reading"}
                onClick={() => setDisplayMode("reading")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-sm transition-colors duration-[120ms]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  displayMode === "reading"
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <AlignLeft className="size-3.5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="mx-1 hidden h-4 w-px bg-border/50 sm:block" aria-hidden="true" />

            <button type="button" title="Bookmark (coming soon)" disabled className={iconBtn}>
              <Bookmark className="size-4" strokeWidth={1.75} />
            </button>

            <button type="button" title="Audio (Milestone 2)" disabled className={iconBtn}>
              <Play className="size-4" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              title="Reading settings"
              onClick={() => setSettingsOpen(true)}
              className={iconBtn}
            >
              <Settings2 className="size-4" strokeWidth={1.75} />
            </button>

            <div className="mx-1 hidden h-4 w-px bg-border/50 sm:block" aria-hidden="true" />

            <button
              type="button"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={toggleFullscreen}
              className={cn(iconBtn, "hidden sm:flex")}
            >
              {isFullscreen ? (
                <Minimize className="size-4" strokeWidth={1.75} />
              ) : (
                <Maximize className="size-4" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </div>

      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Reading settings</SheetTitle>
          </SheetHeader>
          <div className="mt-4 px-1 pb-6">
            <ReaderSettingsPanel />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
