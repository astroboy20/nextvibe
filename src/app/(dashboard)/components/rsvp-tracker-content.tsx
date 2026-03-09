import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const rsvpData = {
  going: 156,
  maybe: 42,
  notGoing: 18,
  total: 216,
};

const recentRSVPs = [
  { id: "1", name: "Ade Johnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", status: "going" },
  { id: "2", name: "Chioma Obi", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", status: "going" },
  { id: "3", name: "Tunde Bello", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", status: "maybe" },
  { id: "4", name: "Ngozi Eze", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", status: "going" },
];

export function RSVPTrackerContent() {
  const goingPercent = (rsvpData.going / rsvpData.total) * 100;
  const maybePercent = (rsvpData.maybe / rsvpData.total) * 100;

  return (
    <div>
      {/* Stats Row */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 rounded-xl bg-green-500/10 p-3 text-center">
          <p className="font-display text-2xl font-bold text-green-600">{rsvpData.going}</p>
          <p className="text-xs text-muted-foreground">Going</p>
        </div>
        <div className="flex-1 rounded-xl bg-amber-500/10 p-3 text-center">
          <p className="font-display text-2xl font-bold text-amber-600">{rsvpData.maybe}</p>
          <p className="text-xs text-muted-foreground">Maybe</p>
        </div>
        <div className="flex-1 rounded-xl bg-muted p-3 text-center">
          <p className="font-display text-2xl font-bold text-muted-foreground">{rsvpData.notGoing}</p>
          <p className="text-xs text-muted-foreground">Can&apos;t Go</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="flex h-full">
          <div 
            className="bg-green-500 transition-all" 
            style={{ width: `${goingPercent}%` }} 
          />
          <div 
            className="bg-amber-500 transition-all" 
            style={{ width: `${maybePercent}%` }} 
          />
        </div>
      </div>

      {/* Recent Attendees */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Recent RSVPs</p>
        <div className="flex -space-x-2">
          {recentRSVPs.map((rsvp) => (
            <div key={rsvp.id} className="relative">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarImage src={rsvp.avatar} />
                <AvatarFallback>{rsvp.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background flex items-center justify-center",
                rsvp.status === "going" ? "bg-green-500" : "bg-amber-500"
              )}>
                {rsvp.status === "going" ? (
                  <Check className="h-2 w-2 text-white" />
                ) : (
                  <HelpCircle className="h-2 w-2 text-white" />
                )}
              </div>
            </div>
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
            +{rsvpData.total - recentRSVPs.length}
          </div>
        </div>
      </div>
    </div>
  );
}
