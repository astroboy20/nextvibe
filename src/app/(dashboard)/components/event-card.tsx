"use client"
import { Calendar, Gamepad2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

interface EventCardProps {
  id?: string;
  title: string;
  date: string;
  location: string;
  image: string;
  attendees?: number;
  hasGames?: boolean;
  hasVibeTag?: boolean;
  colorAccent?: "pink" | "purple" | "cyan" | "plum";
  className?: string;
}

const accentColors = {
  pink: "from-vibe-pink/20 to-vibe-pink/5 border-vibe-pink/30",
  purple: "from-vibe-purple/20 to-vibe-purple/5 border-vibe-purple/30",
  cyan: "from-vibe-cyan/20 to-vibe-cyan/5 border-vibe-cyan/30",
  plum: "from-primary/20 to-primary/5 border-primary/30",
};

export function EventCard({
  id = "1",
  title,
  date,
  location,
  image,
  attendees = 0,
  hasGames,
  hasVibeTag,
  colorAccent = "plum",
  className,
}: EventCardProps) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.replace(`/event/${id}`)}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer",
        className
      )}
    >
      {/* Image Grid */}
      <div className={cn(
        "relative h-40 overflow-hidden rounded-t-2xl border-2 bg-linear-to-br",
        accentColors[colorAccent]
      )}>
        <div className="absolute inset-2 grid grid-cols-3 gap-1.5">
          <div className="col-span-2 row-span-2 overflow-hidden rounded-xl">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="overflow-hidden rounded-xl bg-muted/50">
            <img
              src={`${image}&w=100`}
              alt=""
              className="h-full w-full object-cover opacity-80"
            />
          </div>
          <div className="overflow-hidden rounded-xl bg-muted/50">
            <img
              src={`${image}&h=100`}
              alt=""
              className="h-full w-full object-cover opacity-80"
            />
          </div>
        </div>
        
        {/* Add Button */}
        <button className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-card transition-transform hover:scale-110">
          <span className="text-lg font-medium">+</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold line-clamp-1">{title}</h3>
        
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{date}</span>
          <span className="text-border">•</span>
          <span>{attendees} Memories</span>
        </div>

        {/* Attendee Avatars */}
        <div className="mt-3 flex items-center">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <Avatar key={i} className="h-7 w-7 border-2 border-card">
                <AvatarImage src={`https://i.pravatar.cc/50?img=${i + 10}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {attendees > 3 && (
            <span className="ml-2 text-xs text-muted-foreground">
              +{attendees - 3}
            </span>
          )}
        </div>

        {/* Feature Tags */}
        {(hasGames || hasVibeTag) && (
          <div className="mt-3 flex gap-2">
            {hasGames && (
              <span className="inline-flex items-center gap-1 rounded-full bg-vibe-cyan/10 px-2 py-0.5 text-xs font-medium text-vibe-cyan">
                <Gamepad2 className="h-3 w-3" />
                Games
              </span>
            )}
            {hasVibeTag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Tag className="h-3 w-3" />
                VibeTag
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
