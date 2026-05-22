"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Heart, UserPlus, Check, Loader2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

import { useGetUserBasicQuery } from "@/app/provider/api/authApi";
import { useToggleFollowMutation, useGetMyFollowingQuery } from "@/app/provider/api/socialApi";
import { useStartConversationMutation } from "@/app/provider/api/messagingApi";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data, isLoading, isError } = useGetUserBasicQuery(id);
  const { data: followingData } = useGetMyFollowingQuery();
  const [toggleFollow, { isLoading: isToggling }] = useToggleFollowMutation();
  const [startConversation, { isLoading: isStartingChat }] = useStartConversationMutation();

  const user = data?.data;

  // Cross-reference with the following list — same source of truth used on the social page.
  // user?.isFollowing from the /basic endpoint is unreliable (API may return false even if following).
  const followingIds = new Set((followingData?.data?.data ?? []).map((u: any) => u.id));
  const [followed, setFollowed] = useState<boolean | null>(null);
  const isFollowing = followed !== null ? followed : followingIds.has(id);

  const handleFollow = async () => {
    const prev = isFollowing;
    setFollowed(!prev);
    try {
      await toggleFollow({ userId: id, isFollowing: prev }).unwrap();
      toast.success(prev ? "Unfollowed" : "Now following!");
    } catch (err: any) {
      setFollowed(prev);
      toast.error(err?.data?.message ?? "Could not update follow status.");
    }
  };

  const handleMessage = async () => {
    try {
      const res = await startConversation({ userId: id }).unwrap();
      const conversationId = res?.data?.id;
      router.push(conversationId
        ? `/messages?conversation=${conversationId}`
        : `/messages?chat=${id}`
      );
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message ??
        err?.data?.message ??
        "You can only message mutual followers."
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-sm">
            {isLoading ? "Profile" : user?.displayName ?? user?.username ?? "Profile"}
          </span>
        </div>
      </div>

      <div className="container px-4 py-6 max-w-lg mx-auto space-y-5">
        {/* Loading */}
        {isLoading && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground mb-4">Could not load profile.</p>
            <Button variant="outline" onClick={() => router.back()}>Go back</Button>
          </div>
        )}

        {/* Profile card */}
        {!isLoading && !isError && user && (
          <>
            <Card>
              <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-2xl font-bold">
                    {(user.displayName ?? user.username ?? "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-lg font-bold">{user.displayName ?? user.username}</h2>
                  {user.username && (
                    <p className="text-sm text-muted-foreground">@{user.username.replace(/^@/, "")}</p>
                  )}
                </div>

                {user.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 text-center mt-1">
                  {user.followersCount !== undefined && (
                    <div>
                      <p className="font-bold text-sm">{user.followersCount}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                  )}
                  {user.followingCount !== undefined && (
                    <div>
                      <p className="font-bold text-sm">{user.followingCount}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                  )}
                  {user.postcardsCount !== undefined && (
                    <div>
                      <p className="font-bold text-sm">{user.postcardsCount}</p>
                      <p className="text-xs text-muted-foreground">Postcards</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-2 w-full justify-center">
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    className="rounded-full gap-1.5 min-w-[110px]"
                    onClick={handleFollow}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : isFollowing ? (
                      <><Check className="h-3.5 w-3.5" /> Following</>
                    ) : (
                      <><UserPlus className="h-3.5 w-3.5" /> Follow</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5"
                    onClick={handleMessage}
                    disabled={isStartingChat}
                  >
                    {isStartingChat
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <MessageCircle className="h-3.5 w-3.5" />}
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Interests / badges */}
            {user.interests?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest: string) => (
                    <Badge key={interest} variant="secondary" className="rounded-full">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent activity stats */}
            {(user.eventsAttended !== undefined || user.likesGiven !== undefined) && (
              <Card>
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  {user.eventsAttended !== undefined && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-sm">{user.eventsAttended}</p>
                        <p className="text-xs text-muted-foreground">Events attended</p>
                      </div>
                    </div>
                  )}
                  {user.likesGiven !== undefined && (
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-semibold text-sm">{user.likesGiven}</p>
                        <p className="text-xs text-muted-foreground">Likes given</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
