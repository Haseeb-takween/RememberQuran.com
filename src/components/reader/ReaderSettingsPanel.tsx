"use client"

import type { ReactNode } from "react"
import { FontSizeSelector } from "./FontSizeSelector"
import { FontTypeSelector } from "./FontTypeSelector"
import { DisplayModeToggle } from "./DisplayModeToggle"
import { TranslationSelector } from "./TranslationSelector"
import { ReciterSettingsSelector } from "./ReciterSettingsSelector"

function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

export function ReaderSettingsPanel() {
  return (
    <div className="space-y-6">
      <Section title="View">
        <DisplayModeToggle />
      </Section>

      <div className="h-px bg-border/60" />

      <Section title="Recitation">
        <ReciterSettingsSelector />
      </Section>

      <div className="h-px bg-border/60" />

      <Section title="Arabic font">
        <FontTypeSelector />
      </Section>

      <div className="h-px bg-border/60" />

      <Section title="Text size">
        <FontSizeSelector />
      </Section>

      <div className="h-px bg-border/60" />

      <Section title="Translation">
        <TranslationSelector />
      </Section>
    </div>
  )
}
