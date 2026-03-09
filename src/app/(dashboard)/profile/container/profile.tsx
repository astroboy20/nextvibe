/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Image as ImageIcon,
  Trophy,
  Gift,
  Settings,
  Share2,
  MapPin,
  Gamepad2,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  Ticket,
  Crown,
  Medal,
  Heart,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { RoleToggle } from "../../components/role-toggle";
import { MyTickets } from "../../components/my-tickets";
import BottomNav from "@/components/navbar/bottom-navbar";

const userEvents = [
  {
    id: "1",
    title: "Japan Group Trip",
    date: "Jan 2, 2026",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=200&fit=crop",
    status: "going" as const,
  },
  {
    id: "2",
    title: "Detty December 1",
    date: "Dec 20, 2025",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop",
    status: "maybe" as const,
  },
  {
    id: "3",
    title: "Tech Summit 2025",
    date: "Mar 15, 2025",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop",
    status: "going" as const,
  },
];

const userPostcards = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=400&fit=crop",
    likes: 42,
    views: 156,
    engagementRate: 26.9,
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=400&fit=crop",
    likes: 28,
    views: 98,
    engagementRate: 28.6,
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=400&fit=crop",
    likes: 56,
    views: 234,
    engagementRate: 23.9,
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&h=400&fit=crop",
    likes: 19,
    views: 67,
    engagementRate: 28.4,
  },
];

const userGameHistory = [
  {
    id: "1",
    game: "Birthday Trivia",
    score: 850,
    rank: 3,
    totalPlayers: 42,
    event: "Birthday Bash",
    date: "Jan 15, 2026",
  },
  {
    id: "2",
    game: "Music Quiz",
    score: 720,
    rank: 5,
    totalPlayers: 38,
    event: "Detty December",
    date: "Dec 22, 2025",
  },
  {
    id: "3",
    game: "Travel Bingo",
    score: 1200,
    rank: 1,
    totalPlayers: 25,
    event: "Japan Group Trip",
    date: "Jan 3, 2026",
  },
  {
    id: "4",
    game: "This or That",
    score: 450,
    rank: 8,
    totalPlayers: 50,
    event: "Tech Summit",
    date: "Mar 16, 2025",
  },
];

const userLeaderboardPositions = [
  { event: "Japan Group Trip", rank: 1, totalScore: 3250, badge: "champion" },
  { event: "Birthday Bash", rank: 3, totalScore: 2100, badge: "top5" },
  { event: "Detty December", rank: 5, totalScore: 1850, badge: "top10" },
];

const userRewards = [
  {
    id: "1",
    title: "20% Off TechMart",
    brand: "TechMart",
    claimed: false,
    expires: "Feb 28, 2025",
    source: "Birthday Trivia - 3rd Place",
  },
  {
    id: "2",
    title: "Free Coffee",
    brand: "CaféBlend",
    claimed: true,
    expires: "Jan 15, 2025",
    source: "Travel Bingo - 1st Place",
  },
  {
    id: "3",
    title: "VIP Access Pass",
    brand: "NextVibe",
    claimed: false,
    expires: "Mar 30, 2025",
    source: "Weekly Challenge",
  },
  {
    id: "4",
    title: "Event Merch Bundle",
    brand: "Detty December",
    claimed: false,
    expires: "Jan 31, 2026",
    source: "Top 10 Leaderboard",
  },
];

