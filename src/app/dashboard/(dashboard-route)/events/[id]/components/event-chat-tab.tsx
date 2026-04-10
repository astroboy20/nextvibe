/* eslint-disable @next/next/no-img-element */
"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Image as ImageIcon, 
  Smile,
  MapPin,
} from "lucide-react";

interface Message {
  id: string;
  author: {
    name: string;
    avatar: string;
    isOrganizer?: boolean;
  };
  content: string;
  timestamp: string;
  type: "text" | "image" | "location";
  imageUrl?: string;
  phase: "pre-event" | "during" | "post-event";
}

const mockMessages: Message[] = [
  {
    id: "1",
    author: { name: "Lagos Events Co.", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face", isOrganizer: true },
    content: "Hey everyone! 🎉 Excited to have you all for Detty December! Drop any questions you have here.",
    timestamp: "2h ago",
    type: "text",
    phase: "pre-event"
  },
  {
    id: "2",
    author: { name: "Chioma", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
    content: "Can't wait! What's the dress code?",
    timestamp: "1h ago",
    type: "text",
    phase: "pre-event"
  },
  {
    id: "3",
    author: { name: "Lagos Events Co.", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face", isOrganizer: true },
    content: "Great question! The theme is Afro-chic. Think bold prints, vibrant colors! 🌍✨",
    timestamp: "1h ago",
    type: "text",
    phase: "pre-event"
  },
  {
    id: "4",
    author: { name: "Tunde", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
    content: "Check out the venue! Looks amazing 🔥",
    timestamp: "45m ago",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop",
    phase: "pre-event"
  },
  {
    id: "5",
    author: { name: "Ngozi", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
    content: "Just parked! Where's the entrance?",
    timestamp: "30m ago",
    type: "text",
    phase: "during"
  },
  {
    id: "6",
    author: { name: "Lagos Events Co.", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face", isOrganizer: true },
    content: "Use Gate 2 on the left side of the building! 🚗",
    timestamp: "28m ago",
    type: "location",
    phase: "during"
  },
];

export function EventChatTab() {
  const [activePhase, setActivePhase] = useState<"pre-event" | "during" | "post-event">("pre-event");
  const [message, setMessage] = useState("");

  const filteredMessages = mockMessages.filter(m => m.phase === activePhase);

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] animate-fade-in">
      {/* Phase Tabs */}
      <Tabs value={activePhase} onValueChange={(v) => setActivePhase(v as any)} className="mb-4">
        <TabsList className="w-full grid grid-cols-3 h-9">
          <TabsTrigger value="pre-event" className="text-xs">Pre-Event</TabsTrigger>
          <TabsTrigger value="during" className="text-xs">During</TabsTrigger>
          <TabsTrigger value="post-event" className="text-xs">Post-Event</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <Send className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">Be the first to start the conversation!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={msg.author.avatar} />
                <AvatarFallback>{msg.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-foreground">{msg.author.name}</span>
                  {msg.author.isOrganizer && (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      Organizer
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                </div>
                
                {msg.type === "text" && (
                  <p className="text-sm text-foreground">{msg.content}</p>
                )}
                
                {msg.type === "image" && (
                  <div>
                    <p className="text-sm text-foreground mb-2">{msg.content}</p>
                    <img 
                      src={msg.imageUrl} 
                      alt=""
                      className="rounded-xl max-w-[250px] w-full"
                    />
                  </div>
                )}
                
                {msg.type === "location" && (
                  <div className="flex items-center gap-2 bg-muted rounded-xl p-3 max-w-[250px]">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                    <p className="text-sm text-foreground">{msg.content}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="flex items-center gap-2 p-3 rounded-2xl border border-border bg-background">
        <Button variant="ghost" size="icon-sm" className="rounded-full flex-shrink-0">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 px-0"
        />
        <Button variant="ghost" size="icon-sm" className="rounded-full flex-shrink-0">
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button size="icon-sm" className="rounded-full flex-shrink-0" disabled={!message.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
