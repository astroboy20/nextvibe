"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Banknote,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  CircleDollarSign,
} from "lucide-react";
import {
  useRequestWithdrawalMutation,
  useGetWithdrawalsQuery,
  type WithdrawalRecord,
} from "@/app/provider/api/eventApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WithdrawalSectionProps {
  eventId: string;
  /** Ticket tier data from the event for estimated revenue preview */
  ticketTiers?: { price: number; quantitySold?: number }[];
}

const STATUS_CONFIG: Record<
  WithdrawalRecord["status"],
  { label: string; icon: React.ReactNode; color: string }
> = {
  PENDING: {
    label: "Pending Review",
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  APPROVED: {
    label: "Approved",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  REJECTED: {
    label: "Rejected",
    icon: <XCircle className="h-3.5 w-3.5" />,
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
  PAID: {
    label: "Paid",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
};

function formatCurrency(amount: string, currency: string) {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency} ${amount}`;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency === "NGN" ? "NGN" : currency,
    minimumFractionDigits: 2,
  }).format(num);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function WithdrawalSection({ eventId, ticketTiers = [] }: WithdrawalSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [requestWithdrawal, { isLoading: isSubmitting }] = useRequestWithdrawalMutation();
  const { data: withdrawalsData, isLoading: isLoadingHistory } = useGetWithdrawalsQuery(eventId, {
    skip: !showHistory,
  });

  const withdrawals: WithdrawalRecord[] = withdrawalsData?.data ?? [];

  // Estimated revenue from ticket tier data (preview only — server calculates authoritative amount)
  const estimatedRevenue = ticketTiers.reduce(
    (sum, tier) => sum + tier.price * (tier.quantitySold ?? 0),
    0
  );

  const hasPendingRequest = withdrawals.some((w) => w.status === "PENDING");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      toast.error("Please fill in all bank details.");
      return;
    }
    try {
      const result = await requestWithdrawal({
        eventId,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      }).unwrap();

      toast.success("Withdrawal request submitted! We'll review it shortly.");
      setShowForm(false);
      setShowHistory(true);
      setBankName("");
      setAccountNumber("");
      setAccountName("");

      // Show the returned status
      const record = result?.data;
      if (record) {
        toast.info(`Status: ${record.status}. Amount: ${formatCurrency(record.amount, record.currency)}`);
      }
    } catch (err: any) {
      const msg = err?.data?.error?.message ?? err?.message ?? "Failed to submit withdrawal request.";
      if (msg.toLowerCase().includes("ended")) {
        toast.error("Withdrawals can only be requested after the event has ended.");
      } else if (msg.toLowerCase().includes("revenue") || msg.toLowerCase().includes("no ticket")) {
        toast.error("This event has no ticket revenue to withdraw.");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Banknote className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Ticket Revenue</h3>
            <p className="text-xs text-muted-foreground">Request payout for this event</p>
          </div>
          {estimatedRevenue > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Est. Revenue</p>
              <p className="text-sm font-semibold text-foreground">
                ₦{estimatedRevenue.toLocaleString("en-NG")}
              </p>
            </div>
          )}
        </div>

        {/* Request button */}
        {!showForm && (
          <Button
            className="w-full rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setShowForm(true)}
            disabled={hasPendingRequest}
          >
            <CircleDollarSign className="h-4 w-4" />
            {hasPendingRequest ? "Withdrawal Requested" : "Request Withdrawal"}
          </Button>
        )}

        {hasPendingRequest && !showForm && (
          <p className="text-center text-xs text-muted-foreground">
            You have a pending withdrawal request under review.
          </p>
        )}

        {/* Withdrawal form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in">
            <div className="rounded-xl bg-muted/50 border border-border p-3 space-y-1">
              <p className="text-xs font-medium text-foreground">Bank Details</p>
              <p className="text-[11px] text-muted-foreground">
                Double-check your details — this request cannot be edited once submitted.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bankName" className="text-xs font-medium">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="e.g. GTBank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accountNumber" className="text-xs font-medium">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="e.g. 0123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                inputMode="numeric"
                className="rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accountName" className="text-xs font-medium">Account Name</Label>
              <Input
                id="accountName"
                placeholder="e.g. Jane Doe"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Submitting...</>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* History toggle */}
        <button
          type="button"
          className="flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowHistory((v) => !v)}
        >
          <span>Withdrawal history</span>
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* History list */}
        {showHistory && (
          <div className="space-y-2 animate-fade-in">
            {isLoadingHistory ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : withdrawals.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-3">No withdrawal requests yet.</p>
            ) : (
              withdrawals.map((w) => {
                const cfg = STATUS_CONFIG[w.status];
                return (
                  <div key={w.id} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(w.amount, w.currency)}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("gap-1 text-[10px]", cfg.color)}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{w.bankName} — {w.accountNumber}</p>
                      <p>{w.accountName}</p>
                      <p>Requested {formatDate(w.requestedAt)}</p>
                      {w.processedAt && <p>Processed {formatDate(w.processedAt)}</p>}
                      {w.notes && <p className="text-foreground/70 italic">{w.notes}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
