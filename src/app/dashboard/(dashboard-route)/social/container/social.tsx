/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  Image,
  Users,
  Calendar,
  MapPin,
  UserPlus,
  Check,
  GalleryHorizontal,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  useGetPostcardsFeedQuery,
  useLikeTargetMutation,
  useUnlikeTargetMutation,
  useGetCommentsQuery,
  usePostCommentMutation,
  useDeleteCommentMutation,
  useRecordShareMutation,
  useGetSuggestedUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  type PostcardItem,
} from "@/app/provider/api/socialApi";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

// ─── Comments panel ───────────────────────────────────────────────────────────

function CommentsPanel({ postcardId }: { postcardId: string }) {
  const [commentText, setCommentText] = useState("");
  const { data, isLoading } = useGetCommentsQuery({
    targetType: "postcard",
    targetId: postcardId,
  });
  const [postComment, { isLoading: isPosting }] = usePostCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const handlePost = async () => {
    if (!commentText.trim()) return;
    await postComment({
      targetType: "postcard",
      targetId: postcardId,
      body: commentText.trim(),
    });
    setCommentText("");
  };

  return (
    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
      {/* Input */}
      <div className="flex items-center gap-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 rounded-full text-sm"
          onKeyDown={(e) => e.key === "Enter" && handlePost()}
        />
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          disabled={!commentText.trim() || isPosting}
          onClick={handlePost}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (data?.data?.length ?? 0) === 0 && (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">
            No comments yet. Be the first!
          </p>
        </div>
      )}

      {data?.data?.map((comment) => (
        <div key={comment.id} className="flex items-start gap-2">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={comment.author?.avatar} />
            <AvatarFallback>{comment.author?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-xl bg-muted px-3 py-2 text-sm">
            <span className="font-semibold mr-1">{comment.author?.name}</span>
            {comment.body}
          </div>
          <button
            onClick={() => deleteComment(comment.id)}
            className="mt-1 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Postcard card ────────────────────────────────────────────────────────────

function PostcardCard({ postcard }: { postcard: PostcardItem }) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(postcard.isLiked ?? false);
  const [optimisticCount, setOptimisticCount] = useState(postcard.likesCount ?? 0);

  const [likeTarget] = useLikeTargetMutation();
  const [unlikeTarget] = useUnlikeTargetMutation();
  const [recordShare] = useRecordShareMutation();

  const postcardId = postcard._id ?? postcard.post_id ?? "";
  const mediaUrl =
    postcard.gallery_items?.[0]?.url ?? postcard.media?.[0]?.url ?? "";
  const eventName = postcard.event?.name ?? "";
  const vibeTag = postcard.vibeTag?.name ?? "";
  const username = postcard.user?.username ?? postcard.user?.name ?? "";

  const handleLike = async () => {
    const wasLiked = optimisticLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      if (wasLiked) {
        await unlikeTarget({ targetType: "postcard", targetId: postcardId });
      } else {
        await likeTarget({ targetType: "postcard", targetId: postcardId });
      }
    } catch {
      // revert on error
      setOptimisticLiked(wasLiked);
      setOptimisticCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const handleShare = async () => {
    await recordShare({
      targetType: "postcard",
      targetId: postcardId,
      platform: "copy",
    });
    navigator.clipboard?.writeText(window.location.origin + `/postcard/${postcardId}`);
  };

  return (
    <Card className="overflow-hidden">
      {/* User header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar
          className="h-10 w-10 cursor-pointer"
          onClick={() => router.push(`/user/${postcard.user?.id}`)}
        >
          <AvatarImage src={postcard.user?.avatar} />
          <AvatarFallback>{postcard.user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">{postcard.user?.name}</p>
          <p className="text-xs text-muted-foreground">
            {username.startsWith("@") ? username : `@${username}`}
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTime(postcard.createdAt)}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push(`/dashboard/messages?chat=${postcard.user?.id}`)}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* Image */}
      {mediaUrl ? (
        <div className="relative aspect-square">
          <img
            src={mediaUrl}
            alt={postcard.caption ?? "postcard"}
            className="w-full h-full object-cover"
          />
          {vibeTag && (
            <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0">
              #{vibeTag}
            </Badge>
          )}
        </div>
      ) : (
        <div className="relative aspect-square bg-muted flex flex-col items-center justify-center gap-2">
          <GalleryHorizontal className="h-10 w-10 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">No image</p>
          {vibeTag && (
            <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0">
              #{vibeTag}
            </Badge>
          )}
        </div>
      )}

      {/* Actions + caption */}
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-sm"
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all",
                optimisticLiked
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              )}
            />
            <span className="font-medium">{optimisticCount}</span>
          </button>

          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{postcard.commentsCount ?? 0}</span>
            {showComments ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          <button
            onClick={handleShare}
            className="ml-auto text-muted-foreground"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {postcard.caption ? (
          <p className="text-sm mb-2">
            <span className="font-semibold">
              {username.startsWith("@") ? username : `@${username}`}
            </span>{" "}
            {postcard.caption}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-2 italic">No caption</p>
        )}

        {eventName ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{eventName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>No event linked</span>
          </div>
        )}
      </CardContent>

      {/* Comments panel */}
      {showComments && <CommentsPanel postcardId={postcardId} />}
    </Card>
  );
}

// ─── Feed skeleton ────────────────────────────────────────────────────────────

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="aspect-square w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Social = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Feed
  const {
    data: feedData,
    isLoading: feedLoading,
    isError: feedError,
    refetch: refetchFeed,
  } = useGetPostcardsFeedQuery();

  // People
  const {
    data: peopleData,
    isLoading: peopleLoading,
    isError: peopleError,
    refetch: refetchPeople,
  } = useGetSuggestedUsersQuery();

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const postcards = feedData?.data?.data ?? [];
  const people = peopleData?.data ?? [];

  const filteredPeople = people.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Social
          </h1>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 h-10">
              <TabsTrigger value="feed" className="gap-2">
                <GalleryHorizontal className="h-4 w-4" />
                Postcards
              </TabsTrigger>
              <TabsTrigger value="people" className="gap-2">
                <Users className="h-4 w-4" />
                People
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container px-4 py-4">
        {/* ── Postcards feed ── */}
        {activeTab === "feed" && (
          <>
            {feedLoading && <FeedSkeleton />}

            {feedError && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Failed to load postcards.
                </p>
                <Button variant="outline" onClick={() => refetchFeed()}>
                  Retry
                </Button>
              </div>
            )}

            {!feedLoading && !feedError && postcards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GalleryHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  No postcards yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Attend events and share your moments!
                </p>
              </div>
            )}

            {!feedLoading && !feedError && postcards.length > 0 && (
              <div className="space-y-4">
                {postcards.map((postcard) => (
                  <PostcardCard key={postcard._id ?? postcard.post_id} postcard={postcard} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── People discovery ── */}
        {activeTab === "people" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendees…"
                className="pl-10 rounded-full"
              />
            </div>

            {peopleLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {peopleError && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Failed to load suggestions.
                </p>
                <Button variant="outline" onClick={() => refetchPeople()}>
                  Retry
                </Button>
              </div>
            )}

            {!peopleLoading && !peopleError && filteredPeople.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  {searchQuery ? "No results found" : "No suggestions yet"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? `No attendees match "${searchQuery}". Try a different name.`
                    : "Attend events to connect with other vibers!"}
                </p>
              </div>
            )}

            {!peopleLoading && !peopleError && filteredPeople.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                  People You Might Know
                </h3>
                <div className="space-y-3">
                  {filteredPeople.map((person) => (
                    <Card key={person.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar
                            className="h-12 w-12 cursor-pointer"
                            onClick={() => router.push(`/user/${person.id}`)}
                          >
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback>{person.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm truncate">
                                {person.name}
                              </h4>
                              {person.username && (
                                <span className="text-xs text-muted-foreground">
                                  {person.username.startsWith("@")
                                    ? person.username
                                    : `@${person.username}`}
                                </span>
                              )}
                            </div>
                            {person.bio && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                                {person.bio}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {person.eventsAttended !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {person.eventsAttended} events
                                </span>
                              )}
                              {person.postcardsCount !== undefined && (
                                <span className="flex items-center gap-1">
                                  <Image className="h-3 w-3" />
                                  {person.postcardsCount} postcards
                                </span>
                              )}
                            </div>
                            {(person.mutualEventsCount ?? 0) > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <MapPin className="h-3 w-3 text-primary" />
                                <span className="text-xs text-primary">
                                  {person.mutualEventsCount} shared event
                                  {(person.mutualEventsCount ?? 0) > 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant={person.isFollowing ? "outline" : "default"}
                              className="gap-1"
                              onClick={() =>
                                person.isFollowing
                                  ? unfollowUser(person.id)
                                  : followUser(person.id)
                              }
                            >
                              {person.isFollowing ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  Following
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-3 w-3" />
                                  Follow
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                router.push(`/dashboard/messages?chat=${person.id}`)
                              }
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
