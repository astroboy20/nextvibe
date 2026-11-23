"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Gamepad2,
  Tag,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  Info,
} from "lucide-react";
import { useGetEventAnalyticsQuery } from "@/features/events/api/analytics-api";
import { useEventPermissions } from "@/features/events/hooks/use-event-permissions";
import { EventRole } from "@/features/events/types";
import { ParticipationModule } from "./participation-module";
import { GamificationModule } from "./gamification-module";
import { VibeTagsModule } from "./vibetags-module";
import { RepeatEngagementModule } from "./repeat-engagement-module";
import { PostcardsModule } from "./postcards-module";
import { RevenueModule } from "./revenue-module";

interface EventAnalyticsDashboardProps {
  eventId: string;
  eventStatus?: string;
  myRole?: EventRole | null;
}

export function EventAnalyticsDashboard({
  eventId,
  eventStatus,
  myRole,
}: EventAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("participation");
  const { data: analytics, isLoading, error } = useGetEventAnalyticsQuery(eventId);
  const permissions = useEventPermissions(myRole);

  // Draft Event Warning
  if (eventStatus === "DRAFT") {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Analytics Preview</AlertTitle>
        <AlertDescription>
          Live metrics will populate after you publish this event. You can
          preview configured games and VibeTags in their respective tabs.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to Load Analytics</AlertTitle>
        <AlertDescription>
          Unable to fetch analytics data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!analytics?.data) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          Analytics data will appear once your event has activity.
        </AlertDescription>
      </Alert>
    );
  }

  const data = analytics.data;

  // Calculate safe metrics with zero-denominator guards
  const safeCheckInRate =
    data.participation?.confirmedRsvps > 0
      ? (data.participation.totalCheckIns / data.participation.confirmedRsvps) *
        100
      : 0;

  const safeGameParticipationRate =
    data.gamification?.totalParticipants > 0
      ? (data.gamification.uniquePlayers /
          data.gamification.totalParticipants) *
        100
      : 0;

  const safeCreatorConversionRate =
    data.postcards?.totalCheckedIn > 0
      ? (data.postcards.uniqueContributors / data.postcards.totalCheckedIn) *
        100
      : 0;

  const safeAvgPostcardsPerContributor =
    data.postcards?.uniqueContributors > 0
      ? data.postcards.totalPostcards / data.postcards.uniqueContributors
      : 0;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full h-fit justify-start gap-1 bg-transparent border-b rounded-none overflow-x-auto overflow-y-hidden">
          <TabsTrigger
            value="participation"
            className="rounded-none border-b-2 data-[state=active]:border-b-primary"
          >
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Participation
          </TabsTrigger>
          <TabsTrigger
            value="gamification"
            className="rounded-none border-b-2 data-[state=active]:border-b-primary"
          >
            <Gamepad2 className="h-4 w-4 mr-1.5" />
            Games
          </TabsTrigger>
          <TabsTrigger
            value="vibetags"
            className="rounded-none border-b-2 data-[state=active]:border-b-primary"
          >
            <Tag className="h-4 w-4 mr-1.5" />
            VibeTags
          </TabsTrigger>
          <TabsTrigger
            value="repeat"
            className="rounded-none border-b-2 data-[state=active]:border-b-primary"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Repeat
          </TabsTrigger>
          <TabsTrigger
            value="postcards"
            className="rounded-none border-b-2 data-[state=active]:border-b-primary"
          >
            <ImageIcon className="h-4 w-4 mr-1.5" />
            Postcards
          </TabsTrigger>
          {permissions.canViewRevenueAnalytics && (
            <TabsTrigger
              value="revenue"
              className="rounded-none border-b-2 data-[state=active]:border-b-primary"
            >
              <DollarSign className="h-4 w-4 mr-1.5" />
              Revenue
            </TabsTrigger>
          )}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="participation" className="mt-0">
            <ParticipationModule
              data={{
                totalRsvps: data.participation?.totalRsvps || 0,
                confirmedRsvps: data.participation?.confirmedRsvps || 0,
                waitlistedRsvps: data.participation?.waitlistedRsvps || 0,
                totalCheckIns: data.participation?.totalCheckIns || 0,
                checkInRate: safeCheckInRate,
                spectatorJoins: data.participation?.spectatorJoins || 0,
              }}
              funnelData={data.participation?.funnelData}
              timelineData={data.participation?.timelineData}
            />
          </TabsContent>

          <TabsContent value="gamification" className="mt-0">
            <GamificationModule
              data={{
                activeSessions: data.gamification?.activeSessions || 0,
                completedSessions: data.gamification?.completedSessions || 0,
                uniquePlayers: data.gamification?.uniquePlayers || 0,
                gameParticipationRate: safeGameParticipationRate,
                totalSubmissions: data.gamification?.totalSubmissions || 0,
              }}
              sessions={data.gamification?.sessions}
              rewardStatuses={data.gamification?.rewardStatuses}
            />
          </TabsContent>

          <TabsContent value="vibetags" className="mt-0">
            <VibeTagsModule
              data={{
                activePreEventTags: data.vibetags?.activePreEventTags || 0,
                activeDuringEventTags:
                  data.vibetags?.activeDuringEventTags || 0,
                brandedCreations: data.vibetags?.brandedCreations || 0,
                brandedAdoptionRate: data.vibetags?.brandedAdoptionRate || 0,
              }}
              topTags={data.vibetags?.topTags}
              phaseComparison={data.vibetags?.phaseComparison}
            />
          </TabsContent>

          <TabsContent value="repeat" className="mt-0">
            <RepeatEngagementModule
              data={{
                repeatAttendees: data.repeat?.repeatAttendees || 0,
                repeatAttendeesPercentage:
                  data.repeat?.repeatAttendeesPercentage || 0,
                multiRoundPlayers: data.repeat?.multiRoundPlayers || 0,
                repeatCreators: data.repeat?.repeatCreators || 0,
              }}
              newVsReturning={data.repeat?.newVsReturning}
              engagementDepth={data.repeat?.engagementDepth}
            />
          </TabsContent>

          <TabsContent value="postcards" className="mt-0">
            <PostcardsModule
              data={{
                totalPostcards: data.postcards?.totalPostcards || 0,
                uniqueContributors: data.postcards?.uniqueContributors || 0,
                creatorConversionRate: safeCreatorConversionRate,
                totalShares: data.postcards?.totalShares || 0,
                avgPostcardsPerContributor: safeAvgPostcardsPerContributor,
              }}
              mediaTypeBreakdown={data.postcards?.mediaTypeBreakdown}
              timeSeriesData={data.postcards?.timeSeriesData}
              eventId={eventId}
              onViewGallery={() =>
                window.open(`/events/${eventId}/postcards`, "_blank")
              }
            />
          </TabsContent>

          {permissions.canViewRevenueAnalytics && (
            <TabsContent value="revenue" className="mt-0">
              <RevenueModule
                data={{
                  totalRevenue: data.revenue?.total || 0,
                  completedOrders: data.revenue?.completedOrders || 0,
                  currency: data.revenue?.currency || "NGN",
                  revenueByTier: data.revenue?.byTier || [],
                  dailyRevenue: data.revenue?.dailyRevenue || [],
                }}
                eventId={eventId}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>

      {/* Role-Based Info for CO_ORGANIZERs */}
      {!permissions.canViewRevenueAnalytics && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Revenue analytics are only available to event owners and super
            admins.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-5">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
