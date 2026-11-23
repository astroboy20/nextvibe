"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/shared/components/stat-card";
import { ChartContainer } from "@/shared/components/chart-container";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Users,
  Share2,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface PostcardsModuleProps {
  data: {
    totalPostcards: number;
    uniqueContributors: number;
    creatorConversionRate: number;
    totalShares: number;
    avgPostcardsPerContributor: number;
  };
  mediaTypeBreakdown?: {
    images: number;
    videos: number;
  };
  timeSeriesData?: Array<{
    date: string;
    created: number;
    shared: number;
  }>;
  eventId: string;
  onViewGallery?: () => void;
}

export function PostcardsModule({
  data,
  mediaTypeBreakdown,
  timeSeriesData = [],
  eventId,
  onViewGallery,
}: PostcardsModuleProps) {
  const conversionRateFormatted = data.creatorConversionRate.toFixed(1);
  const avgPostcardsFormatted = data.avgPostcardsPerContributor.toFixed(1);

  const pieData = mediaTypeBreakdown
    ? [
        { name: "Images", value: mediaTypeBreakdown.images, color: "#60a5fa" },
        { name: "Videos", value: mediaTypeBreakdown.videos, color: "#a78bfa" },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Postcards"
          value={data.totalPostcards}
          icon={ImageIcon}
          accent="plum"
        />
        <StatsCard
          title="Unique Contributors"
          value={`${data.uniqueContributors} (${conversionRateFormatted}%)`}
          icon={Users}
          accent="cyan"
        />
        <StatsCard
          title="Total Shares"
          value={data.totalShares}
          icon={Share2}
          accent="pink"
        />
        <StatsCard
          title="Avg per Contributor"
          value={avgPostcardsFormatted}
          icon={TrendingUp}
          accent="purple"
        />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Media Type Breakdown */}
        {pieData.length > 0 && (
          <ChartContainer
            title="Media Type Breakdown"
            description="Image vs Video postcards"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Creation & Sharing Velocity */}
        {timeSeriesData.length > 0 && (
          <ChartContainer
            title="Creation & Sharing Velocity"
            description="Postcards created and shared over time"
            action={
              onViewGallery && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewGallery}
                >
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  View Gallery
                </Button>
              )
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={timeSeriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Created"
                />
                <Line
                  type="monotone"
                  dataKey="shared"
                  stroke="hsl(195, 100%, 38%)"
                  strokeWidth={2}
                  name="Shared"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>

      {/* Creator Conversion Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Creator Engagement</CardTitle>
          {onViewGallery && (
            <Button
              size="sm"
              variant="outline"
              onClick={onViewGallery}
            >
              Open Live Gallery
              <ExternalLink className="h-3 w-3 ml-1.5" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">
                Creator Conversion
              </p>
              <p className="text-2xl font-bold">{conversionRateFormatted}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                Of checked-in attendees who created content
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">
                Avg Posts per Creator
              </p>
              <p className="text-2xl font-bold">{avgPostcardsFormatted}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Average postcards created by each contributor
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">
                Share Rate
              </p>
              <p className="text-2xl font-bold">
                {data.totalPostcards > 0
                  ? (data.totalShares / data.totalPostcards).toFixed(1)
                  : "0.0"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Average shares per postcard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
