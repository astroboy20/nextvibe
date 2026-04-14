import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight } from "lucide-react";

export const userEvents = [
  {
    id: "1",
    title: "Japan Group Trip",
    date: "Jan 2, 2026",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    title: "Detty December 1",
    date: "Dec 20, 2025",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    title: "Tech Summit 2025",
    date: "Mar 15, 2025",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">
            My Events
          </h1>
            <p className="text-xs text-muted-foreground">
            Organize your events, tickets, and interactions effortlessly
            </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {userEvents.map((event, index) => (
          <Link href={`/dashboard/${event.id}`} key={event.id}>
            <div
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-card animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Image
                src={event.image}
                alt={event.title}
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {event.title}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {event.date}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
