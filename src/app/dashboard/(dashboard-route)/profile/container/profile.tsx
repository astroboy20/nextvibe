/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Image as ImageIcon,
  Settings,
  MapPin,
  ChevronRight,
  Ticket,
  Heart,
  Eye,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import BottomNav from "@/components/navbar/bottom-navbar";
import {
  useGetUserQuery,
  useGetUserBasicQuery,
  useGetUserActivityQuery,
} from "@/app/provider/api/authApi";

// Type definitions — matched to real API response shapes
interface ActivityEvent {
  id: string;
  name: string;
  flierUrl?: string;
  startsAt: string;
  status: string;
  locationName?: string;
  category?: string;
  mode?: string;
}

interface Postcard {
  id: string;
  image: string;
  likes?: number;
  views?: number;
  engagementRate?: number;
}

interface ActivityTicket {
  id: string;
  eventName?: string;
  ticketType?: string;
  date?: string;
  ticketNumber?: string;
  status?: string;
}

const tabList = [
  {
    id: 1,
    title: "Events",
    icon: <Calendar className="mr-1.5 h-4 w-4" />,
    value: "events",
  },
  {
    id: 2,
    title: "Tickets",
    icon: <Ticket className="mr-1.5 h-4 w-4" />,
    value: "tickets",
  },
  {
    id: 3,
    title: "Postcards",
    icon: <ImageIcon className="mr-1.5 h-4 w-4" />,
    value: "postcards",
  },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("events");
  const { data: currentUser, isLoading: isLoadingUser } = useGetUserQuery();
  const userId = currentUser?.data?.id;

  // Fetch basic user information
  const { data: userBasic, isLoading: isLoadingBasic } = useGetUserBasicQuery(
    userId,
    {
      skip: !userId,
    }
  );

  // Fetch user activity (events, postcards, games, etc.)
  const { data: userActivity, isLoading: isLoadingActivity } =
    useGetUserActivityQuery(userId, {
      skip: !userId,
    });

  const profile = userBasic?.data;
  const activity = userActivity?.data;

  // Overall loading state
  const isLoading = isLoadingUser || isLoadingBasic || isLoadingActivity;

  return (
    <>
      <main className="container px-4 py-6 mx-auto">
        {/* Loading State */}
        {isLoading ? (
          <div className="animate-fade-in">
            {/* Avatar skeleton */}
            <div className="mb-6 flex flex-col items-center text-center gap-3">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-28" />
              {/* Stats skeleton */}
              <div className="mt-2 flex gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <Skeleton className="h-7 w-10" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
              {/* Buttons skeleton */}
              <div className="mt-2 flex gap-3">
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
            {/* Quick link skeleton */}
            <Skeleton className="h-16 w-full rounded-2xl mb-6" />
            {/* Tabs skeleton */}
            <div className="flex gap-2 border-b pb-2 mb-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded" />
              ))}
            </div>
            {/* Content skeleton */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl border border-border p-4"
                >
                  <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="mb-6 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage
                  src={profile?.avatar || currentUser?.data?.avatar}
                />
                <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                  {(profile?.displayName || currentUser?.data?.name)
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <h1 className="mt-4 font-display text-2xl font-bold">
                {profile?.displayName || currentUser?.data?.name || "User"}
              </h1>

              {/* Stats */}
              <div className="mt-6 flex gap-8">
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {activity?.events?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {activity?.postcards?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Postcards</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {activity?.tickets?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Tickets</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Link href="/profile/edit">
                  <Button
                    size="sm"
                    className="gap-2 rounded-full  bg-[#531342]"
                  >
                    Edit Profile
                  </Button>
                </Link>
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full text-[#531342] border-2 border-[#531342]"
                >
                  <Share2 className="h-4 w-4 text-[#531342]" />
                  Share
                </Button> */}
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="h-5 w-5 text-primary" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <Link href="/dashboard">
                  <Card className="overflow-hidden border-[#4d143d]/20 bg-linear-to-br from-[#4d143d]/10 to-accent/10 hover:shadow-card transition-all">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4d143d]/20">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-2l">
                          Dashboard
                        </h3>
                        <p className="text-base ">Manage your events</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full h-fit! justify-start gap-1 bg-transparent p-0 border-b rounded-none overflow-x-auto overflow-y-hidden no-scrollbar">
                {tabList.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.value}
                    className="rounded-none border-b-2 shadow-none! px-3 pb-3 data-[state=active]:border-b-[#531342] data-[state=active]:bg-transparent"
                  >
                    {tab.icon}
                    {tab.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* My Events Tab */}
              <TabsContent value="events" className="mt-6">
                <div className="space-y-3">
                  {isLoadingActivity ? (
                    <p className="text-center text-muted-foreground">
                      Loading events...
                    </p>
                  ) : activity?.events && activity.events.length > 0 ? (
                    (activity.events as ActivityEvent[]).map((event, index) => (
                      <Link
                        href={`/events/${event.id}`}
                        key={event.id}
                      >
                        <div
                          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-card animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <img
                            src={
                              event.flierUrl ||
                              "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=200&h=200&fit=crop"
                            }
                            alt={event.name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground truncate">
                                {event.name}
                              </h3>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                                  event.status === "PUBLISHED"
                                    ? "bg-green-500/10 text-green-600"
                                    : event.status === "DRAFT"
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {event.status}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {new Date(event.startsAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                            {event.locationName && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {event.locationName}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No events yet
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Postcards Tab */}
              <TabsContent value="postcards" className="mt-6">
                <div className="grid grid-cols-2 gap-3">
                  {isLoadingActivity ? (
                    <p className="col-span-2 text-center text-muted-foreground">
                      Loading postcards...
                    </p>
                  ) : activity?.postcards && activity.postcards.length > 0 ? (
                    (activity.postcards as Postcard[]).map(
                      (postcard, index) => (
                        <div
                          key={postcard.id}
                          className="group relative aspect-3/4 overflow-hidden rounded-2xl animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <img
                            src={
                              postcard.image ||
                              "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=400&fit=crop"
                            }
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
                                    {postcard.likes || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span className="text-sm">
                                    {postcard.views || 0}
                                  </span>
                                </div>
                              </div>
                              {postcard.engagementRate && (
                                <Badge className="bg-white/20 text-white text-xs">
                                  {postcard.engagementRate}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <p className="col-span-2 text-center text-muted-foreground py-8">
                      No postcards yet
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Tickets Tab */}
              <TabsContent value="tickets" className="mt-6">
                <div className="space-y-3">
                  {isLoadingActivity ? (
                    <p className="text-center text-muted-foreground">
                      Loading tickets...
                    </p>
                  ) : activity?.tickets && activity.tickets.length > 0 ? (
                    (activity.tickets as ActivityTicket[]).map(
                      (ticket, index) => (
                        <Card
                          key={ticket.id}
                          className="overflow-hidden animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Ticket className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground">
                                  {ticket.eventName}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {ticket.ticketType}
                                  {ticket.date &&
                                    ` • ${new Date(
                                      ticket.date
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}`}
                                </p>
                                {ticket.ticketNumber && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    #{ticket.ticketNumber}
                                  </p>
                                )}
                              </div>
                              {ticket.status && (
                                <Badge
                                  variant={
                                    ticket.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {ticket.status}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    )
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No tickets yet
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
};
export default Profile;
