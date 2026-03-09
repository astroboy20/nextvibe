import { Tag, Gamepad2, Camera, Users, Trophy, Sparkles } from "lucide-react";

const features = [
  {
    icon: Tag,
    title: "VibeTags",
    description:
      "Capture structured memories with custom tags that make every moment searchable and shareable.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Gamepad2,
    title: "Event Games",
    description:
      "Engage your guests with interactive games, trivia, and challenges with live leaderboards.",
    color: "bg-vibe-cyan/10 text-vibe-cyan",
  },
  {
    icon: Camera,
    title: "Postcards",
    description:
      "Create beautiful digital postcards from your memories. Share, like, and discover content from events.",
    color: "bg-vibe-pink/10 text-vibe-pink",
  },
  {
    icon: Users,
    title: "Social Discovery",
    description:
      "Find events based on your interests. Connect with people who share your vibe.",
    color: "bg-vibe-purple/10 text-vibe-purple",
  },
  {
    icon: Trophy,
    title: "Rewards & Prizes",
    description:
      "Win prizes, unlock discounts, and earn rewards by participating in event activities.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Sparkles,
    title: "Smart RSVP",
    description:
      "Track who's coming with beautiful RSVP management. Send reminders and updates automatically.",
    color: "bg-vibe-cyan/10 text-vibe-cyan",
  },
];

export function FeaturesSection() {
  return (
    <section
      className="relative overflow-hidden bg-white py-24"
      data-tour="features-section"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Features
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
            Everything you need for
            <br />
            <span className="text-gradient">unforgettable events</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="mb-2 font-display text-xl font-semibold">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>

                <div className="absolute inset-0 -z-10 bg-linear-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
