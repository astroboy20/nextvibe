"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { NewLogo } from "../logo";
import { RootState } from "@/app/provider/store";
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkOneReadMutation,
  type Notification,
} from "@/app/provider/api/notificationApi";
import { useSocket } from "@/hooks/useSocket";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ── notification type → label / color ────────────────────────────────────────
function notifMeta(type: string) {
  switch (type) {
    case "like":
      return { label: "liked your postcard", dot: "bg-[hsl(330,70%,55%)]" };
    case "comment":
      return { label: "commented on your postcard", dot: "bg-[hsl(195,100%,42%)]" };
    case "follow":
      return { label: "started following you", dot: "bg-[hsl(280,60%,50%)]" };
    case "rsvp":
      return { label: "RSVP'd to your event", dot: "bg-[hsl(316,62%,20%)]" };
    case "game":
      return { label: "challenged you to a game", dot: "bg-[hsl(195,100%,42%)]" };
    case "reward":
      return { label: "sent you a reward", dot: "bg-[hsl(330,70%,55%)]" };
    default:
      return { label: type, dot: "bg-muted-foreground" };
  }
}

// ── notification item ─────────────────────────────────────────────────────────
function NotifItem({
  notif,
  onRead,
  onClose,
}: {
  notif: Notification;
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const meta = notifMeta(notif.type);
  const actor = notif.actor?.displayName ?? notif.actor?.username ?? "Someone";

  const handleClick = () => {
    if (!notif.isRead) onRead(notif.id);
    if (notif.actor?.id) {
      onClose();
      router.push(`/users/${notif.actor.id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/60",
        !notif.isRead && "bg-primary/5"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0 mt-0.5">
        {notif.actor?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={notif.actor.avatarUrl}
            alt={actor}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {actor[0].toUpperCase()}
          </div>
        )}
        {/* type dot */}
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
            meta.dot
          )}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug flex items-center gap-1">
          <span className="font-semibold truncate">{actor}</span>{" "}
          <span className="text-muted-foreground truncate">
            { meta.label === "FOLLOW" ? "started following you" : meta.label }
          </span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Unread dot */}
      {!notif.isRead && (
        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </button>
  );
}

// ── notification bell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, refetch } = useGetNotificationsQuery();
  const [markAllRead] = useMarkAllReadMutation();
  const [markOneRead] = useMarkOneReadMutation();

  // Real-time notifications via Socket.IO
  const { socketRef } = useSocket("notifications");
  // Track IDs of notifs that arrived in real-time but haven't been fetched yet.
  // We reset this whenever the REST data refreshes so we don't double-count.
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNotification = (notif: Notification) => {
      // Add this id to pending so the badge shows +1 immediately,
      // then pull the full updated list from the server.
      setPendingIds((prev) => new Set([...prev, notif.id ?? `rt-${Date.now()}`]));
      refetch();
    };

    // Register listener directly — socket.io keeps it across reconnects.
    // No isConnected guard needed; the listener just waits until messages arrive.
    socket.on("notification", handleNotification);
    return () => {
      socket.off("notification", handleNotification);
    };
  // socketRef is a stable ref — only re-register if refetch identity changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef, refetch]);

  const notifications: Notification[] = data?.data?.data ?? [];

  // Once the REST data comes back, clear pendingIds that are now in the list
  useEffect(() => {
    if (!data) return;
    const fetchedIds = new Set(notifications.map((n) => n.id));
    setPendingIds((prev) => {
      const stillPending = new Set([...prev].filter((id) => !fetchedIds.has(id)));
      return stillPending.size === prev.size ? prev : stillPending;
    });
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  const restUnread = data?.data?.meta?.unreadCount ?? 0;
  const unreadCount = restUnread + pendingIds.size;

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await markOneRead(id).unwrap();
    } catch {
      // silent
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          aria-label="Notifications"
          className="relative cursor-pointer p-1.5"
        >
          <Bell className="h-7 w-7" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-0.5 leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 rounded-xl shadow-(--shadow-elevated) overflow-hidden z-1000001"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-primary/10 text-primary font-semibold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-muted-foreground">
              No notifications yet.
            </p>
          </div>
        ) : (
          /* Plain div scroll — more reliable than ScrollArea inside a Popover */
          <div className="max-h-90 overflow-y-auto">
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <NotifItem
                  key={n.id}
                  notif={n}
                  onRead={handleMarkOne}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer — view all */}
        <div className="border-t px-4 py-2.5">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center text-xs text-primary font-medium hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}



// ── main navbar ───────────────────────────────────────────────────────────────
interface HeaderProps {
  title?: string;
}

const DashboardNavbar = ({ title }: HeaderProps) => {
  const hideHeader = useSelector((state: RootState) => state.ui.hideHeader);

  if (hideHeader) return null;

  return (
    <header className="sticky top-0 z-1000000 border-b w-full bg-white/95 backdrop-blur-sm">
      <div className="container flex h-24 px-4 items-center justify-between lg:max-w-7xl mx-auto">
        {/* Left — logo + optional title */}
        <div className="flex items-center gap-3">
          <NewLogo />
          {title && (
            <h1 className="font-display text-lg font-semibold">{title}</h1>
          )}
        </div>

        {/* Right — notifications + sign out */}
        <div className="flex items-center gap-1">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
