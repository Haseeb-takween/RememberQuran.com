import { Skeleton } from "@/components/ui/skeleton"

function SurahCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3.5">
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-44" />
      </div>
      <Skeleton className="h-6 w-14 shrink-0" />
    </div>
  )
}

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero skeleton */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <Skeleton className="h-12 w-36" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Cards skeleton — 24 placeholders fills the viewport */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <SurahCardSkeleton key={i} />
        ))}
      </div>
    </main>
  )
}
