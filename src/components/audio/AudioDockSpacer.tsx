"use client"

import { useAudioPlayerOptional } from "@/context/AudioPlayerContext"

/**
 * Reserves space at the bottom of the reader so the fixed AudioPlayerBar
 * never covers the last ayah. Collapses to the M1-identical h-0 while idle.
 */
export function AudioDockSpacer() {
  const player = useAudioPlayerOptional()
  const barVisible = !!player && player.status !== "idle"

  return (
    <div
      data-slot="audio-dock"
      aria-hidden="true"
      className={barVisible ? "h-16" : "h-0"}
    />
  )
}
