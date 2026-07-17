import { cn } from "@/lib/utils"

interface AyahNumberProps {
  number: number
  className?: string
  isTarget?: boolean
}

export function AyahNumber({ number, className, isTarget }: AyahNumberProps) {
  return (
    <div
      aria-label={`Ayah ${number}`}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full",
        "border text-xs tabular-nums transition-colors duration-300",
        isTarget
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground",
        className,
      )}
    >
      {number}
    </div>
  )
}
