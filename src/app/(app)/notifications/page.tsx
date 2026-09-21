"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Bell, Heart, MessageCircle, UserPlus, Ticket,
  Gamepad2, Trophy, CheckCheck, Loader2,
  CreditCard, CalendarClock, Sparkles,
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
import { useRouter } from "next/navigation";
import { notificationText, notificationHref } from "@/utils/notification-copy";

/**
 * Matched lowercase ("like") while the API sends the Prisma enum uppercase
 * ("LIKE"), so every notification fell through to the generic bell — the same
 * casing bug that made the text render as raw enums. Cases below are the real
 * enum values, matched case-insensitively so it can't regress the same way.
 */
function notificationIcon(type: string) {
  switch (type?.toUpperCase()) {
    case "LIKE":              return <Heart className="h-4 w-4 text-red-500" />;
    case "COMMENT":           return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case "FOLLOW":
    case "TAG":               return <UserPlus className="h-4 w-4 text-green-500" />;
    case "RSVP":
    case "CHECK_IN":          return <Ticket className="h-4 w-4 text-amber-500" />;
    case "TICKET_PURCHASED":  return <Ticket className="h-4 w-4 text-emerald-600" />;
    case "GAME_RESULT":       return <Trophy className="h-4 w-4 text-amber-500" />;
    case "GAME_UNLOCKED":     return <Gamepad2 className="h-4 w-4 text-purple-500" />;
    case "PAYMENT_CONFIRMED": return <CreditCard className="h-4 w-4 text-emerald-600" />;
    case "PAYMENT_FAILED":    return <CreditCard className="h-4 w-4 text-destructive" />;
    case "EVENT_REMINDER":
    case "EVENT_PUBLISHED":   return <CalendarClock className="h-4 w-4 text-primary" />;
    case "VIBETAG_ACTIVATED": return <Sparkles className="h-4 w-4 text-primary" />;
    default:                  return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

// Wording comes from @/utils/notification-copy, shared with the navbar dropdown.
// The previous switch matched lowercase ("like") while the API sends the Prisma
// enum uppercase ("LIKE"), so every notification fell through to the default.

function NotificationItem({ notification }: { notification: Notification }) {
  const router = useRouter();
  const [markOne, { isLoading }] = useMarkOneReadMutation();

  const href = notificationHref(notification);

  const handleClick = async () => {
    if (!notification.isRead) {
      try {
        await markOne(notification.id).unwrap();
      } catch {
        toast.error("Could not mark as read.");
      }
    }
    if (href) router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
        !notification.isRead && "bg-primary/5 border-l-2 border-primary"
      )}
    >
      {/* Actor avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={notification.actor?.avatarUrl} />
          {/* System notifications have no actor — an empty initial would render
              as a blank circle, so fall back to a bell. */}
          <AvatarFallback>
            {notification.actor ? (
              notification.actor.username?.[0]?.toUpperCase()
            ) : (
              <Bell className="h-4 w-4 text-muted-foreground" />
            )}
          </AvatarFallback>
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
