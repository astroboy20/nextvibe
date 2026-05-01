"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Trophy, Crown, Medal, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPostcardLeaderboardQuery } from "@/app/provider/api/eventApi";

interface PostcardLeader {
  id: string;
  username: string;
  avatar: string;
  postcardImage: string;
  likes: number;
  engagement: number;
}

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
  showEngagement = true,
}: AttendeePostcardLeaderboardProps) {
  const [activePhase, setActivePhase] = useState<"pre-event" | "main-event">(
    "pre-event"
  );

  const { data: leaderboardData, isLoading } = useGetPostcardLeaderboardQuery(
    { eventId: eventId ?? "", phase: activePhase },
    { skip: !eventId }
  );

  const leaders: PostcardLeader[] = leaderboardData?.data ?? [];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" />
            Postcard Leaderboard
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Phase Toggle */}
        <Tabs
          value={activePhase}
          onValueChange={(v) => setActivePhase(v as any)}
          className="mb-4"
        >
          <TabsList className="w-full grid grid-cols-2 h-9">
            <TabsTrigger value="pre-event" className="text-xs">
              Pre-Event
            </TabsTrigger>
            <TabsTrigger value="main-event" className="text-xs">
              Main Event
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && leaders.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            No postcards yet for this phase.
          </p>
        )}

        {/* Leaders List */}
        {!isLoading && leaders.length > 0 && (
          <div className="space-y-3">
            {leaders.map((leader, index) => (
              <div
                key={leader.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl p-2 transition-all",
                  index === 0 ? "bg-amber-500/10" : "hover:bg-muted/50"
                )}
              >
                {/* Rank */}
                <div className="flex h-6 w-6 items-center justify-center">
                  {index < 3 ? (
                    rankIcons[index]
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Postcard Thumbnail */}
                <div className="relative h-10 w-8 flex-shrink-0 overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={leader.postcardImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={leader.avatar} />
                      <AvatarFallback>
                        {leader.username?.charAt(1) ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">
                      {leader.username}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                    <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                    {leader.likes}
                  </div>
                  {showEngagement && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <TrendingUp className="h-2.5 w-2.5" />
                      {leader.engagement}% engage
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="mt-3 w-full text-center text-xs font-medium text-primary hover:underline">
          View Full Leaderboard
        </button>
      </CardContent>
    </Card>
  );
}
