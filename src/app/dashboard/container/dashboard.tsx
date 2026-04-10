import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

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

const getStatusBadge = (status: "going" | "maybe") => {
  if (status === "going") {
    return (
      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
        Going
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
      Maybe
    </span>
  );
};

const Dashboard = () => {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">My Events</h1>
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
