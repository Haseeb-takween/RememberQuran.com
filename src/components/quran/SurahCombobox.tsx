"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Chapter } from "@/types/quran"
import { cn } from "@/lib/utils"

interface SurahComboboxProps {
  chapters: Chapter[]
  value: number
  onChange: (surahId: number) => void
  label?: string
  className?: string
}

export function SurahCombobox({
  chapters,
  value,
  onChange,
  label = "Starting surah",
  className,
}: SurahComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = chapters.find((chapter) => chapter.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className={cn("h-10 w-full justify-between px-3 font-normal", className)}
          />
        }
      >
        <span className="truncate">
          {selected
            ? `${selected.id} · ${selected.name_simple}`
            : "Choose a surah"}
        </span>
        <ChevronsUpDown data-icon="inline-end" className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-(--anchor-width) p-0"
      >
        <Command>
          <CommandInput placeholder="Search surah name or number…" />
          <CommandList>
            <CommandEmpty>No surah found.</CommandEmpty>
            <CommandGroup>
              {chapters.map((chapter) => {
                const active = chapter.id === value
                return (
                  <CommandItem
                    key={chapter.id}
                    value={`${chapter.id} ${chapter.name_simple} ${chapter.name_arabic}`}
                    data-checked={active ? true : undefined}
                    onSelect={() => {
                      onChange(chapter.id)
                      setOpen(false)
                    }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-7 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {chapter.id}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {chapter.name_simple}
                    </span>
                    <span
                      className="shrink-0 font-uthmani text-base leading-none text-muted-foreground"
                      dir="rtl"
                      lang="ar"
                    >
                      {chapter.name_arabic}
                    </span>
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
