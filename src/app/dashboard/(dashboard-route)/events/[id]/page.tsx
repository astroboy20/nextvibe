/* eslint-disable @next/next/no-img-element */
"use client"
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Gamepad2,
  Tag,
  MessageCircle,
  Share2,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {  useRouter } from "next/navigation";
import { EventAboutTab } from "./components/event-about-tab";
import { EventRSVPTab } from "./components/event-rsvp-tab";
import { EventQRTab } from "./components/event-qr-tab";
import BottomNav from "@/components/navbar/bottom-navbar";
import { EventChatTab } from "./components/event-chat-tab";
import { EventGamesTab } from "./components/event-game-tab";
import { EventVibeTagsTab } from "./components/event-vibetags-tab";

const mockEvent = {
  id: "1",
  title: "Detty December 2025",
  date: "Dec 20, 2025",
  time: "8:00 PM",
  location: "Eko Hotel, Victoria Island, Lagos",
  image:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
  organizer: {
    name: "Lagos Events Co.",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
  },
  description:
    "Join us for the biggest end-of-year celebration in Lagos! Experience amazing performances, great food, and unforgettable memories.",
  attendees: 156,
  hasGames: true,
  hasVibeTag: true,
};

export default function EventPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("about");
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative h-56 w-full">
        <img
          src={mockEvent.image}
          alt={mockEvent.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Action Buttons */}
        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white"
          >
            <Heart
              className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")}
            />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Event Title Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-2 mb-2">
            {mockEvent.hasGames && (
              <Badge className="bg-accent/90 text-accent-foreground">
                <Gamepad2 className="mr-1 h-3 w-3" />
                Games
              </Badge>
            )}
            {mockEvent.hasVibeTag && (
              <Badge className="bg-primary/90 text-primary-foreground">
                <Tag className="mr-1 h-3 w-3" />
                VibeTag
              </Badge>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            {mockEvent.title}
          </h1>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-20 bg-background border-b border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start gap-0 bg-transparent p-0 h-auto overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="about"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
            >
              About
            </TabsTrigger>
            <TabsTrigger
              value="rsvp"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
            >
              RSVP
            </TabsTrigger>
            <TabsTrigger
              value="qr"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
            >
              <QrCode className="mr-1.5 h-4 w-4" />
              QR
            </TabsTrigger>
            <TabsTrigger
              value="games"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
            >
              <Gamepad2 className="mr-1.5 h-4 w-4" />
              Games
            </TabsTrigger>
            <TabsTrigger
              value="vibetags"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
            >
              <Tag className="mr-1.5 h-4 w-4" />
              VibeTags
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="rounded-none border-b-2 border-transparent px-4 py-3 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
            >
              <MessageCircle className="mr-1.5 h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <div className="container px-4 py-6">
            <TabsContent value="about" className="mt-0">
              <EventAboutTab event={mockEvent} />
            </TabsContent>

            <TabsContent value="rsvp" className="mt-0">
              <EventRSVPTab event={mockEvent} />
            </TabsContent>

            <TabsContent value="qr" className="mt-0">
              <EventQRTab event={mockEvent} />
            </TabsContent>

            <TabsContent value="games" className="mt-0">
              <EventGamesTab />
            </TabsContent>

            <TabsContent value="vibetags" className="mt-0">
              {/* <EventVibeTagsTab /> */}
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <EventChatTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
