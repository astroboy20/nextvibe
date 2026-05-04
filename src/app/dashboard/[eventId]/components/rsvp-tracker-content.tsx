"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetEventAttendeesQuery } from "@/app/provider/api/eventApi";

interface RSVPTrackerContentProps {
  eventId: string;
}

export function RSVPTrackerContent({ eventId }: RSVPTrackerContentProps) {
  const { data: attendeesData, isLoading } = useGetEventAttendeesQuery(
    { eventId, limit: 100 },
    { skip: !eventId, refetchOnMountOrArgChange: true }
  );

  const attendees: any[] = attendeesData?.data?.data ?? attendeesData?.data ?? [];
  const total: number = attendeesData?.data?.meta?.total ?? attendees.length;

  const going    = attendees.filter((a) => (a.status ?? a.rsvpStatus) === "CONFIRMED").length;
  const maybe    = attendees.filter((a) => (a.status ?? a.rsvpStatus) === "WAITLIST").length;
  const notGoing = attendees.filter((a) => (a.status ?? a.rsvpStatus) === "CANCELLED").length;

  const progressTotal = going + maybe;
  const goingPercent  = progressTotal > 0 ? (going / progressTotal) * 100 : 0;
  const maybePercent  = progressTotal > 0 ? (maybe / progressTotal) * 100 : 0;

  // First 4 attendees for the avatar stack
  const avatarStack = attendees.slice(0, 4);
  const overflow    = Math.max(0, total - 4);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="flex-1 h-16 rounded-xl" />
          <Skeleton className="flex-1 h-16 rounded-xl" />
          <Skeleton className="flex-1 h-16 rounded-xl" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex gap-1">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-8 w-8 rounded-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Row */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 rounded-xl bg-green-500/10 p-3 text-center">
          <p className="font-display text-2xl font-bold text-green-600">{going}</p>
          <p className="text-xs text-muted-foreground">Going</p>
        </div>
        <div className="flex-1 rounded-xl bg-amber-500/10 p-3 text-center">
          <p className="font-display text-2xl font-bold text-amber-600">{maybe}</p>
          <p className="text-xs text-muted-foreground">Maybe</p>
        </div>
        <div className="flex-1 rounded-xl bg-muted p-3 text-center">
          <p className="font-display text-2xl font-bold text-muted-foreground">{notGoing}</p>
          <p className="text-xs text-muted-foreground">Can&apos;t Go</p>
        </div>
      </div>

      {/* Progress Bar */}
      {progressTotal > 0 && (
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
      )}

      {/* Recent Attendees */}
      {avatarStack.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Recent RSVPs</p>
          <div className="flex -space-x-2">
            {avatarStack.map((attendee, i) => {
              const user   = attendee.user ?? attendee;
              const name   = user?.displayName ?? user?.username ?? "A";
              const status = attendee.status ?? attendee.rsvpStatus ?? "CONFIRMED";
              return (
                <div key={attendee.id ?? i} className="relative">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src={user?.avatarUrl ?? user?.avatar} />
                    <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background flex items-center justify-center",
                    status === "CONFIRMED" ? "bg-green-500" : status === "WAITLIST" ? "bg-amber-500" : "bg-gray-400"
                  )}>
                    {status === "CONFIRMED" ? (
                      <Check className="h-2 w-2 text-white" />
                    ) : (
                      <HelpCircle className="h-2 w-2 text-white" />
                    )}
                  </div>
                </div>
              );
            })}
            {overflow > 0 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                +{overflow}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

