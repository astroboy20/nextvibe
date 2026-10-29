import { Check, Drumstick, MessageSquareHeart } from "lucide-react";
import Image from "next/image";

const hostBenefits = [
  "One organised memory bank — no more chasing photos in the group chat",
  "Every cousin's photos and videos in one place, automatically",
  "Family trivia that gets the whole table talking",
  "See who joined and what they shared",
  "Permanent access to the celebration, forever",
];

const guestBenefits = [
  "No app installation — one link opens it all",
  "Simple photo and video sharing",
  "Family trivia and games between courses",
  "Postcards and personal messages to the host",
  "A way to connect before and during the holiday",
];

const columns = [
  { title: "For the host", icon: Drumstick, items: hostBenefits },
  {
    title: "For your family & guests",
    icon: MessageSquareHeart,
    items: guestBenefits,
  },
];

export default function Benefits() {
  return (
    <section className="border-y border-border/50 bg-secondary/30 py-12 md:py-16">
      <div className="container px-4">
        <div className="mx-auto max-w-5xl">
          {/* Image pair */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-border shadow-sm">
              <Image
                src="/images/thanksgiving-gallery.jpg"
                alt="Family memory gallery on a phone and tablet"
                width={600}
                height={600}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-3xl border border-border shadow-sm">
              <Image
                src="/images/thanksgiving-games.jpg"
                alt="Family playing NextVibe trivia after Thanksgiving dinner"
                width={600}
                height={600}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>

          <h2 className="text-center text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Why <span className="text-primary">everyone joins in</span>
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {columns.map(({ title, icon: Icon, items }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-3" />
                      </div>
                      <span className="text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
