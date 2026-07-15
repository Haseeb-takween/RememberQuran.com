"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Play,
  Pause,
  Loader2,
  Settings2,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize,
  Minimize,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useUI } from "@/context/UIContext"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { AyahSelector } from "./AyahSelector"
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

export function ReaderControls({ chapter }: ReaderControlsProps) {
  const { sidebarOpen, toggleSidebar } = useUI()
  const player = useAudioPlayer()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const isThisChapter = player.chapterId === chapter.id
  const isPlayingThis = isThisChapter && player.status === "playing"
  const isLoadingThis = isThisChapter && player.status === "loading"

  function handlePlaySurah() {
    if (isThisChapter && (player.status === "playing" || player.status === "paused")) {
      player.togglePlayPause()
    } else {
      player.playChapter(chapter.id)
    }
  }

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

  return (
    <>
      <div className="sticky top-14 z-30 border-b border-border/50 bg-background/98 backdrop-blur-sm">
        <div className="flex h-11 items-center justify-between gap-2 px-3 sm:px-4">
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

            <div className="mx-1 h-4 w-px bg-border/50" aria-hidden="true" />

            <AyahSelector surahId={id} versesCount={chapter.verses_count} />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button type="button" title="Bookmark (coming soon)" disabled className={iconBtn}>
              <Bookmark className="size-4" strokeWidth={1.75} />
            </button>

            <button
              type="button"
              title={isPlayingThis ? "Pause" : "Play surah"}
              aria-label={isPlayingThis ? "Pause" : "Play surah"}
              onClick={handlePlaySurah}
              className={cn(iconBtn, isPlayingThis && "text-primary")}
            >
              {isLoadingThis ? (
                <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
              ) : isPlayingThis ? (
                <Pause className="size-4" strokeWidth={1.75} />
              ) : (
                <Play className="size-4" strokeWidth={1.75} />
              )}
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
          <div className="mt-5 px-1 pb-8">
            <ReaderSettingsPanel />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
