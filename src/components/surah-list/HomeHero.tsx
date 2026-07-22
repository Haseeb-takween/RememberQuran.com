import { HomeJumpField } from "./HomeJumpField"

/**
 * Home hero — large Quranic title over a soft parchment glow, a one-line
 * value statement, and the global jump/search field as the primary action.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 text-center sm:py-16">
      {/* Soft radial glow — jade at top fading into the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent)_0%,transparent_70%)]"
      />

      <p
        className="font-uthmani text-5xl leading-[1.5] text-primary sm:text-6xl"
        dir="rtl"
        lang="ar"
      >
        ٱلْقُرْآنُ ٱلْكَرِيمُ
      </p>

      <h1 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        Read, listen, and understand the Quran
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
        Authentic Uthmani script, word meanings, tafsir, and audio — free,
        forever, with no ads.
      </p>

      <div className="mt-7 flex justify-center">
        <HomeJumpField />
      </div>
    </section>
  )
}
