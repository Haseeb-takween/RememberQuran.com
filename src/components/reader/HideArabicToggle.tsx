"use client"

import { useReaderSettings } from "@/context/ReaderSettingsContext"
import { Switch } from "@/components/ui/switch"

export function HideArabicToggle() {
  const { hideArabic, setHideArabic } = useReaderSettings()

  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2">
      <div className="min-w-0 flex-1">
        <span className="block text-sm">Hide Arabic</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          Blur ayahs for memorisation — tap to reveal or hide again
        </span>
      </div>
      <Switch checked={hideArabic} onCheckedChange={setHideArabic} />
    </div>
  )
}
