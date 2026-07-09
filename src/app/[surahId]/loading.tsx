export default function SurahLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse px-4 py-10">
      {/* Header skeleton */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="h-10 w-40 rounded-lg bg-muted" />
        <div className="h-5 w-28 rounded-md bg-muted" />
        <div className="h-4 w-20 rounded-md bg-muted/60" />
      </div>

      {/* Ayah skeletons */}
      <div className="space-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg px-4 py-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="mt-1 size-8 shrink-0 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-8 rounded-md bg-muted" style={{ width: `${70 + (i % 3) * 10}%` }} />
              </div>
            </div>
            <div className="ml-11 space-y-1.5 border-l-2 border-border pl-3">
              <div className="h-4 rounded bg-muted/70" style={{ width: `${80 + (i % 2) * 10}%` }} />
              <div className="h-4 rounded bg-muted/70" style={{ width: `${60 + (i % 3) * 8}%` }} />
              <div className="h-4 w-28 rounded bg-muted/70" />
              <div className="mt-3 h-4 rounded bg-muted/70" style={{ width: `${75 + (i % 2) * 8}%` }} />
              <div className="h-4 rounded bg-muted/70" style={{ width: `${55 + (i % 3) * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
