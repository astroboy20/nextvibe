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

const mockEvent = {
  id: "1",
  title: "Detty December 2025",
  date: "Dec 20, 2025",
  time: "8:00 PM",
  location: "Eko Hotel, Lagos",
  image:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
  isLive: true,
  qrCode:
    "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=nextvibe.com/event/1",
};

export default function OrganizerDashboard() {
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

        <Card className="mb-6 overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-accent/5">
          <div className="flex gap-4 p-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
              <Image
                width={96}
                height={96}
                src={mockEvent.image}
                alt={mockEvent.title}
                className="h-full w-full object-cover"
              />
              {mockEvent.isLive && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  <span className="text-[10px] font-semibold text-white">
                    LIVE
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl font-bold text-foreground truncate">
                {mockEvent.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mockEvent.date} • {mockEvent.time}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {mockEvent.location}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-full  border border-[#531342] text-[#531342] hover:bg-[#531342]/10"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  QR
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-full border border-[#531342] text-[#531342] hover:bg-[#531342]/10"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 rounded-full"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4 ">
          {/* RSVP & Tickets Section */}
          <EventDashboardCard
            title="RSVP Tracker"
            icon={<Users className="h-4 w-4" />}
            badge={
              <Badge variant="secondary" className="text-xs bg-[#531342]/10 text-[#531342] font-semibold">
                156 Going
              </Badge>
            }
            defaultOpen={true}
          >
            <RSVPTrackerContent />
          </EventDashboardCard>

          {/* Ticket Management */}
          <EventDashboardCard
            title="Ticket Management"
            icon={<Ticket className="h-4 w-4" />}
            badge={
              <Badge variant="secondary" className="text-xs bg-[#531342]/10 text-[#531342] font-semibold">
                116 Sold
              </Badge>
            }
          >
            <TicketCreatorEnhanced />
          </EventDashboardCard>

          {/* Recent Purchases */}
          <EventDashboardCard
            title="Recent Purchases"
            icon={<ShoppingCart className="h-4 w-4" />}
            badge={
              <Badge className="bg-green-500/10 text-green-600 text-xs">
                ₦125K
              </Badge>
            }
          >
            <RecentPurchasesContent />
          </EventDashboardCard>

          {/* Gamification Hub */}
          <EventDashboardCard
            title="Gamification Hub"
            icon={<Gamepad2 className="h-4 w-4" />}
            badge={
              <Badge className="bg-green-500/10 text-green-600 text-xs">
                2 Live
              </Badge>
            }
          >
            <GamificationHubContent />
          </EventDashboardCard>

          {/* VibeTag Studio */}
          <EventDashboardCard
            title="VibeTag Studio"
            icon={<Tag className="h-4 w-4" />}
            badge={
              <Badge variant="secondary" className="text-xs bg-[#531342]/10 text-[#531342] font-semibold">
                2 Tags
              </Badge>
            }
          >
            <VibeTagStudioContent />
          </EventDashboardCard>

          {/* Postcard Leaderboard */}
          <EventDashboardCard
            title="Postcard Leaderboard"
            icon={<ImageIcon className="h-4 w-4" />}
            badge={
              <Badge variant="secondary" className="text-xs bg-[#531342]/10 text-[#531342] font-semibold">
                32 Posts
              </Badge>
            }
          >
            <PostcardLeaderboardContent />
          </EventDashboardCard>

          {/* Analytics */}
          <EventDashboardCard
            title="Analytics"
            icon={<BarChart3 className="h-4 w-4" />}
            badge={
              <Badge className="bg-green-500/10 text-green-600 text-xs ">
                +12%
              </Badge>
            }
          >
            <AnalyticsPanelContent />
          </EventDashboardCard>

          {/* Payment Module */}
          <PaymentModule />

          {/* Settings Section */}
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
                <span className="text-sm font-medium">Make event private</span>
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
        </div>
      </main>
    </div>
  );
}

// Extracted content components for cleaner organization
