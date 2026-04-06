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
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/navbar/bottom-navbar";

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  sharedEvent?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

// Mock data for demo
const mockConversations: Conversation[] = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "Chioma Okafor",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      username: "@chioma_vibes",
    },
    lastMessage: "See you at the event tomorrow! 🎉",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    sharedEvent: "Detty December 2024",
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "Tunde Adeyemi",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      username: "@tunde_life",
    },
    lastMessage: "That postcard was amazing!",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
  },
  {
    id: "3",
    user: {
      id: "u3",
      name: "Ngozi Eze",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      username: "@ngozi_party",
    },
    lastMessage: "Are you going to the beach party?",
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
    sharedEvent: "Beach Vibes Lagos",
  },
];

const mockMessages: Message[] = [
  {
    id: "m1",
    senderId: "u1",
    content: "Hey! I saw you're going to Detty December too!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "m2",
    senderId: "you",
    content: "Yes! It's going to be amazing 🔥",
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
  },
  {
    id: "m3",
    senderId: "u1",
    content: "We should definitely link up at the event!",
    timestamp: new Date(Date.now() - 1000 * 60 * 50),
  },
  {
    id: "m4",
    senderId: "you",
    content: "For sure! I'll be wearing a blue jacket",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "m5",
    senderId: "u1",
    content: "Perfect! I'll find you. Can't wait!",
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
  },
  {
    id: "m6",
    senderId: "u1",
    content: "See you at the event tomorrow! 🎉",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
];

function formatTime(date: Date): string {
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

const Messages = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      const conversation = mockConversations.find((c) => c.id === chatId);
      if (conversation) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedConversation(conversation);
        setMessages(mockMessages);
      }
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `m${Date.now()}`,
      senderId: "you",
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const filteredConversations = mockConversations.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show chat view
  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
          <div className="container flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => {
                setSelectedConversation(null);
                router.push("/messages");
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.user.avatar} />
              <AvatarFallback>
                {selectedConversation.user.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-semibold text-foreground">
                {selectedConversation.user.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {selectedConversation.user.username}
              </p>
            </div>
          </div>

          {selectedConversation.sharedEvent && (
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Both attending: {selectedConversation.sharedEvent}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Meetup suggestion */}
            <div className="flex justify-center">
              <div className="flex items-center gap-2 rounded-full bg-accent/50 px-4 py-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                Plan to meet up at the event!
              </div>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.senderId === "you" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.senderId === "you"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.senderId === "you"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              size="icon"
              className="rounded-full"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show conversations list
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
                {mockConversations.length}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="container px-4 py-4">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              No conversations yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other attendees at events!
            </p>
            <Button onClick={() => router.push("/discover")}>
              Discover Events
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={cn(
                  "cursor-pointer transition-all hover:bg-muted/50",
                  conversation.unreadCount > 0 &&
                    "border-primary/30 bg-primary/5"
                )}
                onClick={() => {
                  setSelectedConversation(conversation);
                  setMessages(mockMessages);
                  router.push(`/messages?chat=${conversation.id}`);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.user.avatar} />
                        <AvatarFallback>
                          {conversation.user.name[0]}
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
                          {conversation.user.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      {conversation.sharedEvent && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary">
                            {conversation.sharedEvent}
                          </span>
                        </div>
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
