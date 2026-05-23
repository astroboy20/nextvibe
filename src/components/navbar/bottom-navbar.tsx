"use client";
import { useEffect, useState } from "react";
import { Home, Plus, User, MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import { useGetConversationsQuery } from "@/app/provider/api/messagingApi";
import { useSocket } from "@/hooks/useSocket";

const navItems = [
  { icon: Home, label: "Home", path: "/events" },
  { icon: Users, label: "Social", path: "/social" },
  {
    icon: Plus,
    label: "Create",
    path: "/dashboard/event/create/?step=1",
    isMain: true,
  },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: User, label: "Profile", path: "/profile" },
];

// ── Unread message count hook ─────────────────────────────────────────────────
// Reads the shared RTK Query conversations cache and subscribes to socket
// events so the badge updates in real-time even when not on /messages.
function useUnreadMessages(isOnMessagesPage: boolean) {
  const { data, refetch } = useGetConversationsQuery();
  const conversations = data?.data ?? [];
  const serverUnread = conversations.reduce((s, c) => s + (c.unreadCount ?? 0), 0);

  // Show a dot immediately when a new message arrives (before refetch lands).
  const [pendingNew, setPendingNew] = useState(false);

  // Once the server confirms unread count, clear the optimistic dot.
  useEffect(() => {
    if (serverUnread > 0) setPendingNew(false);
  }, [serverUnread]);

  // Socket — disabled when /messages is open because that page manages its
  // own socket and already calls refetch() on new:dm, which updates the
  // shared RTK Query cache this hook reads from.
  const { socketRef } = useSocket("messaging", { enabled: !isOnMessagesPage });

  useEffect(() => {
    if (isOnMessagesPage) return;
    const socket = socketRef.current;
    if (!socket) return;

    const joinAll = () => {
      conversations.forEach((c) => socket.emit("join:dm", { conversationId: c.id }));
    };

    const handleNewDm = () => {
      setPendingNew(true); // immediate visual feedback
      refetch();           // pull fresh counts from server
    };

    socket.on("connect", joinAll);
    socket.on("new:dm", handleNewDm);
    if (socket.connected) joinAll();

    return () => {
      socket.off("connect", joinAll);
      socket.off("new:dm", handleNewDm);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnMessagesPage, socketRef, conversations, refetch]);

  return { unread: serverUnread, pendingNew };
}

// ─────────────────────────────────────────────────────────────────────────────

const BottomNav = () => {
  const pathname = usePathname();
  const hideNavbar = useSelector((state: RootState) => state.ui.hideHeader);
  const isOnMessagesPage = pathname.startsWith("/messages");

  const { unread, pendingNew } = useUnreadMessages(isOnMessagesPage);
  const showBadge = unread > 0 || pendingNew;

  if (hideNavbar) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white">
      <div className="glass border-t border-border/50 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            const Icon = item.icon;
            const isMessages = item.path === "/messages";

            if (item.isMain) {
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex items-center justify-center -mt-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#34132E] text-white shadow-elevated transition-transform hover:scale-105 active:scale-95">
                    <Icon className="h-6 w-6" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />

                  {/* Unread badge — only on the Messages tab */}
                  {isMessages && showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-0.5 leading-none">
                      {unread > 0 ? (unread > 99 ? "99+" : unread) : ""}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
