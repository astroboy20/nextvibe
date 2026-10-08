import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  loading?: boolean;
  action?: React.ReactNode;
}

export function ChartContainer({
  title,
  description,
  children,
  loading = false,
  action,
}: ChartContainerProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-72 w-full rounded-lg" />
        ) : (
          <div className="w-full h-72">{children}</div>
        )}
      </CardContent>
    </Card>
  );
}
