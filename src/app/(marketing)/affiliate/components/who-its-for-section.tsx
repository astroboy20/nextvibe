"use client";
import { Camera, Sparkles, Users, HeartHandshake } from "lucide-react";

const audience = [
  { label: "Creators", Icon: Camera },
  { label: "Event planners", Icon: Sparkles },
  { label: "Community builders", Icon: Users },
  { label: "Venues & brands", Icon: HeartHandshake },
] as const;

export default function WhoItsForSection() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-7 text-sm font-bold md:grid-cols-4 lg:px-8">
        {audience.map(({ label, Icon }) => (
          <div key={label} className="flex items-center justify-center gap-3">
            <Icon className="h-5 w-5 shrink-0 text-primary" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
