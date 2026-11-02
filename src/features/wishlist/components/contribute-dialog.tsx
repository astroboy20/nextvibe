"use client";
import { useEffect, useState } from "react";
import { Check, Copy, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { apiErrorMessage } from "@/shared/lib/error-handler";
import { formatMoney } from "@/shared/lib/money";
import {
  useLazyGetPaymentDetailsQuery,
  useReportContributionMutation,
} from "@/features/wishlist/api/wishlist-api";
import type { PublicWishlistItem } from "@/features/wishlist/types";

interface ContributeDialogProps {
  eventId: string;
  currency: string;
  item: PublicWishlistItem | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Guests send money straight to the organizer's bank, then come back here and
 * say how much they sent. NextVibe never sees the transfer, so the report
 * stays PENDING until the organizer confirms it.
 */
export function ContributeDialog({
  eventId,
  currency,
  item,
  onOpenChange,
}: ContributeDialogProps) {
  const open = item !== null;
  const [fetchDetails, details] = useLazyGetPaymentDetailsQuery();
  const [report, { isLoading: isSubmitting }] = useReportContributionMutation();

  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Bank details are only requested once a guest actually opens the dialog.
  // (The parent keys this component by item, so form state starts fresh.)
  useEffect(() => {
    if (open) fetchDetails(eventId);
  }, [open, eventId, fetchDetails]);

  const remaining = item?.remainingAmount ?? null;
  const canPayInFull = remaining !== null && Number(remaining) > 0;

  const copyAccountNumber = async () => {
    if (!details.data) return;
    try {
      await navigator.clipboard.writeText(details.data.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Please copy it manually.");
    }
  };

  const amountNumber = Number(amount);
  const isValid =
    name.trim().length > 0 && Number.isFinite(amountNumber) && amountNumber > 0;

  const handleSubmit = async () => {
    if (!item || !isValid) return;
    try {
      await report({
        eventId,
        itemId: item.id,
        name: name.trim(),
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        isAnonymous,
        amount: amountNumber,
      }).unwrap();
      setSubmitted(true);
    } catch (err) {
      toast.error(apiErrorMessage(err) ?? "Couldn't send your report. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95%] max-h-[85dvh] overflow-y-auto rounded-2xl">
        {submitted ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#531342]/10 text-[#531342]">
              <Gift className="h-7 w-7" />
            </div>
            <DialogTitle>Thank you!</DialogTitle>
            <DialogDescription>
              The organizer will confirm your gift once they see the transfer.
              {email.trim() && " We'll let you know by email."}
            </DialogDescription>
            <Button className="mt-2 w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Give to {item?.name}</DialogTitle>
              <DialogDescription>
                Send your gift to the account below, then tell the organizer
                how much you sent.
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: where to send it */}
            <div className="rounded-xl border bg-muted/40 p-4 space-y-1">
              {details.isFetching || !details.data ? (
                details.isError ? (
                  <p className="text-sm text-destructive">
                    {apiErrorMessage(details.error) ??
                      "Couldn't load the account details."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                )
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    {details.data.bankName}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xl font-semibold tracking-wider">
                      {details.data.accountNumber}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAccountNumber}
                      aria-label="Copy account number"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm">{details.data.accountName}</p>
                </>
              )}
            </div>

            {/* Step 2: report it */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wishlist-amount">
                  Amount you sent ({currency})
                </Label>
                <Input
                  id="wishlist-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
                {canPayInFull && (
                  <button
                    type="button"
                    className="text-xs font-medium text-[#531342] underline-offset-2 hover:underline"
                    onClick={() => setAmount(remaining!)}
                  >
                    Pay in full: {formatMoney(remaining, currency)}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="wishlist-name">Your name</Label>
                <Input
                  id="wishlist-name"
                  value={name}
                  maxLength={150}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="The name on your transfer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wishlist-email">Email (optional)</Label>
                <Input
                  id="wishlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="So we can tell you when it's confirmed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wishlist-message">Message (optional)</Label>
                <Textarea
                  id="wishlist-message"
                  value={message}
                  maxLength={500}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something nice 🎉"
                  rows={3}
                />
              </div>

              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={isAnonymous}
                  onCheckedChange={(v) => setIsAnonymous(v === true)}
                  className="mt-0.5"
                />
                <span>
                  Give anonymously
                  <span className="block text-xs text-muted-foreground">
                    Other guests see &quot;Anonymous&quot;. The organizer still
                    sees your name.
                  </span>
                </span>
              </label>

              <Button
                className="w-full"
                disabled={!isValid || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                I&apos;ve sent it
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
