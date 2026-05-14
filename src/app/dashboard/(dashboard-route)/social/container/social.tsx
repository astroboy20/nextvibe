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
  Heart, MessageCircle, Share2, Search, Users,
  Calendar, UserPlus, Check, GalleryHorizontal,
  ChevronDown, ChevronUp, Send, Trash2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  useGetFollowingFeedQuery,
  useToggleFollowMutation,
  useGetMyFollowersQuery,
  useGetMyFollowingQuery,
  useGetMutualsQuery,
  useLikeTargetMutation,
  useUnlikeTargetMutation,
  useGetCommentsQuery,
  usePostCommentMutation,
  useDeleteCommentMutation,
  useRecordShareMutation,
  type PostcardItem,
  type SocialUser,
} from "@/app/provider/api/socialApi";
import { useStartConversationMutation } from "@/app/provider/api/messagingApi";
import { toast } from "sonner";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

// ── Comments panel ────────────────────────────────────────────────────────────
function CommentsPanel({ postcardId }: { postcardId: string }) {
  const [commentText, setCommentText] = useState("");
  const { data, isLoading } = useGetCommentsQuery({ targetType: "postcard", targetId: postcardId });
  const [postComment, { isLoading: isPosting }] = usePostCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  const handlePost = async () => {
    if (!commentText.trim()) return;
    await postComment({ targetType: "postcard", targetId: postcardId, body: commentText.trim() });
    setCommentText("");
  };

  return (
    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 rounded-full text-sm"
          onKeyDown={(e) => e.key === "Enter" && handlePost()}
        />
        <Button size="icon" variant="ghost" className="rounded-full"
          disabled={!commentText.trim() || isPosting} onClick={handlePost}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {isLoading && <Skeleton className="h-8 w-full rounded-lg" />}
      {!isLoading && (data?.data?.length ?? 0) === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet.</p>
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
          <button onClick={() => deleteComment(comment.id)} className="mt-1 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Postcard card ─────────────────────────────────────────────────────────────
function PostcardCard({ postcard }: { postcard: PostcardItem }) {
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(postcard.isLiked ?? false);
  const [optimisticCount, setOptimisticCount] = useState(postcard.likesCount ?? 0);

  const [likeTarget] = useLikeTargetMutation();
  const [unlikeTarget] = useUnlikeTargetMutation();
  const [recordShare] = useRecordShareMutation();

  const postcardId = postcard.id ?? postcard._id ?? postcard.post_id ?? "";
  const user = postcard.user ?? postcard.author;
  const mediaUrl = postcard.gallery_items?.[0]?.url ?? postcard.media?.[0]?.url ?? "";
  const eventName = postcard.event?.name ?? "";
  const vibeTag = postcard.vibeTag?.name ?? "";
  const username = user?.username ?? user?.name ?? "";

  const handleLike = async () => {
    const wasLiked = optimisticLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      if (wasLiked) await unlikeTarget({ targetType: "postcard", targetId: postcardId });
      else await likeTarget({ targetType: "postcard", targetId: postcardId });
    } catch {
      setOptimisticLiked(wasLiked);
      setOptimisticCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const handleShare = async () => {
    const shareLink = `${window.location.origin}/postcard/${postcardId}`;
    await recordShare({ targetType: "postcard", targetId: postcardId, platform: "copy" });
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this postcard on NextVibe",
          url: shareLink,
        });
        return;
      } catch (e: any) {
        if (e?.name === "AbortError") return;
      }
    }
    navigator.clipboard?.writeText(shareLink);
    toast.success("Link copied to clipboard");
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar className="h-10 w-10 cursor-pointer" onClick={() => router.push(`/user/${user?.id}`)}>
          <AvatarImage src={user?.avatar} />
          <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold text-sm">{user?.name}</p>
          <p className="text-xs text-muted-foreground">@{username.replace(/^@/, "")}</p>
        </div>
        <span className="text-xs text-muted-foreground">{formatTime(postcard.createdAt)}</span>
      </div>

      {mediaUrl ? (
        <div className="relative aspect-square">
          <img src={mediaUrl} alt={postcard.caption ?? "postcard"} className="w-full h-full object-cover" />
          {vibeTag && <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0">#{vibeTag}</Badge>}
        </div>
      ) : (
        <div className="relative aspect-square bg-muted flex items-center justify-center">
          <GalleryHorizontal className="h-10 w-10 text-muted-foreground" />
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={handleLike} className="flex items-center gap-1.5 text-sm">
            <Heart className={cn("h-5 w-5 transition-all", optimisticLiked ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
            <span className="font-medium">{optimisticCount}</span>
          </button>
          <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span>{postcard.commentsCount ?? 0}</span>
            {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <button onClick={handleShare} className="ml-auto text-muted-foreground">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
        {postcard.caption && (
          <p className="text-sm mb-2">
            <span className="font-semibold">@{username.replace(/^@/, "")}</span> {postcard.caption}
          </p>
        )}
        {eventName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{eventName}</span>
          </div>
        )}
      </CardContent>
      {showComments && <CommentsPanel postcardId={postcardId} />}
    </Card>
  );
}

// ── People list ───────────────────────────────────────────────────────────────
function PeopleList({ users, isLoading, emptyText, defaultFollowing = false }: {
  users: SocialUser[];
  isLoading: boolean;
  emptyText: string;
  defaultFollowing?: boolean;
}) {
  const router = useRouter();
  const [toggleFollow] = useToggleFollowMutation();
  const [startConversation] = useStartConversationMutation();
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({});
  const [startingChat, setStartingChat] = useState<string | null>(null);

  const handleToggle = async (user: SocialUser) => {
    // People in "following" list are already followed; others use isFollowing field
    const current = followingState[user.id] ?? user.isFollowing ?? defaultFollowing;
    setFollowingState((s) => ({ ...s, [user.id]: !current }));
    try {
      await toggleFollow(user.id).unwrap();
    } catch {
      setFollowingState((s) => ({ ...s, [user.id]: current }));
    }
  };

  const handleChat = async (userId: string) => {
    setStartingChat(userId);
    try {
      const res = await startConversation({ userId }).unwrap();
      const conversationId = res?.data?.id;
      if (conversationId) {
        router.push(`/dashboard/messages?conversation=${conversationId}`);
      } else {
        router.push(`/dashboard/messages?chat=${userId}`);
      }
    } catch (err: any) {
      const message =
        err?.data?.error?.message ??
        err?.data?.message ??
        "You can only message mutual followers.";
      toast.error(message);
    } finally {
      setStartingChat(null);
    }
  };

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}><CardContent className="p-4 flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
        </CardContent></Card>
      ))}
    </div>
  );

  if (!users.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-sm text-muted-foreground">{emptyText}</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {users.map((person) => {
      const isFollowing = followingState[person.id] ?? person.isFollowing ?? defaultFollowing;
        const name = person.displayName ?? person.username ?? "User";
        return (
          <Card key={person.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 cursor-pointer shrink-0" onClick={() => router.push(`/user/${person.id}`)}>
                  <AvatarImage src={person.avatarUrl} />
                  <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{name}</p>
                  {person.username && (
                    <p className="text-xs text-muted-foreground">@{person.username.replace(/^@/, "")}</p>
                  )}
                  {person.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{person.bio}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant={isFollowing ? "outline" : "default"} className="gap-1 rounded-full"
                    onClick={() => handleToggle(person)}>
                    {isFollowing ? <><Check className="h-3 w-3" />Following</> : <><UserPlus className="h-3 w-3" />Follow</>}
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-full"
                    disabled={startingChat === person.id}
                    onClick={() => handleChat(person.id)}>
                    {startingChat === person.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <MessageCircle className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const Social = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [peopleTab, setPeopleTab] = useState<"following" | "followers" | "mutuals">("following");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: feedData, isLoading: feedLoading, isError: feedError, refetch: refetchFeed } = useGetFollowingFeedQuery();
  const { data: followingData, isLoading: followingLoading } = useGetMyFollowingQuery(undefined, { skip: activeTab !== "people" });
  const { data: followersData, isLoading: followersLoading } = useGetMyFollowersQuery(undefined, { skip: activeTab !== "people" });
  const { data: mutualsData, isLoading: mutualsLoading } = useGetMutualsQuery(undefined, { skip: activeTab !== "people" });

  const postcards = feedData?.data?.data ?? [];

  const filterUsers = (users: SocialUser[]) => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u) =>
      (u.displayName ?? "").toLowerCase().includes(q) ||
      (u.username ?? "").toLowerCase().includes(q)
    );
  };

  const peopleMap = {
    following: { users: filterUsers(followingData?.data?.data ?? []), isLoading: followingLoading, emptyText: "You're not following anyone yet.", defaultFollowing: true },
    followers: { users: filterUsers(followersData?.data?.data ?? []), isLoading: followersLoading, emptyText: "No followers yet.",               defaultFollowing: false },
    mutuals:   { users: filterUsers(mutualsData?.data?.data ?? []),   isLoading: mutualsLoading,   emptyText: "No mutuals yet.",                  defaultFollowing: true },
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Social</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 h-10">
              <TabsTrigger value="feed" className="gap-2">
                <GalleryHorizontal className="h-4 w-4" /> Feed
              </TabsTrigger>
              <TabsTrigger value="people" className="gap-2">
                <Users className="h-4 w-4" /> People
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container px-4 py-4">
        {/* ── Feed ── */}
        {activeTab === "feed" && (
          <>
            {feedLoading && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="flex items-center gap-3 p-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div>
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4 space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-full" /></div>
                  </Card>
                ))}
              </div>
            )}
            {feedError && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-muted-foreground mb-4">Failed to load feed.</p>
                <Button variant="outline" onClick={() => refetchFeed()}>Retry</Button>
              </div>
            )}
            {!feedLoading && !feedError && postcards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GalleryHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Nothing in your feed yet</h3>
                <p className="text-sm text-muted-foreground">Follow people to see their postcards here.</p>
              </div>
            )}
            {!feedLoading && !feedError && postcards.length > 0 && (
              <div className="space-y-4">
                {postcards.map((p) => <PostcardCard key={p.id ?? p._id ?? p.post_id} postcard={p} />)}
              </div>
            )}
          </>
        )}

        {/* ── People ── */}
        {activeTab === "people" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search people…" className="pl-10 rounded-full" />
            </div>

            <Tabs value={peopleTab} onValueChange={(v) => setPeopleTab(v as typeof peopleTab)}>
              <TabsList className="w-full grid grid-cols-3 h-9">
                <TabsTrigger value="following" className="text-xs">Following</TabsTrigger>
                <TabsTrigger value="followers" className="text-xs">Followers</TabsTrigger>
                <TabsTrigger value="mutuals" className="text-xs">Mutuals</TabsTrigger>
              </TabsList>
            </Tabs>

            <PeopleList {...peopleMap[peopleTab]} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
