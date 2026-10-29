import {
  Camera,
  Link2,
  Gamepad2,
  Users,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const FOUNDER_PRICE = 29;

const features = [
  {
    icon: Camera,
    title: "Permanent family gallery",
    brand: "NextVibePulse",
    desc: "Every guest photo, video and postcard stays together in one lasting memory bank.",
  },
  {
    icon: Link2,
    title: "One memorable sharing tag",
    brand: "VibeTags",
    desc: "Replace the scattered group-chat uploads with one trackable tag for the whole family.",
  },
  {
    icon: Gamepad2,
    title: "Family trivia",
    brand: "NextVibePilot",
    desc: 'Get everyone off their phones — and back on them — with "How well do you really know Grandma?"',
  },
  {
    icon: Users,
    title: "Family conversations",
    brand: "VibePod",
    desc: "Give relatives a place to catch up and say what they're thankful for before the day arrives.",
  },
  {
    icon: BarChart3,
    title: "Host insights",
    brand: "Analytics",
    desc: "See participation and engagement from everyone who joined the Vibe.",
  },
  {
    icon: ShieldCheck,
    title: "Founder pricing",
    brand: "Secured Spot",
    desc: "Lock the promotional $29 price for this Thanksgiving package, per the offer terms.",
  },
];

export default function FeaturesIncluded() {
  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Everything included for{" "}
            <span className="text-primary">${FOUNDER_PRICE}</span>
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            The full stack. No add-ons, no upsells, no watermark.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {features.map(({ icon: Icon, title, brand, desc }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-snug">
                  {title}{" "}
                  <span className="font-semibold text-primary text-sm">
                    — {brand}
                  </span>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
