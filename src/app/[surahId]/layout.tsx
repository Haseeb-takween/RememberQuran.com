import { Suspense } from "react"
import { SurahLayoutShell } from "@/components/layout/SurahLayoutShell"
import { SurahSidebar } from "@/components/layout/SurahSidebar"
import { ReaderControls } from "@/components/reader/ReaderControls"
import { KeyboardSurahNav } from "@/components/reader/KeyboardSurahNav"
import { SurahReaderViewport } from "@/components/reader/SurahReaderViewport"
import { AudioDockSpacer } from "@/components/audio/AudioDockSpacer"
import { StudyPanel } from "@/components/study/StudyPanel"

interface Props {
  children: React.ReactNode
}

export default function SurahLayout({ children }: Props) {
  return (
    <SurahLayoutShell>
      <SurahSidebar />

      <div className="min-w-0 flex-1">
        <ReaderControls />
        <KeyboardSurahNav />
        <Suspense fallback={null}>{children}</Suspense>
        <SurahReaderViewport />
        <AudioDockSpacer />
        <StudyPanel />
      </div>
    </SurahLayoutShell>
  )
}
