"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetAdminPayoutsQuery,
  type AdminPayout,
  type PayoutStatus,
} from "@/app/provider/api/payoutApi";
import { PAYOUT_STATUS_CONFIG } from "@/app/dashboard/(dashboard-route)/earnings/components/payout-status";
import {
  PayoutActionDialog,
  type PayoutAction,
} from "./components/payout-action-dialogs";
import { formatMoney, getCurrencyDecimals } from "@/utils/money";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "REQUESTED", label: "Needs review" },
  { value: "APPROVED", label: "Approved" },
  { value: "PROCESSING", label: "Sending" },
  { value: "PAID", label: "Paid" },
  { value: "REJECTED", label: "Declined" },
  { value: "FAILED", label: "Failed" },
];

/** Which actions are offered for each status, mirroring the backend's state machine. */
const ACTIONS_FOR_STATUS: Record<PayoutStatus, PayoutAction[]> = {
  REQUESTED: ["approve", "reject"],
  APPROVED: ["paid", "failed", "reject"],
  PROCESSING: ["paid", "failed"],
  PAID: [],
  REJECTED: [],
  FAILED: ["approve"],
};

const ACTION_LABEL: Record<PayoutAction, string> = {
  approve: "Approve",
  paid: "Mark paid",
  reject: "Decline",
  failed: "Mark failed",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

/** Renders rail-specific bank details so an admin can actually send the transfer. */
function DestinationDetails({ payout }: { payout: AdminPayout }) {
  const [copied, setCopied] = useState<string | null>(null);
  const dest = payout.destinationSnapshot;

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  return (
    <div className="space-y-1 rounded-lg bg-muted/50 p-2.5">
      <p className="text-xs font-medium text-foreground">{dest.accountName}</p>
      <p className="text-[11px] text-muted-foreground">
        {dest.rail.replaceAll("_", " ")} · {dest.country} · {dest.currency}
      </p>
      <div className="space-y-0.5 pt-1">
        {Object.entries(dest.details ?? {}).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">{key}</span>
            <button
              type="button"
              onClick={() => copy(key, String(value))}
              className="flex items-center gap-1 font-mono text-[11px] text-foreground hover:text-primary"
              title="Copy"
            >
              {String(value)}
              {copied === key ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3 opacity-50" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPayoutsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("REQUESTED");

  const { data, isLoading, isFetching, isError } = useGetAdminPayoutsQuery({
    status: status === "ALL" ? undefined : (status as PayoutStatus),
    page,
    limit: PAGE_SIZE,
  });

  const [activeAction, setActiveAction] = useState<PayoutAction | null>(null);
  const [activePayout, setActivePayout] = useState<AdminPayout | null>(null);

  const payouts = data?.data?.payouts ?? [];
  const outstanding = data?.data?.outstandingByCurrency ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  /**
   * Outstanding liability, grouped by currency then summed across the open
   * statuses. Never combined into a single cross-currency figure.
   *
   * Summed in minor units (integers) rather than by adding the decimal strings
   * as floats — same reason the API sends money as strings in the first place.
   */
  const outstandingByCurrency = Object.entries(
    outstanding.reduce<Record<string, number>>((acc, row) => {
      const minorUnits = Math.round(
        Number(row.total) * 10 ** getCurrencyDecimals(row.currency),
      );
      acc[row.currency] = (acc[row.currency] ?? 0) + minorUnits;
      return acc;
    }, {}),
  ).map(([currency, minorUnits]) => ({
    currency,
    total: minorUnits / 10 ** getCurrencyDecimals(currency),
  }));

  const openAction = (action: PayoutAction, payout: AdminPayout) => {
    setActivePayout(payout);
    setActiveAction(action);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payouts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who needs to be paid, and who has been paid.
        </p>
      </div>

      {/* Outstanding liability — one card per currency, deliberately not totalled */}
      <div>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Outstanding liability
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : outstandingByCurrency.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Nothing outstanding — every requested payout has been settled.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {outstandingByCurrency.map(({ currency, total }) => (
              <Card key={currency}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {currency} owed
                      </p>
                      <p className="mt-1.5 text-2xl font-bold tabular-nums text-primary">
                        {formatMoney(total, currency)}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Payout queue</CardTitle>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <p className="py-8 text-center text-muted-foreground">
              Failed to load payouts.
            </p>
          ) : payouts.length === 0 ? (
            <EmptyState
              title="Nothing here"
              description={
                status === "REQUESTED"
                  ? "No payouts are waiting for review."
                  : "No payouts match this filter."
              }
              icon={<Banknote className="h-10 w-10 text-muted-foreground" />}
            />
          ) : (
            <div className={cn("space-y-3", isFetching && "opacity-60")}>
              {payouts.map((payout) => {
                const cfg = PAYOUT_STATUS_CONFIG[payout.status];
                const actions = ACTIONS_FOR_STATUS[payout.status] ?? [];

                return (
                  <div
                    key={payout.id}
                    className="rounded-xl border border-border p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold tabular-nums text-foreground">
                            {formatMoney(payout.amount, payout.currency)}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn("gap-1 text-[10px]", cfg.className)}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground">
                            {payout.reference}
                          </span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <p>
                            <span className="font-medium text-foreground">
                              {payout.organizer.displayName ??
                                payout.organizer.username}
                            </span>{" "}
                            · {payout.organizer.email}
                          </p>
                          {payout.event && <p>Event: {payout.event.name}</p>}
                          <p>Requested {formatDate(payout.requestedAt)}</p>
                          {payout.paidAt && <p>Paid {formatDate(payout.paidAt)}</p>}
                          {payout.externalReference && (
                            <p>
                              Bank ref:{" "}
                              <span className="font-mono text-foreground/80">
                                {payout.externalReference}
                              </span>
                            </p>
                          )}
                          {payout.failureReason && (
                            <p className="text-destructive">
                              {payout.failureReason}
                            </p>
                          )}
                          {payout.notes && (
                            <p className="italic">“{payout.notes}”</p>
                          )}
                        </div>
                      </div>

                      <div className="w-full space-y-2 lg:w-72">
                        <DestinationDetails payout={payout} />

                        {actions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {actions.map((action) => (
                              <Button
                                key={action}
                                size="sm"
                                variant={
                                  action === "approve" || action === "paid"
                                    ? "default"
                                    : "outline"
                                }
                                className={cn(
                                  "flex-1 rounded-lg text-xs",
                                  (action === "reject" || action === "failed") &&
                                    "text-destructive hover:text-destructive",
                                )}
                                onClick={() => openAction(action, payout)}
                              >
                                {ACTION_LABEL[action]}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PayoutActionDialog
        action={activeAction}
        payout={activePayout}
        onClose={() => {
          setActiveAction(null);
          setActivePayout(null);
        }}
      />
    </div>
  );
}
