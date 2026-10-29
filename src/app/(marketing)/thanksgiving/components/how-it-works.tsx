import { Drumstick, Link2, Images } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    n: "01",
    title: "Create your Thanksgiving Vibe",
    desc: "Set up the celebration and customise the experience in a few minutes.",
    icon: Drumstick,
    img: "/images/thanksgiving-hero.jpg",
    alt: "Host setting up a NextVibe event",
  },
  {
    n: "02",
    title: "Share one VibeTag",
    desc: "Send one simple tag or link to the whole family before and during dinner.",
    icon: Link2,
    img: "/images/thanksgiving-toast.jpg",
    alt: "Family sharing a VibeTag link at the dinner table",
  },
  {
    n: "03",
    title: "Keep every memory together",
    desc: "Everyone's photos, videos, postcards and messages land in one organised memory bank.",
    icon: Images,
    img: "/images/thanksgiving-gallery.jpg",
    alt: "A family gallery of memories from Thanksgiving",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
          How NextVibe <span className="text-primary">works</span>
        </h2>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
          {steps.map(({ n, title, desc, icon: Icon, img, alt }) => (
            <div
              key={n}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-primary/25">
                  {n}
                </span>
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
              </div>
              <h3 className="text-xl font-bold leading-snug">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{desc}</p>
              <div className="overflow-hidden rounded-xl border border-border">
                <Image
                  src={img}
                  alt={alt}
                  width={600}
                  height={450}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
