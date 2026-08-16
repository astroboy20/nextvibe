"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  REWARD_STAGES,
  type RewardStage,
  type RewardStatus,
} from "@/app/provider/api/gameApi";

/** What each stage means to the person waiting, in their words not ours. */
const STAGE_LABELS: Record<RewardStage, string> = {
  WON: "Won",
  CLAIMED: "Claimed",
  APPROVED: "Approved",
  FULFILLED: "Received",
};

/**
 * The status bar for one reward.
 *
 * REJECTED deliberately doesn't render as a stage — it ends the run rather than
 * sitting somewhere on it, so showing it as a fourth dot would misrepresent
 * what happened. It gets its own row instead.
 */
export function RewardProgress({
  status,
  className,
}: {
  status: RewardStatus;
  className?: string;
}) {
  if (status === "REJECTED") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
        <span className="text-xs font-medium text-destructive">
          Claim declined
        </span>
      </div>
    );
  }

  // Widened for the lookup: `status` here is known not to be REJECTED (handled
  // above), but the tuple's element type doesn't carry that.
  const currentIndex = (REWARD_STAGES as readonly RewardStatus[]).indexOf(status);

  return (
    <div className={cn("flex items-center", className)}>
      {REWARD_STAGES.map((stage, i) => {
        const isDone = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full shrink-0 transition-colors",
                  isDone ? "bg-primary" : "bg-muted-foreground/25",
                  // The stage they're waiting on gets a ring so the eye lands
                  // on "where is it now" rather than "how far along is it".
                  isCurrent && "ring-2 ring-primary/30",
                )}
              />
              <span
                className={cn(
                  "text-[10px] whitespace-nowrap",
                  isDone ? "text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>

            {/* Connector — not rendered after the last dot. */}
            {i < REWARD_STAGES.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1 -mt-4 rounded-full transition-colors",
                  i < currentIndex ? "bg-primary" : "bg-muted-foreground/20",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Plain-language explanation of what happens next, shown under the bar. */
export function rewardStatusHint(status: RewardStatus): string {
  switch (status) {
    case "WON":
      return "Claim it to let the organizer know you want it.";
    case "CLAIMED":
      return "Waiting for the organizer to review your claim.";
    case "APPROVED":
      return "Approved — the organizer will hand it over.";
    case "FULFILLED":
      return "All done. Enjoy it!";
    case "REJECTED":
      return "Contact the organizer if you think this is wrong.";
  }
}

export function RewardStatusBadge({ status }: { status: RewardStatus }) {
  const styles: Record<RewardStatus, string> = {
    WON: "bg-primary/10 text-primary",
    CLAIMED: "bg-amber-500/10 text-amber-600",
    APPROVED: "bg-blue-500/10 text-blue-600",
    FULFILLED: "bg-emerald-500/10 text-emerald-600",
    REJECTED: "bg-destructive/10 text-destructive",
  };
  const labels: Record<RewardStatus, string> = {
    WON: "Unclaimed",
    CLAIMED: "Awaiting review",
    APPROVED: "Approved",
    FULFILLED: "Received",
    REJECTED: "Declined",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        styles[status],
      )}
    >
      {status === "FULFILLED" && <CheckCircle2 className="h-3 w-3" />}
      {labels[status]}
    </span>
  );
}
