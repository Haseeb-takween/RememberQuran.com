import { cn } from "@/lib/utils"

interface AyahNumberProps {
  number: number
  className?: string
}

export function AyahNumber({ number, className }: AyahNumberProps) {
  return (
    <div
      aria-label={`Ayah ${number}`}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        "border border-border text-xs tabular-nums text-muted-foreground",
        className,
      )}
    >
      {number}
    </div>
  )
}
