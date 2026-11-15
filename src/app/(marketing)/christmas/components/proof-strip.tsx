import { Timer, Smartphone, Link2, Archive } from "lucide-react";

const items = [
  { icon: Timer, label: "Setup takes about 4 minutes" },
  { icon: Smartphone, label: "Guests install nothing" },
  { icon: Link2, label: "One VibeTag for the whole celebration" },
  { icon: Archive, label: "Photos and messages stay together after the day" },
];

export default function ProofStrip() {
  return (
    <section className="border-y border-border/50 py-6">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <Icon className="size-5 shrink-0 text-primary" />
              <p className="text-sm font-semibold leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
