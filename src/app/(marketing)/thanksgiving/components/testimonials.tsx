import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Melissa R.",
    role: "Thanksgiving host, family of 23",
    location: "Columbus, Ohio",
    quote:
      "Last year I begged relatives for photos for weeks. This year I woke up Friday to 180 of them, already organised.",
    initials: "MR",
  },
  {
    name: "Doug T.",
    role: "Friendsgiving organiser",
    location: "Toronto, Ontario",
    quote:
      "The trivia had three generations arguing over one question. Best part of the whole weekend.",
    initials: "DT",
  },
  {
    name: "Angela P.",
    role: "Host, 4th straight year",
    location: "Austin, Texas",
    quote:
      "Setup genuinely took minutes. The gallery is now our family's photo album — I open it more than I'd like to admit.",
    initials: "AP",
  },
];

export default function Testimonials() {
  return (
    <section className="border-y border-border/50 bg-secondary/30 py-12 md:py-16">
      <div className="container px-4">
        <h2 className="text-center text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
          Hosts who <span className="text-primary">already vibed</span>
        </h2>

        <div className="mx-auto mt-10 grid max-w-5xl items-stretch gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="flex-1 text-base italic leading-relaxed">
                &quot;{t.quote}&quot;
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} · {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