const getStatusBadge = (status: "going" | "maybe") => {
  if (status === "going") {
    return (
      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
        Going
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
      Maybe
    </span>
  );
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-4 w-4 text-amber-500" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />;
  return (
    <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
  );
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState("events");

  return (
    <>
      <main className="container px-4 py-6 mx-auto">
        {/* Profile Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 ring-4 ring-primary/20">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face" />
            <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
              NV
            </AvatarFallback>
          </Avatar>

          <h1 className="mt-4 font-display text-2xl font-bold">Nina Vibe</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Lagos, Nigeria
          </p>

          {/* Stats */}
          <div className="mt-6 flex gap-8">
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-foreground">
                12
              </p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-foreground">
                48
              </p>
              <p className="text-xs text-muted-foreground">Postcards</p>
            </div>
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-foreground">
                5
              </p>
              <p className="text-xs text-muted-foreground">Rewards</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Link href="/profile/edit">
              <Button size="sm" className="gap-2 rounded-full">
                Edit Profile
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2 rounded-full">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-6 space-y-3">
          {/* Role Toggle Compact */}
          <RoleToggle compact />

          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard">
              <Card className="overflow-hidden border-primary/20 bg-linear-to-br from-primary/10 to-accent/10 hover:shadow-card transition-all">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      Organizer Dashboard
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Manage your events
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/rewards">
              <Card className="overflow-hidden border-accent/20 bg-linear-to-br from-accent/10 to-primary/10 hover:shadow-card transition-all">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      Rewards Center
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Claim your prizes
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start gap-1 bg-transparent p-0 border-b border-border rounded-none overflow-x-auto">
            <TabsTrigger
              value="events"
              className="rounded-none border-b-2 border-transparent px-3 pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Calendar className="mr-1.5 h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger
              value="tickets"
              className="rounded-none border-b-2 border-transparent px-3 pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Ticket className="mr-1.5 h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="postcards"
              className="rounded-none border-b-2 border-transparent px-3 pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <ImageIcon className="mr-1.5 h-4 w-4" />
              Postcards
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent px-3 pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Gamepad2 className="mr-1.5 h-4 w-4" />
              Games
            </TabsTrigger>
            <TabsTrigger
              value="leaderboards"
              className="rounded-none border-b-2 border-transparent px-3 pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Trophy className="mr-1.5 h-4 w-4" />
              Rankings
            </TabsTrigger>
            <TabsTrigger
              value="rewards"
              className="rounded-none border-b-2 border-transparent px-3 pb-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Gift className="mr-1.5 h-4 w-4" />
              Rewards
            </TabsTrigger>
          </TabsList>

          {/* My Events Tab */}
          <TabsContent value="events" className="mt-6">
            <div className="space-y-3">
              {userEvents.map((event, index) => (
                <Link href={`/event/${event.id}`} key={event.id}>
                  <div
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-card animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {event.title}
                        </h3>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.date}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="mt-6">
            <MyTickets isOrganizer={false} />
          </TabsContent>

          {/* Postcards Tab */}
          <TabsContent value="postcards" className="mt-6">
            <div className="grid grid-cols-2 gap-3">
              {userPostcards.map((postcard, index) => (
                <div
                  key={postcard.id}
                  className="group relative aspect-3/4 overflow-hidden rounded-2xl animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={postcard.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">
                            {postcard.likes}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">{postcard.views}</span>
                        </div>
                      </div>
                      <Badge className="bg-white/20 text-white text-xs">
                        {postcard.engagementRate}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Games History Tab */}
          <TabsContent value="activity" className="mt-6">
            <div className="space-y-3">
              {userGameHistory.map((game, index) => (
                <Card
                  key={game.id}
                  className="overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl",
                          game.rank === 1
                            ? "bg-amber-500/10"
                            : game.rank <= 3
                            ? "bg-primary/10"
                            : "bg-muted"
                        )}
                      >
                        {getRankIcon(game.rank)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {game.game}
                          </h3>
                          {game.rank === 1 && (
                            <Badge className="bg-amber-500/10 text-amber-600">
                              Winner!
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {game.event}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {game.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-bold text-foreground">
                          {game.score.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{game.rank} of {game.totalPlayers}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboards Tab */}
          <TabsContent value="leaderboards" className="mt-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Your Event Rankings
              </h3>
              {userLeaderboardPositions.map((position, index) => (
                <Card
                  key={index}
                  className={cn(
                    "overflow-hidden animate-fade-in",
                    position.rank === 1 && "border-amber-500/30 bg-amber-500/5"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-full",
                          position.rank === 1
                            ? "bg-linear-to-br from-amber-400 to-amber-600"
                            : position.rank === 2
                            ? "bg-linear-to-br from-gray-300 to-gray-500"
                            : position.rank === 3
                            ? "bg-linear-to-br from-amber-600 to-amber-800"
                            : "bg-muted"
                        )}
                      >
                        {position.rank === 1 ? (
                          <Crown className="h-7 w-7 text-white" />
                        ) : position.rank <= 3 ? (
                          <Medal className="h-7 w-7 text-white" />
                        ) : (
                          <span className="text-lg font-bold text-muted-foreground">
                            #{position.rank}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">
                          {position.event}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {position.badge === "champion"
                              ? "🏆 Champion"
                              : position.badge === "top5"
                              ? "⭐ Top 5"
                              : "🎯 Top 10"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-foreground">
                          {position.totalScore.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Points
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="mt-6">
            <div className="space-y-3">
              {userRewards.map((reward, index) => (
                <Card
                  key={reward.id}
                  className={cn(
                    "overflow-hidden transition-all animate-fade-in",
                    reward.claimed
                      ? "border-border bg-muted/30 opacity-60"
                      : "border-primary/20 bg-primary/5"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-accent">
                        <Gift className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {reward.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {reward.brand} • Expires {reward.expires}
                        </p>
                        <p className="text-xs text-primary mt-0.5">
                          Won from: {reward.source}
                        </p>
                      </div>
                      <Button
                        variant={reward.claimed ? "secondary" : "default"}
                        size="sm"
                        className="rounded-full"
                        disabled={reward.claimed}
                      >
                        {reward.claimed ? "Claimed" : "Claim"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </>
  );
};
export default Profile;
