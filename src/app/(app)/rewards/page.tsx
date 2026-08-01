"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Trophy, Gift, Coins, Ticket, Package, BadgeCheck,
  Sparkles, Loader2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  useGetMyRewardsQuery,
  useClaimRewardMutation,
  type Reward,
  type RewardType,
} from "@/app/provider/api/gameApi";

function rewardIcon(type: RewardType) {
  switch (type) {
    case "CASH":        return <Coins className="h-5 w-5" />;
    case "COUPON":      return <Gift className="h-5 w-5" />;
    case "MERCHANDISE": return <Package className="h-5 w-5" />;
    case "FREE_TICKET": return <Ticket className="h-5 w-5" />;
    case "BADGE":       return <BadgeCheck className="h-5 w-5" />;
    case "POINTS":      return <Sparkles className="h-5 w-5" />;
    default:            return <Trophy className="h-5 w-5" />;
  }
}

function rewardTypeLabel(type: RewardType): string {
  const labels: Record<RewardType, string> = {
    CASH: "Cash Prize",
    COUPON: "Coupon",
    MERCHANDISE: "Merchandise",
    FREE_TICKET: "Free Ticket",
    BADGE: "Badge",
    POINTS: "Points",
    OTHER: "Prize",
  };
  return labels[type] ?? "Prize";
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function RewardCard({ reward }: { reward: Reward }) {
  const [claim, { isLoading }] = useClaimRewardMutation();
  const { rewardTier: tier, gameSession } = reward;
  const eventName = gameSession?.event?.name ?? gameSession?.title ?? "a game";

  const handleClaim = async () => {
    try {
      await claim(reward.id).unwrap();
      toast.success("Reward claimed! Check your email or the organizer for next steps.");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Could not claim this reward.");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div
          className={cn(
            "shrink-0 h-11 w-11 rounded-full flex items-center justify-center",
            reward.isClaimed
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          {rewardIcon(tier.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground truncate">
              {tier.title || rewardTypeLabel(tier.type)}
            </p>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {rewardTypeLabel(tier.type)}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground mt-0.5">
            {ordinal(tier.rank)} place · {eventName}
          </p>

          {tier.description && (
            <p className="text-sm text-foreground/80 mt-2">{tier.description}</p>
          )}
          {tier.value && (
            <p className="text-sm mt-1">
              <span className="text-muted-foreground">Value: </span>
              <span className="font-medium text-foreground">{tier.value}</span>
            </p>
          )}

          <p className="text-[11px] text-muted-foreground mt-2">
            Won {formatDistanceToNow(new Date(reward.createdAt), { addSuffix: true })}
          </p>

          {/* Action */}
          <div className="mt-3">
            {reward.isClaimed ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Claimed
                {reward.claimedAt && (
                  <span className="text-xs font-normal text-muted-foreground">
                    · {formatDistanceToNow(new Date(reward.claimedAt), { addSuffix: true })}
                  </span>
                )}
              </span>
            ) : (
              <Button size="sm" onClick={handleClaim} disabled={isLoading} className="gap-1.5">
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Redeem Prize
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function RewardsPage() {
  const { data, isLoading, isError, refetch } = useGetMyRewardsQuery();
  const rewards: Reward[] = data?.data ?? [];

  const unclaimed = rewards.filter((r) => !r.isClaimed);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold text-foreground">Your Rewards</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Prizes you&apos;ve won from game sessions.
        {unclaimed.length > 0 && (
          <span className="text-primary font-medium">
            {" "}You have {unclaimed.length} to redeem.
          </span>
        )}
      </p>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-8 w-24 mt-2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">Failed to load your rewards.</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && rewards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No rewards yet</h3>
          <p className="text-sm text-muted-foreground">
            Play games at events to win prizes — they&apos;ll show up here.
          </p>
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && rewards.length > 0 && (
        <div className="space-y-3">
          {rewards.map((r) => (
            <RewardCard key={r.id} reward={r} />
          ))}
        </div>
      )}
    </div>
  );
}
