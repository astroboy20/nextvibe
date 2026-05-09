"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Trophy, Crown, Medal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPostcardLeaderboardQuery } from "@/app/provider/api/eventApi";

// activityTiming values the API accepts
const PHASE_MAP = {
  "pre-event":  "PRE_EVENT",
  "main-event": "MAIN_EVENT",
  "post-event": "POST_EVENT",
} as const;

type Phase = keyof typeof PHASE_MAP;

const rankIcons = [
  <Crown key="1" className="h-4 w-4 text-amber-500" />,
  <Medal key="2" className="h-4 w-4 text-gray-400" />,
  <Medal key="3" className="h-4 w-4 text-amber-700" />,
];

interface AttendeePostcardLeaderboardProps {
  eventId?: string;
  showEngagement?: boolean;
}

export function AttendeePostcardLeaderboard({
  eventId,
}: AttendeePostcardLeaderboardProps) {
  const [phase, setPhase] = useState<Phase>("pre-event");

  const { data: leaderboardData, isLoading } = useGetPostcardLeaderboardQuery(
    { eventId: eventId ?? "", activityTiming: PHASE_MAP[phase] },
    { skip: !eventId }
  );

  const leaders: any[] = leaderboardData?.data ?? [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-amber-500" />
          Postcard Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Phase filter */}
        <Tabs value={phase} onValueChange={(v) => setPhase(v as Phase)} className="mb-4">
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="pre-event"  className="text-xs">Pre</TabsTrigger>
            <TabsTrigger value="main-event" className="text-xs">Main</TabsTrigger>
            <TabsTrigger value="post-event" className="text-xs">Post</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && leaders.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            No postcards yet for this phase.
          </p>
        )}

        {!isLoading && leaders.length > 0 && (
          <div className="space-y-2">
            {leaders.map((leader: any, index: number) => {
              const name = leader.author?.displayName ?? leader.author?.username ?? "User";
              const initial = name.charAt(0).toUpperCase();

              return (
                <div
                  key={leader.id ?? index}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-2.5 transition-all",
                    index === 0 ? "bg-amber-500/10" : "hover:bg-muted/50"
                  )}
                >
                  {/* Rank */}
                  <div className="flex h-6 w-6 items-center justify-center shrink-0">
                    {index < 3 ? rankIcons[index] : (
                      <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar — first letter, no image */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {initial}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                     <p className="text-xs text-muted-foreground">
                      {leader.totalComments ?? leader.commentCount ?? 0} comment{(leader.totalComments ?? leader.commentCount ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Likes */}
                  <div className="flex items-center gap-1 text-sm font-bold shrink-0">
                    <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                    {leader.totalLikes ?? leader.likeCount ?? 0}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
