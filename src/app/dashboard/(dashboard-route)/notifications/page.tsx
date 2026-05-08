"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Bell, Heart, MessageCircle, UserPlus, Ticket,
  Gamepad2, Trophy, CheckCheck, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkOneReadMutation,
  type Notification,
} from "@/app/provider/api/notificationApi";
import { toast } from "sonner";
import BottomNav from "@/components/navbar/bottom-navbar";

function notificationIcon(type: string) {
  switch (type) {
    case "like":    return <Heart className="h-4 w-4 text-red-500" />;
    case "comment": return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "follow":  return <UserPlus className="h-4 w-4 text-green-500" />;
    case "rsvp":    return <Ticket className="h-4 w-4 text-amber-500" />;
    case "game":    return <Gamepad2 className="h-4 w-4 text-purple-500" />;
    case "reward":  return <Trophy className="h-4 w-4 text-amber-500" />;
    default:        return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function notificationText(n: Notification): string {
  if (n.message) return n.message;
  switch (n.type) {
    case "like":    return `${n.actor.username} liked your postcard`;
    case "comment": return `${n.actor.username} commented on your postcard`;
    case "follow":  return `${n.actor.username} started following you`;
    case "rsvp":    return `${n.actor.username} RSVP'd to your event`;
    case "game":    return `${n.actor.username} joined your game`;
    case "reward":  return `You received a reward!`;
    default:        return `New notification from ${n.actor.username}`;
  }
}

function NotificationItem({ notification }: { notification: Notification }) {
  const [markOne, { isLoading }] = useMarkOneReadMutation();

  const handleRead = async () => {
    if (notification.isRead) return;
    try {
      await markOne(notification.id).unwrap();
    } catch {
      toast.error("Could not mark as read.");
    }
  };

  return (
    <button
      onClick={handleRead}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/5 border-l-2 border-primary"
      )}
    >
      {/* Actor avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={notification.actor?.avatarUrl} />
          <AvatarFallback>{notification.actor?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border">
          {notificationIcon(notification.type)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.isRead && "font-medium text-foreground")}>
          {notificationText(notification)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Unread dot / loading */}
      <div className="shrink-0 mt-1">
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : !notification.isRead ? (
          <span className="h-2.5 w-2.5 rounded-full bg-primary block" />
        ) : null}
      </div>
    </button>
  );
}

export default function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useGetNotificationsQuery(undefined);
  const [markAll, { isLoading: isMarkingAll }] = useMarkAllReadMutation();

  const notifications: Notification[] = data?.data?.data ?? [];
  const unreadCount = data?.data?.meta?.unreadCount ?? 0;

  const handleMarkAll = async () => {
    try {
      await markAll().unwrap();
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="container px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              onClick={handleMarkAll}
              disabled={isMarkingAll}
            >
              {isMarkingAll
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <CheckCheck className="h-3.5 w-3.5" />}
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">Failed to load notifications.</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">All caught up!</h3>
          <p className="text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && notifications.length > 0 && (
        <div className="divide-y divide-border">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
