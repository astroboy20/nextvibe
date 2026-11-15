import { Camera, Link2, Gamepad2, Users, BarChart3, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Private Christmas gallery",
    desc: "Every photo and video your guests share stays together in one lasting memory bank — yours to revisit any time.",
  },
  {
    icon: Link2,
    title: "One link for the whole room",
    desc: "Replace scattered group-chat uploads with one VibeTag link. Guests tap it in any browser — no download.",
  },
  {
    icon: Gamepad2,
    title: "Christmas trivia & live games",
    desc: 'Get everyone off their phones — and back on them — with live games and leaderboards.',
  },
  {
    icon: Users,
    title: "Messages from every guest",
    desc: "Guests send the host postcards and personal notes before and during the celebration.",
  },
  {
    icon: BarChart3,
    title: "Host dashboard",
    desc: "See who joined, what they shared, and how much of the room participated — all in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Full MEGA bundle unlocked",
    desc: "VibeTags, Postcards, Gamification and VibePod — the complete stack, for $5 / ₦5,000.",
  },
];

export default function FeaturesIncluded() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Everything included for{" "}
            <span className="text-primary">$5 / ₦5,000</span>
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            The full MEGA bundle. No add-ons, no upsells, no watermark.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-snug">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
