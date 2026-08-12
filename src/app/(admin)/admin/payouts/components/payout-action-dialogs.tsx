"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  useApprovePayoutMutation,
  useMarkPayoutPaidMutation,
  useRejectPayoutMutation,
  useMarkPayoutFailedMutation,
  type AdminPayout,
} from "@/app/provider/api/payoutApi";
import { formatMoney } from "@/utils/money";

export type PayoutAction = "approve" | "paid" | "reject" | "failed";

interface Props {
  action: PayoutAction | null;
  payout: AdminPayout | null;
  onClose: () => void;
}

const COPY: Record<
  PayoutAction,
  { title: string; description: string; cta: string; destructive?: boolean }
> = {
  approve: {
    title: "Approve this payout?",
    description:
      "Marks it cleared to send. The funds are already reserved — this doesn't move money on its own.",
    cta: "Approve",
  },
  paid: {
    title: "Mark as paid",
    description:
      "Only do this after the transfer has actually been sent. The bank reference is your proof it left.",
    cta: "Mark paid",
  },
  reject: {
    title: "Decline this payout?",
    description:
      "The reserved funds go straight back to the organizer's available balance. They'll see your reason.",
    cta: "Decline",
    destructive: true,
  },
  failed: {
    title: "Record a failed transfer",
    description:
      "Use this when the transfer was attempted and bounced. Funds return to the organizer and the payout can be retried.",
    cta: "Record failure",
    destructive: true,
  },
};

export function PayoutActionDialog({ action, payout, onClose }: Props) {
  const [approve, { isLoading: approving }] = useApprovePayoutMutation();
  const [markPaid, { isLoading: paying }] = useMarkPayoutPaidMutation();
  const [reject, { isLoading: rejecting }] = useRejectPayoutMutation();
  const [markFailed, { isLoading: failing }] = useMarkPayoutFailedMutation();

  const [externalReference, setExternalReference] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const isLoading = approving || paying || rejecting || failing;

  /**
   * Clear on the way out rather than syncing to `action` in an effect — the
   * effect version fires an extra render pass every time the dialog closes.
   */
  const closeAndReset = () => {
    setExternalReference("");
    setReason("");
    setNotes("");
    onClose();
  };

  if (!action || !payout) return null;

  const copy = COPY[action];

  // The two "money went back" actions need a reason; marking paid needs proof.
  const needsReason = action === "reject" || action === "failed";
  const canSubmit = needsReason
    ? reason.trim().length >= 3
    : action === "paid"
      ? externalReference.trim().length >= 3
      : true;

  const handleSubmit = async () => {
    try {
      if (action === "approve") {
        await approve({ id: payout.id, notes: notes.trim() || undefined }).unwrap();
        toast.success(`${payout.reference} approved`);
      } else if (action === "paid") {
        await markPaid({
          id: payout.id,
          externalReference: externalReference.trim(),
          notes: notes.trim() || undefined,
        }).unwrap();
        toast.success(`${payout.reference} marked paid`, {
          description: "The organizer has been notified.",
        });
      } else if (action === "reject") {
        await reject({ id: payout.id, reason: reason.trim() }).unwrap();
        toast.success(`${payout.reference} declined — funds returned`);
      } else {
        await markFailed({ id: payout.id, reason: reason.trim() }).unwrap();
        toast.success(`${payout.reference} marked failed — funds returned`);
      }
      closeAndReset();
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string }; message?: string } };
      // Illegal status transitions come back as a 400 naming what IS allowed.
      toast.error(e?.data?.error?.message ?? e?.data?.message ?? "That action failed");
    }
  };

  return (
    <Dialog open={!!action} onOpenChange={(open) => !open && closeAndReset()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {payout.reference}
              </span>
              <span className="font-semibold tabular-nums">
                {formatMoney(payout.amount, payout.currency)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {payout.organizer.displayName ?? payout.organizer.username} ·{" "}
              {payout.destinationSnapshot.accountName}
            </p>
          </div>

          {action === "paid" && (
            <div className="space-y-1.5">
              <Label htmlFor="externalReference" className="text-xs font-medium">
                Bank / provider transfer reference
              </Label>
              <Input
                id="externalReference"
                placeholder="e.g. FT26081200123456"
                value={externalReference}
                onChange={(e) => setExternalReference(e.target.value)}
                className="rounded-xl font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Required. This is what reconciliation matches on later.
              </p>
            </div>
          )}

          {needsReason && (
            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-xs font-medium">
                Reason
              </Label>
              <Textarea
                id="reason"
                placeholder={
                  action === "reject"
                    ? "e.g. Account name doesn't match verified identity"
                    : "e.g. Beneficiary bank rejected the transfer"
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none rounded-xl"
                rows={3}
                maxLength={500}
              />
              <p className="text-[11px] text-muted-foreground">
                Shown to the organizer.
              </p>
            </div>
          )}

          {(action === "approve" || action === "paid") && (
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium">
                Internal note (optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none rounded-xl"
                rows={2}
                maxLength={500}
              />
            </div>
          )}

          {action === "paid" && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[11px] text-muted-foreground">
                This is final — a paid payout can&apos;t be moved back to another
                status.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={closeAndReset}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 rounded-xl ${
                copy.destructive ? "bg-destructive text-white hover:bg-destructive/90" : ""
              }`}
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Working…
                </>
              ) : (
                copy.cta
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
