"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { useGetUserQuery } from "@/app/provider/api/userApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import Cookies from "js-cookie";
import { useWebSocket } from "@/hooks/useWebSocket";

type Section = "pre-event" | "during" | "post-event";

interface ChatMessage {
  id: string;
  body?: string;
  content?: string;
  text?: string;
  sender?: {
    id?: string;
    displayName?: string;
    username?: string;
    avatarUrl?: string;
    role?: string;
  };
  senderId?: string;
  createdAt?: string;
  isOrganizer?: boolean;
}

interface EventChatTabProps {
  eventId: string;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "")
  .trim()
  .replace(/\/$/, "");

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

function msgText(msg: ChatMessage) {
  return msg.body ?? msg.content ?? msg.text ?? "";
}

export function EventChatTab({ eventId }: EventChatTabProps) {
  const [activeSection, setActiveSection] = useState<Section>("pre-event");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: meData } = useGetUserQuery();
  const myId = meData?.data?.id;
  const token = Cookies.get("accessToken");

  // WebSocket connection using the custom hook
  const { status: wsStatus, send: wsSend, isConnected } = useWebSocket({
    url: `/messaging`,
    onMessage: (data) => {
      // Handle joined confirmation
      if (data.event === "joined:event-chat" || data.type === "joined:event-chat") {
        console.log("Joined event chat room:", data);
        return;
      }

      // Handle new messages
      if (data.event === "new:event-chat" || data.type === "new:event-chat") {
        const messageData = data.data || data;
        if (!messageData?.id && !messageData?.body && !messageData?.content) return;
        
        // Cast to ChatMessage
        const chatMessage: ChatMessage = {
          id: messageData.id || String(Date.now()),
          body: messageData.body,
          content: messageData.content,
          text: messageData.text,
          sender: messageData.sender,
          senderId: messageData.senderId,
          createdAt: messageData.createdAt,
          isOrganizer: messageData.isOrganizer,
        };
        
        setMessages((prev) => {
          // Avoid duplicates
          if (chatMessage.id && prev.some((m) => m.id === chatMessage.id)) return prev;
          return [...prev, chatMessage];
        });
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    },
    onOpen: () => {
      console.log("WebSocket connected, joining", activeSection);
      // Join the event chat room
      wsSend({
        event: "join:event-chat",
        data: {
          eventId,
          section: activeSection,
        },
      });
    },
    onClose: () => {
      console.log("WebSocket disconnected from", activeSection);
    },
    onError: (error) => {
      console.error("WebSocket error:", error);
    },
    autoReconnect: true,
    reconnectInterval: 3000,
    enabled: !!eventId && !!token,
  });

  const fetchHistory = useCallback(
    async (section: Section) => {
      if (!eventId) return;
      setIsLoadingHistory(true);
      try {
        const res = await fetch(
          `${API_BASE}/v1/events/${eventId}/chat/${section}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const errorMessage = errorData?.error?.message || errorData?.message || "Failed to load chat history";
          toast.error(errorMessage);
          setMessages([]);
          return;
        }
        
        const json = await res.json();
        setMessages(json?.data ?? []);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
        toast.error("Failed to load chat history");
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [eventId, token]
  );

  // Fetch history when section changes
  useEffect(() => {
    setMessages([]);
    fetchHistory(activeSection);
  }, [activeSection, fetchHistory]);

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;

    if (isConnected) {
      // Send message using the correct event format
      wsSend({
        event: "send:event-chat",
        data: {
          eventId,
          section: activeSection,
          body: text,
        },
      });
      setMessage("");
    } else {
      toast.error("Not connected. Reconnecting...");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Tabs
          value={activeSection}
          onValueChange={(v) => setActiveSection(v as Section)}
          className="flex-1"
        >
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="pre-event" className="text-xs">
              Pre-Event
            </TabsTrigger>
            <TabsTrigger value="during" className="text-xs">
              During
            </TabsTrigger>
            <TabsTrigger value="post-event" className="text-xs">
              Post-Event
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender?.id === myId || msg.senderId === myId;
            const senderName =
              msg.sender?.displayName ?? msg.sender?.username ?? "User";
            const avatarUrl = msg.sender?.avatarUrl ?? "";
            const isOrganizer =
              msg.sender?.role === "ORGANIZER" || msg.isOrganizer;
            const timestamp = formatTime(msg.createdAt);

            return (
              <div
                key={msg.id ?? i}
                className={cn("flex gap-3", isMe && "flex-row-reverse")}
              >
                {!isMe && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "flex flex-col max-w-[75%]",
                    isMe && "items-end"
                  )}
                >
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-xs text-foreground">
                        {senderName}
                      </span>
                      {isOrganizer && (
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          Organizer
                        </span>
                      )}
                      {timestamp && (
                        <span className="text-[10px] text-muted-foreground">
                          {timestamp}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm wrap-break-word",
                      isMe
                        ? "bg-[#531342] text-white rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}
                  >
                    {msgText(msg)}
                  </div>

                  {isMe && timestamp && (
                    <span className="text-[10px] text-muted-foreground mt-1">
                      {timestamp}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 p-3 rounded-2xl border border-border bg-background">
        <Input
          placeholder={
            wsStatus === "open" ? "Type a message..." : "Connecting..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0"
          disabled={!isConnected}
        />
        <Button
          size="icon"
          className="rounded-full shrink-0 bg-[#531342] hover:bg-[#531342]/90"
          disabled={!message.trim() || !isConnected}
          onClick={handleSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

