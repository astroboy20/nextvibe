import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors every section of christmas-page.tsx in skeleton form. */
export default function ChristmasLoading() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border/50">
        <div className="container px-4 pb-10 pt-12 md:pb-14 md:pt-18">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
            {/* Badge */}
            <Skeleton className="h-9 w-72 rounded-full" />
            {/* Headline */}
            <Skeleton className="h-12 w-full max-w-2xl md:h-16" />
            <Skeleton className="h-12 w-4/5 max-w-xl md:h-16" />
            {/* Sub-copy */}
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-5 w-3/4 max-w-lg" />
            {/* Price */}
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-64" />
            {/* Countdown */}
            <Skeleton className="h-4 w-44" />
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-14 rounded-xl" />
              ))}
            </div>
            {/* CTA */}
            <Skeleton className="h-12 w-56 rounded-lg" />
            {/* Hero image */}
            <Skeleton className="mt-2 aspect-video w-full rounded-3xl" />
          </div>
        </div>
      </section>

      {/* ── Proof strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-border/50 py-6">
        <div className="container px-4">
          <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <Skeleton className="mx-auto mb-10 h-10 w-56" />
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-8" />
                  <Skeleton className="size-11 rounded-xl" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-secondary/30 py-12 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 grid gap-4 sm:grid-cols-2">
              <Skeleton className="aspect-square w-full rounded-3xl" />
              <Skeleton className="aspect-square w-full rounded-3xl" />
            </div>
            <Skeleton className="mx-auto mb-8 h-10 w-64" />
            <div className="grid gap-5 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-11 rounded-xl" />
                    <Skeleton className="h-6 w-36" />
                  </div>
                  {[0, 1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features included ────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <Skeleton className="mx-auto mb-3 h-10 w-72" />
          <Skeleton className="mx-auto mb-10 h-5 w-56" />
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Skeleton className="size-12 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-lg md:p-10 space-y-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <Skeleton className="h-9 w-56 rounded-full" />
              <Skeleton className="h-9 w-72" />
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
            <div className="rounded-2xl border border-border bg-secondary/40 p-4">
              <Skeleton className="mx-auto mb-3 h-3 w-44" />
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* ── Reservation form ─────────────────────────────────────────────── */}
      <section className="border-t border-border/50 bg-secondary/30 py-12 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-lg md:p-10 space-y-5">
            {/* Step indicators */}
            <div className="flex items-center justify-between">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <Skeleton className="size-9 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-56" />
            {/* Email field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 py-12 md:py-16">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl space-y-4">
            <Skeleton className="mx-auto h-9 w-56" />
            <Skeleton className="mx-auto h-4 w-72" />
            <div className="mt-8 space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-b border-border py-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
