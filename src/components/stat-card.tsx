import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  accent?: "plum" | "cyan" | "pink" | "purple" | "default";
}

const accentMap = {
  plum: {
    icon: "bg-primary/10 text-primary",
    value: "text-primary",
  },
  cyan: {
    icon: "bg-[hsl(195_100%_50%/0.12)] text-[hsl(195,100%,38%)]",
    value: "text-[hsl(195,100%,38%)]",
  },
  pink: {
    icon: "bg-[hsl(330_70%_60%/0.12)] text-[hsl(330,70%,50%)]",
    value: "text-[hsl(330,70%,50%)]",
  },
  purple: {
    icon: "bg-[hsl(280_60%_55%/0.12)] text-[hsl(280,60%,45%)]",
    value: "text-[hsl(280,60%,45%)]",
  },
  default: {
    icon: "bg-muted text-muted-foreground",
    value: "text-foreground",
  },
};

export function StatsCard({
  title,
  value,
  trend,
  icon: Icon,
  loading = false,
  accent = "default",
}: StatsCardProps) {
  const colors = accentMap[accent];

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-(--shadow-card-hover)">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {title}
            </p>
            <p className={cn("text-2xl font-bold mt-1.5 tabular-nums", colors.value)}>
              {loading ? (
                <span className="inline-block h-7 w-20 rounded bg-muted animate-pulse" />
              ) : (
                value
              )}
            </p>
            {trend !== undefined && !loading && (
              <div className="flex items-center gap-1 mt-2">
                {trend >= 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">+{trend}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                    <span className="text-xs text-destructive font-medium">{trend}%</span>
                  </>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colors.icon)}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
