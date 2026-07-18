"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { MotionConfig } from "motion/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ReaderSettingsProvider } from "@/context/ReaderSettingsContext"
import { AudioPlayerProvider } from "@/context/AudioPlayerContext"
import { UIProvider } from "@/context/UIContext"
import { SurahContentProvider } from "@/context/SurahContentContext"
import { StudyPanelProvider } from "@/context/StudyPanelContext"
import { SoftGateProvider } from "@/context/SoftGateContext"
import { BookmarksProvider } from "@/context/BookmarksContext"
import { NotesProvider } from "@/context/NotesContext"
import { SoftGateDialog } from "@/components/auth/SoftGateDialog"
import { RouteChangeEffect } from "@/components/layout/RouteChangeEffect"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <MotionConfig reducedMotion="user">
          <TooltipProvider delay={150}>
            <UIProvider>
              <SurahContentProvider>
                <ReaderSettingsProvider>
                  <AudioPlayerProvider>
                    <StudyPanelProvider>
                      <SoftGateProvider>
                        <BookmarksProvider>
                          <NotesProvider>
                            <RouteChangeEffect />
                            {children}
                            <SoftGateDialog />
                          </NotesProvider>
                        </BookmarksProvider>
                      </SoftGateProvider>
                    </StudyPanelProvider>
                  </AudioPlayerProvider>
                </ReaderSettingsProvider>
              </SurahContentProvider>
            </UIProvider>
          </TooltipProvider>
        </MotionConfig>
      </ThemeProvider>
    </SessionProvider>
  )
}
