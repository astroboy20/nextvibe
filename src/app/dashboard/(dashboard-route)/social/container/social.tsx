/* eslint-disable @next/next/no-img-element */
"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Share2,
  Search,
  Image,
  Users,
  Calendar,
  MapPin,
  UserPlus,
  Check,
  GalleryHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Postcard {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  imageUrl: string;
  caption: string;
  eventName: string;
  vibeTag: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: Date;
}

interface Attendee {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  eventsAttended: number;
  postcardsCount: number;
  isFollowing: boolean;
  sharedEvents: string[];
}

// Mock postcards data
const mockPostcards: Postcard[] = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "Chioma Okafor",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
      username: "@chioma_vibes",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop",
    caption: "Detty December never disappoints! 🔥 The energy was unmatched",
    eventName: "Detty December 2024",
    vibeTag: "#DettyDecember",
    likes: 234,
    comments: 45,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
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
    imageUrl:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
    caption: "Beach vibes all day! 🌊 Perfect weather for this party",
    eventName: "Beach Vibes Lagos",
    vibeTag: "#BeachVibes",
    likes: 189,
    comments: 32,
    isLiked: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
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
    imageUrl:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop",
    caption: "The rooftop view was everything! 🌆 Best sunset party ever",
    eventName: "Skyline Sunset Party",
    vibeTag: "#SunsetVibes",
    likes: 312,
    comments: 67,
    isLiked: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

// Mock attendees to discover
const mockAttendees: Attendee[] = [
  {
    id: "u1",
    name: "Chioma Okafor",
    username: "@chioma_vibes",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    bio: "Party lover 🎉 | Lagos | Event hopper",
    eventsAttended: 24,
    postcardsCount: 48,
    isFollowing: false,
    sharedEvents: ["Detty December 2024", "Beach Vibes Lagos"],
  },
  {
    id: "u2",
    name: "Tunde Adeyemi",
    username: "@tunde_life",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    bio: "Music enthusiast 🎵 | Concert goer | Afrobeats lover",
    eventsAttended: 32,
    postcardsCount: 65,
    isFollowing: true,
    sharedEvents: ["Beach Vibes Lagos"],
  },
  {
    id: "u3",
    name: "Ngozi Eze",
    username: "@ngozi_party",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    bio: "Vibe curator ✨ | Event photographer | Lagos nights",
    eventsAttended: 56,
    postcardsCount: 120,
    isFollowing: false,
    sharedEvents: ["Detty December 2024"],
  },
];

const Social =() =>{
  const [activeTab, setActiveTab] = useState("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [postcards, setPostcards] = useState(mockPostcards);
  const [attendees, setAttendees] = useState(mockAttendees);
  const router = useRouter();

  const handleLike = (postId: string) => {
    setPostcards((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  };

  const handleFollow = (userId: string) => {
    setAttendees((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          return { ...user, isFollowing: !user.isFollowing };
        }
        return user;
      })
    );
  };

  const filteredAttendees = attendees.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container px-4 py-4">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Social
          </h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 h-10">
              <TabsTrigger value="feed" className="gap-2">
                <GalleryHorizontal className="h-4 w-4" />
                Postcards
              </TabsTrigger>
              <TabsTrigger value="people" className="gap-2">
                <Users className="h-4 w-4" />
                People
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container px-4 py-4">
        {activeTab === "feed" ? (
          // Postcards Feed
          <div className="space-y-4">
            {postcards.map((postcard) => (
              <Card key={postcard.id} className="overflow-hidden">
                {/* User Header */}
                <div className="flex items-center gap-3 p-4 pb-2">
                  <Avatar
                    className="h-10 w-10 cursor-pointer"
                    onClick={() => router.push(`/user/${postcard.user.id}`)}
                  >
                    <AvatarImage src={postcard.user.avatar} />
                    <AvatarFallback>{postcard.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {postcard.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {postcard.user.username}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/messages?chat=${postcard.user.id}`)
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>

                {/* Image */}
                <div className="relative aspect-square">
                  <img
                    src={postcard.imageUrl}
                    alt={postcard.caption}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-black/50 text-white border-0">
                    {postcard.vibeTag}
                  </Badge>
                </div>

                {/* Actions */}
                <CardContent className="p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <button
                      onClick={() => handleLike(postcard.id)}
                      className="flex items-center gap-1.5 text-sm"
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5 transition-all",
                          postcard.isLiked
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="font-medium">{postcard.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MessageCircle className="h-5 w-5" />
                      <span>{postcard.comments}</span>
                    </button>
                    <button className="ml-auto text-muted-foreground">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-sm mb-2">
                    <span className="font-semibold">
                      {postcard.user.username}
                    </span>{" "}
                    {postcard.caption}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{postcard.eventName}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // People Discovery
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search attendees..."
                className="pl-10 rounded-full"
              />
            </div>

            {/* Suggested Connections */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                People You Might Know
              </h3>
              <div className="space-y-3">
                {filteredAttendees.map((attendee) => (
                  <Card key={attendee.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar
                          className="h-12 w-12 cursor-pointer"
                          onClick={() => router.push(`/user/${attendee.id}`)}
                        >
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm truncate">
                              {attendee.name}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {attendee.username}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                            {attendee.bio}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {attendee.eventsAttended} events
                            </span>
                            <span className="flex items-center gap-1">
                              <Image className="h-3 w-3" />
                              {attendee.postcardsCount} postcards
                            </span>
                          </div>
                          {attendee.sharedEvents.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span className="text-xs text-primary">
                                {attendee.sharedEvents.length} shared event
                                {attendee.sharedEvents.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant={
                              attendee.isFollowing ? "outline" : "default"
                            }
                            className="gap-1"
                            onClick={() => handleFollow(attendee.id)}
                          >
                            {attendee.isFollowing ? (
                              <>
                                <Check className="h-3 w-3" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3" />
                                Follow
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              router.push(`/messages?chat=${attendee.id}`)
                            }
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Social