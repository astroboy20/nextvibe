"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Send,
  Search,
  MessageCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/navbar/bottom-navbar";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  type Conversation,
  type Message,
} from "@/app/provider/api/messagingApi";
import { useSocket } from "@/hooks/useSocket";
import { getTokens } from "@/hooks/getToken";

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

// ─── Chat view ───────────────────────────────────────────────────────────────

interface ChatViewProps {
  conversation: Conversation;
  currentUserId: string;
  onBack: () => void;
}

function ChatView({ conversation, currentUserId, onBack }: ChatViewProps) {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useGetMessagesQuery({
    conversationId: conversation.id,
  });

  // Seed local state from REST response (newest-first → reverse for display)
  useEffect(() => {
    if (data?.data) {
      setLocalMessages([...data.data].reverse());
    }
  }, [data]);

  // Socket.IO connection for real-time DMs
  const { socketRef, isConnected } = useSocket("messaging");

  useEffect(() => {
    if (!isConnected) return;
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("join:dm", { conversationId: conversation.id });

    const handleNewDm = (msg: Message) => {
      setLocalMessages((prev) => [...prev, msg]);
    };

    socket.on("new:dm", handleNewDm);
    return () => {
      socket.off("new:dm", handleNewDm);
    };
  }, [isConnected, conversation.id, socketRef]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    socketRef.current?.emit("send:dm", {
      conversationId: conversation.id,
      body: newMessage.trim(),
    });
    // Optimistic local message
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      senderId: currentUserId,
      body: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, optimistic]);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
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
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoading && (
            <p className="text-center text-sm text-muted-foreground">
              Loading messages…
            </p>
          )}
          {localMessages.map((message) => {
            const isMine = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn("flex", isMine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    isMine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm">{message.body}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      isMine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border bg-background p-4">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-full"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleSend}
            disabled={!newMessage.trim()}
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
    setSelectedConversation(conv);
    router.push(`/dashboard/messages?chat=${conv.id}`);
  };

  const handleBack = () => {
    setSelectedConversation(null);
    router.push("/dashboard/messages");
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
            <Button onClick={() => router.push("/dashboard/events")}>
              Discover Events
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredConversations.length > 0 && (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={cn(
                  "cursor-pointer transition-all hover:bg-muted/50",
                  conversation.unreadCount > 0 && "border-primary/30 bg-primary/5"
                )}
                onClick={() => handleSelectConversation(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.participant.avatarUrl} />
                        <AvatarFallback>
                          {conversation.participant.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground truncate">
                          {conversation.participant.username}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.body}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Messages;
