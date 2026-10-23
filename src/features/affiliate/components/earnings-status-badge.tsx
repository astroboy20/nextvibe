import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AffiliateEarningStatus } from "@/features/affiliate/api/affiliate-api";

const STATUS_CONFIG: Record<
  AffiliateEarningStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  AVAILABLE: {
    label: "Available",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  PAID_OUT: {
    label: "Paid Out",
    className: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

export function EarningStatusBadge({ status }: { status: AffiliateEarningStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold", config.className)}
    >
      {config.label}
    </Badge>
  );
}
