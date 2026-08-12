import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Send,
} from "lucide-react";
import type { PayoutStatus } from "@/app/provider/api/payoutApi";

/**
 * One source of truth for how each payout status looks and reads, shared by the
 * organizer and admin views so they can never drift apart.
 */
export const PAYOUT_STATUS_CONFIG: Record<
  PayoutStatus,
  { label: string; icon: React.ReactNode; className: string; description: string }
> = {
  REQUESTED: {
    label: "Under review",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    description: "We've received your request and are reviewing it.",
  },
  APPROVED: {
    label: "Approved",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Approved — the transfer is being prepared.",
  },
  PROCESSING: {
    label: "Sending",
    icon: <Loader2 className="h-3.5 w-3.5" />,
    className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    description: "The transfer has been sent to the bank.",
  },
  PAID: {
    label: "Paid",
    icon: <Send className="h-3.5 w-3.5" />,
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Money sent. Bank transfers can take 1–5 business days to land.",
  },
  REJECTED: {
    label: "Declined",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className: "bg-destructive/10 text-destructive border-destructive/20",
    description: "This request was declined and the funds returned to your balance.",
  },
  FAILED: {
    label: "Failed",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    description: "The transfer bounced. The funds are back in your balance.",
  },
};
