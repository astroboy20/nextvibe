"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  Check,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";

import {
  useToggleFollowMutation,
  useGetUserProfileQuery,
} from "@/features/profile/api/social-api";
import { useStartConversationMutation } from "@/store/api/messagingApi";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data, isLoading, isError } = useGetUserProfileQuery({ userId: id });
  const [toggleFollow, { isLoading: isToggling }] = useToggleFollowMutation();
  const [startConversation, { isLoading: isStartingChat }] =
    useStartConversationMutation();

  const user = data?.data;

  // The server answers "do I follow them" for this one user. The optimistic
  // value only bridges the gap until the refetch after toggling lands; it's
  // keyed by id so it can't leak onto the next profile if Next reuses this
  // component when navigating between /users/[id] pages.
  const [optimistic, setOptimistic] = useState<{ id: string; following: boolean } | null>(null);
  const isFollowing =
    optimistic?.id === id ? optimistic.following : (user?.isFollowing ?? false);

  const handleFollow = async () => {
    const prev = isFollowing;
    setOptimistic({ id, following: !prev });
    try {
      await toggleFollow({ userId: id, isFollowing: prev }).unwrap();
      toast.success(prev ? "Unfollowed" : "Now following!");
    } catch (err: any) {
      setOptimistic({ id, following: prev });
      toast.error(err?.data?.message ?? "Could not update follow status.");
    }
  };

  const handleMessage = async () => {
    try {
      const res = await startConversation({ userId: id }).unwrap();
      const conversationId = res?.data?.id;
      router.push(
        conversationId
          ? `/messages?conversation=${conversationId}`
          : `/messages?chat=${id}`,
      );
    } catch (err: any) {
      toast.error(
        err?.data?.error?.message ??
          err?.data?.message ??
          "You can only message mutual followers.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="container px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-sm">
            {isLoading
              ? "Profile"
              : (user?.displayName ?? user?.username ?? "Profile")}
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
            <p className="text-sm text-muted-foreground mb-4">
              Could not load profile.
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Go back
            </Button>
          </div>
        )}

        {/* Profile card */}
        {!isLoading && !isError && user && (
          <>
            <Card>
              <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-2xl font-bold">
                    {(user.displayName ??
                      user.username ??
                      "?")[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-lg font-bold">
                    {user.displayName ?? user.username}
                  </h2>
                  {user.username && (
                    <p className="text-sm text-muted-foreground">
                      @{user.username.replace(/^@/, "")}
                    </p>
                  )}
                </div>

                {user.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {user.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 text-center mt-1">
                  {user.followerCount !== undefined && (
                    <div>
                      <p className="font-bold text-sm">{user.followerCount}</p>
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
                      <>
                        <Check className="h-3.5 w-3.5" /> Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" /> Follow
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5"
                    onClick={handleMessage}
                    disabled={isStartingChat}
                  >
                    {isStartingChat ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MessageCircle className="h-3.5 w-3.5" />
                    )}
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
