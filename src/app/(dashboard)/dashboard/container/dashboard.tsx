"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Gamepad2, 
  Tag, 
  CreditCard, 
  BarChart3,
  QrCode,
  Share2,
  ExternalLink,
  Ticket,
  Image as ImageIcon,
  Settings,
  ShoppingCart
} from "lucide-react";
import { EventDashboardCard } from "../../components/event-dashboard-card";
import { GamificationHubContent } from "../../components/gamification-hub-content";
import { PaymentModule } from "../../components/payment-moudle";
import { RecentPurchasesContent } from "../../components/recent-purchases-content";
import { RSVPTrackerContent } from "../../components/rsvp-tracker-content";
import { TicketCreatorEnhanced } from "../../components/tracker-creator-enhanced";


const mockEvent = {
  id: "1",
  title: "Detty December 2025",
  date: "Dec 20, 2025",
  time: "8:00 PM",
  location: "Eko Hotel, Lagos",
  image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
  isLive: true,
  qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=nextvibe.com/event/1",
};

export default function OrganizerDashboard() {
  return (
    <div className="min-h-screen bg-background pb-24">

      <main className="container px-4 py-6">
        {/* Event Preview Card */}
        <Card className="mb-6 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex gap-4 p-4">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl">
              <img 
                src={mockEvent.image} 
                alt={mockEvent.title}
                className="h-full w-full object-cover"
              />
              {mockEvent.isLive && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  <span className="text-[10px] font-semibold text-white">LIVE</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl font-bold text-foreground truncate">{mockEvent.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{mockEvent.date} • {mockEvent.time}</p>
              <p className="text-sm text-muted-foreground truncate">{mockEvent.location}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full">
                  <QrCode className="h-3.5 w-3.5" />
                  QR
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1.5 rounded-full">
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Dashboard Modules - Collapsible Cards */}
        <div className="space-y-4">
          {/* RSVP & Tickets Section */}
          <EventDashboardCard 
            title="RSVP Tracker" 
            icon={<Users className="h-4 w-4" />}
            badge={<Badge variant="secondary" className="text-xs">156 Going</Badge>}
            defaultOpen={true}
          >
            <RSVPTrackerContent />
          </EventDashboardCard>

          {/* Ticket Management */}
          <EventDashboardCard 
            title="Ticket Management" 
            icon={<Ticket className="h-4 w-4" />}
            badge={<Badge variant="secondary" className="text-xs">116 Sold</Badge>}
          >
            <TicketCreatorEnhanced />
          </EventDashboardCard>

          {/* Recent Purchases */}
          <EventDashboardCard 
            title="Recent Purchases" 
            icon={<ShoppingCart className="h-4 w-4" />}
            badge={<Badge className="bg-green-500/10 text-green-600 text-xs">₦125K</Badge>}
          >
            <RecentPurchasesContent />
          </EventDashboardCard>

          {/* Gamification Hub */}
          <EventDashboardCard 
            title="Gamification Hub" 
            icon={<Gamepad2 className="h-4 w-4" />}
            badge={<Badge className="bg-green-500/10 text-green-600 text-xs">2 Live</Badge>}
          >
            <GamificationHubContent />
          </EventDashboardCard>

          {/* VibeTag Studio */}
          <EventDashboardCard 
            title="VibeTag Studio" 
            icon={<Tag className="h-4 w-4" />}
            badge={<Badge variant="secondary" className="text-xs">2 Tags</Badge>}
          >
            <VibeTagStudioContent />
          </EventDashboardCard>

          {/* Postcard Leaderboard */}
          <EventDashboardCard 
            title="Postcard Leaderboard" 
            icon={<ImageIcon className="h-4 w-4" />}
            badge={<Badge variant="secondary" className="text-xs">32 Posts</Badge>}
          >
            <PostcardLeaderboardContent />
          </EventDashboardCard>

          {/* Analytics */}
          <EventDashboardCard 
            title="Analytics" 
            icon={<BarChart3 className="h-4 w-4" />}
            badge={<Badge className="bg-green-500/10 text-green-600 text-xs">+12%</Badge>}
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
                <span className="text-sm font-medium">Send reminder on event day</span>
                <Button variant="outline" size="sm" className="h-7 rounded-full">Enable</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-sm font-medium">Make event private</span>
                <Button variant="outline" size="sm" className="h-7 rounded-full">Configure</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl">Edit Event</Button>
                <Button variant="outline" className="flex-1 rounded-xl">Add Co-Hosts</Button>
              </div>
            </div>
          </EventDashboardCard>
        </div>
      </main>

    </div>
  );
}

// Extracted content components for cleaner organization
function VibeTagStudioContent() {
  const [vibeTags] = useState([
    { id: "1", name: "Detty December Vibes", phase: "main-event", template: "gradient", postcardCount: 24 },
    { id: "2", name: "Countdown Memories", phase: "pre-event", template: "polaroid", postcardCount: 8 },
  ]);

  const templatePreviews: Record<string, string> = {
    classic: "bg-gradient-to-br from-primary/20 to-accent/20",
    polaroid: "bg-white border-4 border-b-8",
    minimal: "bg-muted",
    gradient: "bg-gradient-to-br from-primary via-accent to-primary",
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case "pre-event":
        return <Badge variant="outline" className="border-amber-500/50 text-amber-600">Pre-Event</Badge>;
      case "main-event":
        return <Badge variant="outline" className="border-primary/50 text-primary">Main Event</Badge>;
      case "both":
        return <Badge variant="outline" className="border-accent/50 text-accent-foreground">Both</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <Button size="sm" className="w-full gap-1.5 rounded-xl mb-4">
        <Tag className="h-3.5 w-3.5" />
        Create VibeTag
      </Button>
      {vibeTags.map((tag) => (
        <div 
          key={tag.id}
          className="flex items-center gap-3 rounded-xl border border-border p-3"
        >
          <div className={`h-12 w-10 rounded-lg flex-shrink-0 ${templatePreviews[tag.template]}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm truncate">{tag.name}</h4>
              {getPhaseBadge(tag.phase)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {tag.postcardCount} postcards created
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostcardLeaderboardContent() {
  const leaders = [
    { id: "1", username: "@chioma_vibes", likes: 156, engagement: 89 },
    { id: "2", username: "@tunde_life", likes: 134, engagement: 76 },
    { id: "3", username: "@ngozi_party", likes: 98, engagement: 62 },
  ];

  return (
    <div className="space-y-2">
      {leaders.map((leader, index) => (
        <div 
          key={leader.id}
          className={`flex items-center justify-between rounded-lg p-2 ${index === 0 ? "bg-amber-500/10" : ""}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground w-4">{index + 1}</span>
            <span className="text-sm font-medium">{leader.username}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold">{leader.likes} ❤️</span>
            <p className="text-[10px] text-muted-foreground">{leader.engagement}% engage</p>
          </div>
        </div>
      ))}
      <button className="mt-2 w-full text-center text-xs font-medium text-primary hover:underline">
        View Full Leaderboard
      </button>
    </div>
  );
}

function AnalyticsPanelContent() {
  const metrics = [
    { label: "Total Views", value: "1,245", change: "+12%" },
    { label: "Postcards Created", value: "32", change: "+8" },
    { label: "Game Plays", value: "156", change: "+24" },
    { label: "Engagement Rate", value: "68%", change: "+5%" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div 
          key={metric.label}
          className="rounded-xl bg-muted/50 p-3"
        >
          <span className="text-[11px] text-muted-foreground">{metric.label}</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-xl font-bold">{metric.value}</span>
            <span className="text-[10px] font-medium text-green-600">{metric.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
