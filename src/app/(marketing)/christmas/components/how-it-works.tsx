import { Gift, Tag, Images } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    n: "01",
    title: "Claim your Christmas spot",
    desc: "Pay $5 or ₦5,000 to secure your spot. You'll get a full MEGA bundle code by email.",
    icon: Gift,
    img: "/images/thanksgiving-toast.jpg",
    alt: "Host setting up a NextVibe Christmas event",
  },
  {
    n: "02",
    title: "Share one VibeTag",
    desc: "Send one simple link to your guests. They join in any browser — no app download.",
    icon: Tag,
    img: "/images/thanksgiving-games.jpg",
    alt: "Family sharing a VibeTag link",
  },
  {
    n: "03",
    title: "Keep every memory together",
    desc: "Every photo, video, postcard and message lands in one permanent Christmas memory bank.",
    icon: Images,
    img: "/images/thanksgiving-gallery.jpg",
    alt: "A Christmas photo gallery of family memories",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
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
                <span className="text-3xl font-extrabold text-primary/25">{n}</span>
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
