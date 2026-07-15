"use client"

import { ThemeProvider } from "next-themes"
import { MotionConfig } from "motion/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ReaderSettingsProvider } from "@/context/ReaderSettingsContext"
import { AudioPlayerProvider } from "@/context/AudioPlayerContext"
import { UIProvider } from "@/context/UIContext"
import { RouteChangeEffect } from "@/components/layout/RouteChangeEffect"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <MotionConfig reducedMotion="user">
        <TooltipProvider delay={150}>
          <UIProvider>
            <ReaderSettingsProvider>
              <AudioPlayerProvider>
                <RouteChangeEffect />
                {children}
              </AudioPlayerProvider>
            </ReaderSettingsProvider>
          </UIProvider>
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  )
}
