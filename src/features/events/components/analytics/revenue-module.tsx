"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/shared/components/stat-card";
import { ChartContainer } from "@/shared/components/chart-container";
import { DollarSign, ShoppingCart, TrendingUp, Ticket } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface RevenueByTier {
  tierName: string;
  revenue: number;
  orderCount: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueModuleProps {
  data: {
    totalRevenue: number;
    completedOrders: number;
    currency: string;
    revenueByTier: RevenueByTier[];
    dailyRevenue: DailyRevenue[];
  };
  eventId: string;
}

export function RevenueModule({ data, eventId }: RevenueModuleProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const avgOrderValue =
    data.completedOrders > 0
      ? data.totalRevenue / data.completedOrders
      : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          icon={DollarSign}
          accent="plum"
        />
        <StatsCard
          title="Completed Orders"
          value={data.completedOrders}
          icon={ShoppingCart}
          accent="cyan"
        />
        <StatsCard
          title="Avg Order Value"
          value={formatCurrency(avgOrderValue)}
          icon={TrendingUp}
          accent="pink"
        />
        <StatsCard
          title="Currency"
          value={data.currency}
          icon={Ticket}
          accent="purple"
        />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Ticket Tier */}
        {data.revenueByTier.length > 0 && (
          <ChartContainer
            title="Revenue by Ticket Tier"
            description="Breakdown of revenue per ticket type"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.revenueByTier}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tierName" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {/* Daily Revenue Trend */}
        {data.dailyRevenue.length > 0 && (
          <ChartContainer
            title="Daily Revenue Trend"
            description="Revenue and orders over time"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.dailyRevenue}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "revenue" ? formatCurrency(value) : value
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(195, 100%, 38%)"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>

      {/* Revenue Breakdown Table */}
      {data.revenueByTier.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket Tier Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">
                      Tier Name
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-3">
                      Orders
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-3">
                      Revenue
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-3">
                      Avg per Order
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-3">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.revenueByTier.map((tier) => {
                    const avgPerOrder =
                      tier.orderCount > 0 ? tier.revenue / tier.orderCount : 0;
                    const percentOfTotal =
                      data.totalRevenue > 0
                        ? (tier.revenue / data.totalRevenue) * 100
                        : 0;

                    return (
                      <tr key={tier.tierName} className="border-b last:border-0">
                        <td className="py-3 text-sm font-medium">
                          {tier.tierName}
                        </td>
                        <td className="py-3 text-sm text-right">
                          {tier.orderCount}
                        </td>
                        <td className="py-3 text-sm text-right font-semibold">
                          {formatCurrency(tier.revenue)}
                        </td>
                        <td className="py-3 text-sm text-right">
                          {formatCurrency(avgPerOrder)}
                        </td>
                        <td className="py-3 text-sm text-right text-muted-foreground">
                          {percentOfTotal.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">
                Total Revenue
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(data.totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                From {data.completedOrders} completed orders
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">
                Average Order
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(avgOrderValue)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Average value per transaction
              </p>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">
                Top Tier
              </p>
              <p className="text-2xl font-bold">
                {data.revenueByTier.length > 0
                  ? data.revenueByTier.reduce((max, tier) =>
                      tier.revenue > max.revenue ? tier : max
                    ).tierName
                  : "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Highest revenue generating tier
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
