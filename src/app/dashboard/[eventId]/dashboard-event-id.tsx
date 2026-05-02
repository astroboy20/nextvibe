"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Gamepad2,
  Tag,
  BarChart3,
  QrCode,
  Share2,
  ExternalLink,
  Ticket,
  Image as ImageIcon,
  Settings,
  ShoppingCart,
  X,
} from "lucide-react";
import { EventDashboardCard } from "./components/event-dashboard-card";
import { RSVPTrackerContent } from "./components/rsvp-tracker-content";
import { TicketCreatorEnhanced } from "./components/tracker-creator-enhanced";
import { RecentPurchasesContent } from "./components/recent-purchases-content";
import { GamificationHubContent } from "./components/gamification-hub-content";
import { PaymentModule } from "./components/payment-module";
import Image from "next/image";
import AnalyticsPanelContent from "./components/analytics-panel";
import VibeTagStudioContent from "./components/vibe-tag-studio";
import PostcardLeaderboardContent from "./components/leaderboard-content";
import { useGetEventDetailsQuery } from "@/app/provider/api/eventApi";
import { formatDate, formatTime } from "@/hooks/format-date";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const mockEvent = {
  id: "1",
  title: "Detty December 2025",
  date: "Dec 20, 2025",
  time: "8:00 PM",
  location: "Eko Hotel, Lagos",
  isLive: true,
};

function EventHeaderSkeleton() {
  return (
    <Card className="mb-6 overflow-hidden border-primary/20">
      <div className="flex gap-4 p-4">
        <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2 min-w-0">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function DashboardCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      {/* Card body */}
      <div className="space-y-3 p-4">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-10 w-2/3 rounded-lg" />
      </div>
    </div>
  );
}

interface OrganizerDashboardProps {
  eventId: string;
}

