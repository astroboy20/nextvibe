/* eslint-disable @next/next/no-img-element */
import { Heart, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Postcard {
  id: string;
  image: string;
  eventName: string;
  vibeTag?: string;
  likes: number;
  isVideo?: boolean;
  duration?: string;
}

const samplePostcards: Postcard[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop",
    eventName: "Tech Conference 2024",
    vibeTag: "Innovation",
    likes: 234,
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
    eventName: "Summer Festival",
    vibeTag: "Good Vibes",
    likes: 567,
    isVideo: true,
    duration: "0:24",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=400&fit=crop",
    eventName: "Birthday Bash",
    likes: 89,
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop",
    eventName: "Concert Night",
    vibeTag: "Live Music",
    likes: 1203,
  },
  {
    id: "5",
    image:
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=350&fit=crop",
    eventName: "Beach Party",
    likes: 456,
    isVideo: true,
    duration: "0:45",
  },
  {
    id: "6",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=450&fit=crop",
    eventName: "Wedding Day",
    vibeTag: "Love",
    likes: 789,
  },
];

const PostcardGrid = () => {
  return (
    <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
      {samplePostcards.map((postcard, index) => (
        <div
          key={postcard.id}
          className={cn(
            "group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover",
            "animate-fade-in"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Image */}
          <div className="relative aspect-auto">
            <img
              src={postcard.image}
              alt={postcard.eventName}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Video indicator */}
            {postcard.isVideo && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm">
                    <Play className="h-5 w-5 fill-current" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 rounded-md bg-background/80 px-1.5 py-0.5 text-xs font-medium backdrop-blur-sm">
                  {postcard.duration}
                </span>
              </>
            )}

            {/* VibeTag overlay */}
            {postcard.vibeTag && (
              <div className="absolute left-2 top-2">
                <span className="rounded-full bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground backdrop-blur-sm">
                  #{postcard.vibeTag}
                </span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="text-sm font-medium line-clamp-1">
              {postcard.eventName}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              <span className="text-xs">{postcard.likes}</span>
            </div>
          </div>

          {/* Like button (always visible on mobile) */}
          <button className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 md:opacity-0 md:group-hover:opacity-100">
            <Heart className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
export default PostcardGrid;
