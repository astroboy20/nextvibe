"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  Search,
  MessageCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  type Conversation,
  type Message,
} from "@/app/provider/api/messagingApi";
import { useSocket } from "@/hooks/useSocket";
import { getTokens } from "@/hooks/getToken";
import { setHideHeader } from "@/app/provider/slices/ui-slice";

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

/** Synthesise a soft notification ping using Web Audio — no file needed. */
function playNotifSound() {
  try {
    const AudioCtx = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx() as AudioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Browsers may block AudioContext without a user gesture — fail silently.
  }
}

// ─── Chat view ───────────────────────────────────────────────────────────────

interface ChatViewProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
}

function ChatView({ conversation, currentUserId, onBack }: ChatViewProps) {
  const dispatch = useDispatch();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Maps optimistic message body → its temporary id so we can replace it when
  // the server echoes the real message back via new:dm (prevents double-bubble).
  const pendingOptimisticRef = useRef<Map<string, string>>(new Map());

  // Hide the global DashboardNavbar and BottomNav while the chat is open
  useEffect(() => {
    dispatch(setHideHeader(true));
    return () => { dispatch(setHideHeader(false)); };
  }, [dispatch]);

  // refetchOnMountOrArgChange: true → always fetch fresh messages when opening
  // a chat (prevents stale cached data showing old messages after returning)
  const { data, isLoading } = useGetMessagesQuery(
    { conversationId: conversation.id },
    { refetchOnMountOrArgChange: true }
  );


  // Seed local state from REST response (newest-first → reverse for display)
  useEffect(() => {
    if (data?.data) {
      const msgs = [...data.data.data].reverse();
      console.log(`[chat] REST loaded ${msgs.length} messages for conv=${conversation.id}`);
      setLocalMessages(msgs);
    }
  }, [data, conversation.id]);

  // Socket.IO connection for real-time DMs
  const { socketRef, isConnected, status } = useSocket("messaging");

  // Log every status change so you can see connect/disconnect in real time
  useEffect(() => {
    console.log(`[chat] socket status → ${status}`);
  }, [status]);

  // Join the DM room and listen for incoming messages.
  // We attach directly to the socket "connect" event so join:dm is re-emitted
  // on every (re)connect without depending on React state timing.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) {
      console.warn(`[chat] join effect: socket not available yet`);
      return;
    }

    const joinRoom = () => {
      console.log(`[chat] 🔗 join:dm  conv=${conversation.id}  socketId=${socket.id ?? "pending"}`);
      socket.emit("join:dm", { conversationId: conversation.id });
    };

    const handleNewDm = (msg: Message) => {
      console.log(`[chat] 📨 new:dm received`, msg);

      // If this is an echo of our own optimistic bubble, replace it with the
      // real message (correct id + server timestamp) instead of appending a copy.
      if (msg.senderId === currentUserId) {
        const optId = pendingOptimisticRef.current.get(msg.body);
        if (optId) {
          pendingOptimisticRef.current.delete(msg.body);
          setLocalMessages((prev) => prev.map((m) => m.id === optId ? msg : m));
          return;
        }
      }

      // Incoming message from the other person — append and ping
      playNotifSound();
      setLocalMessages((prev) => [...prev, msg]);
    };

    // "connect" fires on initial connect AND every reconnect — guaranteed emit
    socket.on("connect", joinRoom);
    socket.on("new:dm", handleNewDm);

    // If already connected when the effect runs (socket was ready before React re-rendered),
    // join immediately since "connect" won't fire again for an already-open socket
    if (socket.connected) {
      console.log(`[chat] already connected on mount — joining immediately`);
      joinRoom();
    } else {
      console.log(`[chat] not yet connected (status=${status}) — will join when "connect" fires`);
    }

    return () => {
      socket.off("connect", joinRoom);
      socket.off("new:dm", handleNewDm);
    };
  // socketRef is a stable ref object; conversation.id re-join when switching convos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id, socketRef]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const body = newMessage.trim();

    if (!isConnected || !socketRef.current) {
      console.error(`[chat] ❌ cannot send — socket not connected (status=${status})`);
      // Don't add optimistic bubble if we can't actually send
      return;
    }

    console.log(`[chat] 📤 send:dm  conv=${conversation.id}  body="${body}"`);
    socketRef.current.emit("send:dm", {
      conversationId: conversation.id,
      body,
    });

    // Optimistic local message — track it so new:dm echo can replace it
    const optimisticId = `opt-${Date.now()}`;
    pendingOptimisticRef.current.set(body, optimisticId);
    const optimistic: Message = {
      id: optimisticId,
      senderId: currentUserId,
      body,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, optimistic]);
    setNewMessage("");
  };

  return (
    // fixed inset-0: escape the (app) layout wrapper so the chat fills the full screen
    // and the input is never hidden behind the bottom nav
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur shrink-0">
        <div className="container flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.participant.avatarUrl} />
            <AvatarFallback>
              {conversation.participant.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">
              {conversation.participant.username}
            </h1>
            {/* Socket status indicator — remove once messaging is stable */}
            <p className={cn(
              "text-[10px] font-medium",
              status === "connected"    && "text-green-500",
              status === "connecting"   && "text-amber-500",
              status === "disconnected" && "text-muted-foreground",
              status === "error"        && "text-red-500",
            )}>
              {status}
            </p>
          </div>
        </div>
      </div>

      {/* Messages — scrollable middle zone */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="flex flex-col gap-0.5">
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Loading messages…
            </p>
          )}
          {localMessages.map((message, index) => {
            const isMine = message.senderId === currentUserId;
            const prev = localMessages[index - 1];
            const next = localMessages[index + 1];
            const isFirstInGroup = !prev || prev.senderId !== message.senderId;
            const isLastInGroup  = !next || next.senderId !== message.senderId;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  isMine ? "justify-end" : "justify-start",
                  // Extra breathing room between sender groups
                  isLastInGroup && index !== localMessages.length - 1 && "mb-2",
                )}
              >
                {/* Avatar column for received messages — fixed width keeps bubbles aligned */}
                {!isMine && (
                  <div className="w-7 shrink-0 self-end">
                    {isLastInGroup ? (
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={conversation.participant.avatarUrl} />
                        <AvatarFallback className="text-[10px]">
                          {conversation.participant.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : null}
                  </div>
                )}

                <div className={cn("flex flex-col max-w-[75%]", isMine && "items-end")}>
                  <div
                    className={cn(
                      "px-4 py-2 text-sm leading-relaxed",
                      isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                      // All corners rounded by default; flatten connecting corners within a group
                      "rounded-2xl",
                      isMine  && !isFirstInGroup && "rounded-tr-[6px]",
                      isMine  && !isLastInGroup  && "rounded-br-[6px]",
                      !isMine && !isFirstInGroup && "rounded-tl-[6px]",
                      !isMine && !isLastInGroup  && "rounded-bl-[6px]",
                    )}
                  >
                    {message.body}
                  </div>

                  {/* Timestamp only on the last bubble of each group */}
                  {isLastInGroup && (
                    <p className={cn(
                      "text-[10px] mt-1 px-1",
                      isMine ? "text-muted-foreground" : "text-muted-foreground",
                    )}>
                      {formatTime(message.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background p-4 shrink-0">
        {!isConnected && (
          <p className="text-xs text-center text-muted-foreground mb-2">
            {status === "connecting" ? "Connecting…" : "Reconnecting — messages may be delayed"}
          </p>
        )}
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type a message…" : "Waiting for connection…"}
            className="flex-1 rounded-full"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!isConnected}
          />
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleSend}
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const Messages = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  // Per-conversation unread counts tracked locally so the badge shows
  // instantly on socket events (before refetch lands from the server).
  const [localUnread, setLocalUnread] = useState<Record<string, number>>({});

  // Derive current user id from token (stored in cookie as JWT)
  // We pass it down so ChatView can distinguish sent vs received messages.
  // If you have a Redux user slice, swap this for useSelector.
  const currentUserId = useRef<string>("");
  useEffect(() => {
    try {
      const { accessToken } = getTokens();
      if (accessToken) {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        currentUserId.current = payload?.sub ?? payload?.id ?? "";
      }
    } catch {
      // ignore decode errors
    }
  }, []);

  const { data, isLoading, isError, refetch } = useGetConversationsQuery();
  const conversations = data?.data ?? [];

  // ── Real-time list updates ────────────────────────────────────────────────
  // Connect a socket ONLY while the list is visible (disabled when ChatView is
  // open so it doesn't clash with ChatView's own socket connection).
  const { socketRef: listSocketRef } = useSocket("messaging", {
    enabled: !selectedConversation,
  });

  useEffect(() => {
    if (selectedConversation) return;           // ChatView handles its own socket
    const socket = listSocketRef.current;
    if (!socket) return;

    // Join every conversation room so the server sends new:dm for any of them.
    const joinAll = () => {
      conversations.forEach((c) => {
        socket.emit("join:dm", { conversationId: c.id });
      });
    };

    // When a new message arrives, refetch for server-accurate counts AND
    // immediately bump the local badge so the UI reacts before the round-trip.
    // The server may include conversationId in the payload; use it if present.
    const handleNewDm = (msg: any) => {
      refetch();
      const convId: string | undefined = msg?.conversationId;
      if (convId) {
        setLocalUnread((prev) => ({
          ...prev,
          [convId]: (prev[convId] ?? 0) + 1,
        }));
      }
    };

    socket.on("connect", joinAll);
    socket.on("new:dm", handleNewDm);
    if (socket.connected) joinAll();            // already connected on mount

    return () => {
      socket.off("connect", joinAll);
      socket.off("new:dm", handleNewDm);
    };
  // Re-run when conversations load (so newly-appeared rooms get joined) or
  // when selectedConversation toggles (enables/disables this socket).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, listSocketRef, conversations, refetch]);

  // Once the server-side unreadCount is confirmed (refetch returned), drop the
  // local entry so we don't double-count. If the server returns 0 we keep the
  // local count as a fallback (backend may not track reads perfectly).
  useEffect(() => {
    if (!conversations.length) return;
    setLocalUnread((prev) => {
      const changed = conversations.some((c) => c.unreadCount > 0 && prev[c.id]);
      if (!changed) return prev;
      const next = { ...prev };
      conversations.forEach((c) => {
        if (c.unreadCount > 0) delete next[c.id];
      });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  // Auto-select conversation from URL param
  useEffect(() => {
    if (chatId && conversations.length > 0) {
      const found = conversations.find((c) => c.id === chatId);
      if (found) setSelectedConversation(found);
    }
  }, [chatId, conversations]);

  const filteredConversations = conversations.filter((c) =>
    c.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conv: Conversation) => {
    // Clear local unread badge as soon as the user opens the chat
    setLocalUnread((prev) => {
      if (!prev[conv.id]) return prev;
      const next = { ...prev };
      delete next[conv.id];
      return next;
    });
    setSelectedConversation(conv);
    router.push(`/messages?chat=${conv.id}`);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    router.push("/messages");
  };

  if (selectedConversation) {
    return (
      <ChatView
        conversation={selectedConversation}
        currentUserId={currentUserId.current}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Messages
              </h1>
              <p className="text-sm text-muted-foreground">
                Connect with fellow vibers
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {conversations.length}
              </span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              className="pl-10 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="container px-4 py-4">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Failed to load conversations.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredConversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              No conversations yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other attendees at events!
            </p>
            <Button onClick={() => router.push("/events")}>
              Discover Events
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredConversations.length > 0 && (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => {
              // Merge server count + local optimistic count.
              // Once server confirms (unreadCount > 0) we drop the local entry
              // to avoid double-counting (see the effect above).
              const unread =
                (conversation.unreadCount ?? 0) +
                (localUnread[conversation.id] ?? 0);

              return (
                <Card
                  key={conversation.id}
                  className={cn(
                    "cursor-pointer transition-all hover:bg-muted/50",
                    unread > 0 && "border-primary/30 bg-primary/5"
                  )}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar — no badge here; the count lives on the right */}
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={conversation.participant.avatarUrl} />
                        <AvatarFallback>
                          {conversation.participant.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className={cn(
                              "truncate text-foreground",
                              unread > 0 ? "font-bold" : "font-semibold"
                            )}
                          >
                            {conversation.participant.username}
                          </h3>
                          {conversation.lastMessage && (
                            <span
                              className={cn(
                                "text-xs shrink-0",
                                unread > 0
                                  ? "text-primary font-semibold"
                                  : "text-muted-foreground"
                              )}
                            >
                              {formatTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          {conversation.lastMessage ? (
                            <p
                              className={cn(
                                "text-sm truncate",
                                unread > 0
                                  ? "text-foreground font-medium"
                                  : "text-muted-foreground"
                              )}
                            >
                              {conversation.lastMessage.body}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground truncate">
                              No messages yet
                            </p>
                          )}

                          {/* Unread badge — right-aligned, pill style */}
                          {unread > 0 && (
                            <span className="shrink-0 min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center px-1.5 leading-none">
                              {unread > 99 ? "99+" : unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