export default function OrganizerDashboard({
  eventId,
}: OrganizerDashboardProps) {
  const { data: eventDetails, isLoading } = useGetEventDetailsQuery(eventId);
  const [showQR, setShowQR] = useState(false);

  const event = eventDetails?.data;

  const totalTicketsSold = event?.ticketTiers?.reduce(
    (total: number, tier: any) => total + (tier.quantitySold ?? 0),
    0
  ) ?? 0;

  const rsvpCount = event?.attendingCount ?? event?.rsvpCount ?? 0;

  const eventUrl = typeof window !== "undefined"
    ? `${window.location.origin}/dashboard/events/${eventId}`
    : "";

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.name ?? "Event",
          text: "Check out this event",
          url: eventUrl,
        });
      } else {
        await navigator.clipboard.writeText(eventUrl);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // user cancelled — ignore
    }
  };

  useEffect(() => {
    if (event) {
      if (typeof window !== "undefined") {
        localStorage.setItem("eventName", JSON.stringify(event.name));
        localStorage.setItem("eventId", eventId);
      }
    }
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="container px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Dashboard
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage your events, tickets & engagement
            </p>
          </div>
        </div>

        {isLoading ? (
          <EventHeaderSkeleton />
        ) : (
          <Card className="mb-6 overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-accent/5">
            <div className="flex gap-4 p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                {event?.flierUrl ? (
                  <Image
                    width={96}
                    height={96}
                    src={event.flierUrl}
                    alt={event?.name ?? "Event"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-primary/40" />
                  </div>
                )}
                {event?.status === "LIVE" && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    <span className="text-[10px] font-semibold text-white">LIVE</span>
                  </div>
                )}
                {event?.status === "DRAFT" && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-gray-500 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    <span className="text-[10px] font-semibold text-white">DRAFT</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="font-display text-xl font-bold text-foreground truncate">
                  {event?.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDate(event?.startsAt)} • {formatTime(event?.startsAt)}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {event?.locationName}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-full border border-[#531342] text-[#531342] hover:bg-[#531342]/10"
                    onClick={() => setShowQR(true)}
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 rounded-full border border-[#531342] text-[#531342] hover:bg-[#531342]/10"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>
                  <Link
                    href={`/dashboard/events/${eventId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 gap-1.5 rounded-full flex items-center text-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* QR Modal */}
        {showQR && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowQR(false)}
          >
            <div
              className="relative bg-background rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="font-semibold text-foreground">{event?.name}</h3>
              <div className="rounded-xl bg-white p-4 shadow">
                <QRCodeSVG value={eventUrl} size={200} />
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-[220px] break-all">
                {eventUrl}
              </p>
              <Button
                className="w-full rounded-xl"
                onClick={() => {
                  navigator.clipboard.writeText(eventUrl);
                  toast.success("Link copied!");
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <DashboardCardSkeleton />
          ) : (
            <EventDashboardCard
              title="RSVP Tracker"
              icon={<Users className="h-4 w-4" />}
              badge={
                <Badge
                  variant="secondary"
                  className="text-xs bg-[#531342]/10 text-[#531342] font-semibold"
                >
                  {rsvpCount} Going
                </Badge>
              }
              defaultOpen={true}
            >
              <RSVPTrackerContent />
            </EventDashboardCard>
          )}

          {isLoading ? (
            <DashboardCardSkeleton />
          ) : (
            <EventDashboardCard
              title="Ticket Management"
              icon={<Ticket className="h-4 w-4" />}
              badge={
                <Badge className="bg-green-500/10 text-green-600 text-xs">
                  {totalTicketsSold} Sold
                </Badge>
              }
            >
              <TicketCreatorEnhanced
                eventId={eventId}
                eventDetails={event?.ticketTiers}
              />
            </EventDashboardCard>
          )}

          {/* Recent Purchases */}
          {isLoading ? (
            <DashboardCardSkeleton />
          ) : (
            <EventDashboardCard
              title="Recent Purchases"
              icon={<ShoppingCart className="h-4 w-4" />}
              badge={
                <Badge className="bg-green-500/10 text-green-600 text-xs">
                  {event?.totalRevenue ? `₦${(event.totalRevenue / 100).toLocaleString()}` : "₦0"}
                </Badge>
              }
            >
              <RecentPurchasesContent />
            </EventDashboardCard>
          )}

          {isLoading ? (
            <DashboardCardSkeleton />
          ) : (
            <EventDashboardCard
              title="Gamification Hub"
              icon={<Gamepad2 className="h-4 w-4" />}
              badge={
                <Badge className="bg-green-500/10 text-green-600 text-xs">
                  {event?.activeGameSessions ?? 0} Live
                </Badge>
              }
            >
              <GamificationHubContent
                eventId={eventId}
                roundId={event?.rounds?.id}
                eventName={event?.name}
                eventStartsAt={event?.startsAt}
              />
            </EventDashboardCard>
          )}

          {isLoading ? (
            <DashboardCardSkeleton />
          ) : (
            <EventDashboardCard
              title="VibeTag Studio"
              icon={<Tag className="h-4 w-4" />}
              badge={
                <Badge
                  variant="secondary"
                  className="text-xs bg-[#531342]/10 text-[#531342] font-semibold"
                >
                  {event?.vibeTag ? "1 Tag" : "0 Tags"}
                </Badge>
              }
            >
              <VibeTagStudioContent
                eventId={eventId}
                name={event?.name}
                vibeTag={event?.vibeTag ?? null}
              />
            </EventDashboardCard>
          )}

          {isLoading ? (
            <DashboardCardSkeleton />
          ) : (
            <EventDashboardCard
              title="Postcard Leaderboard"
              icon={<ImageIcon className="h-4 w-4" />}
              badge={
                <Badge
                  variant="secondary"
                  className="text-xs bg-[#531342]/10 text-[#531342] font-semibold"
                >
                  {event?.postcardCount ?? 0} Posts
                </Badge>
              }
            >
              <PostcardLeaderboardContent />
            </EventDashboardCard>
          )}

          {isLoading ? (
            <DashboardCardSkeleton />
          ) : (
            <EventDashboardCard
              title="Analytics"
              icon={<BarChart3 className="h-4 w-4" />}
              badge={
                <Badge className="bg-green-500/10 text-green-600 text-xs">
                  +12%
                </Badge>
              }
            >
              <AnalyticsPanelContent />
            </EventDashboardCard>
          )}

          {isLoading ? <DashboardCardSkeleton /> : <PaymentModule />}

          {isLoading ? (
            <DashboardCardSkeleton />
          ) : (
            <EventDashboardCard
              title="Event Settings"
              icon={<Settings className="h-4 w-4" />}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">
                    Send reminder on event day
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full"
                  >
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">
                    Make event private
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-full"
                  >
                    Configure
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl">
                    Edit Event
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl">
                    Add Co-Hosts
                  </Button>
                </div>
              </div>
            </EventDashboardCard>
          )}
        </div>
      </main>
    </div>
  );
}
