"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertCircle, Gift, Loader2, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useGetEventRewardsOverviewQuery,
  useApproveRewardMutation,
  useFulfilRewardMutation,
  useRejectRewardMutation,
  type EventRewardsOverview,
  type RewardStatus,
} from "@/app/provider/api/gameApi";
import { useGetMyCreatedEventsQuery } from "@/app/provider/api/eventApi";
import { RewardStatusBadge } from "./reward-progress";

type Winner = EventRewardsOverview["winners"][number];

function personName(u: { displayName: string | null; username: string | null }) {
  return u.displayName || u.username || "Someone";
}

/** Small labelled count, used for the queue summary. */
function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "attention" | "muted";
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p
        className={cn(
          "text-xl font-bold",
          tone === "attention" && value > 0 ? "text-amber-600" : "text-foreground",
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{label}</p>
    </div>
  );
}

function WinnerRow({ winner }: { winner: Winner }) {
  const [approve, { isLoading: approving }] = useApproveRewardMutation();
  const [fulfil, { isLoading: fulfilling }] = useFulfilRewardMutation();
  const [reject, { isLoading: rejecting }] = useRejectRewardMutation();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [fulfilOpen, setFulfilOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const busy = approving || fulfilling || rejecting;

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string }; message?: string } };
      toast.error(e?.data?.error?.message ?? e?.data?.message ?? "That didn't work.");
    }
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={winner.user.avatarUrl ?? undefined} />
        <AvatarFallback>{personName(winner.user)[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm truncate">{personName(winner.user)}</p>
          <RewardStatusBadge status={winner.status} />
        </div>

        <p className="text-xs text-muted-foreground mt-0.5">
          Won{" "}
          <span className="text-foreground font-medium">
            {winner.reward.title || winner.reward.type}
          </span>
          {winner.reward.value && ` · ${winner.reward.value}`}
          {winner.session.title && ` · ${winner.session.title}`}
        </p>

        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(winner.awardedAt), { addSuffix: true })}
        </p>

        {winner.status === "REJECTED" && winner.rejectionReason && (
          <p className="text-[11px] text-destructive mt-1">
            &ldquo;{winner.rejectionReason}&rdquo;
          </p>
        )}
        {winner.status === "FULFILLED" && winner.fulfilmentNote && (
          <p className="text-[11px] text-muted-foreground mt-1">
            {winner.fulfilmentNote}
          </p>
        )}

        {/* Only the actions legal from this status are offered, so the state
            machine can't be violated from the UI in the first place. */}
        {winner.status === "CLAIMED" && (
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              className="h-7 text-xs"
              disabled={busy}
              onClick={() =>
                run(() => approve(winner.rewardId).unwrap(), "Claim approved")
              }
            >
              {approving && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={busy}
              onClick={() => setRejectOpen(true)}
            >
              Decline
            </Button>
          </div>
        )}

        {winner.status === "APPROVED" && (
          <Button
            size="sm"
            className="h-7 text-xs mt-2"
            disabled={busy}
            onClick={() => setFulfilOpen(true)}
          >
            Mark as handed over
          </Button>
        )}
      </div>

      {/* Decline — a reason is required, so the field gates the button. */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Decline this claim?</DialogTitle>
            <DialogDescription>
              {personName(winner.user)} will see your reason. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g. Entry was disqualified"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={reason.trim().length < 3 || rejecting}
              onClick={async () => {
                await run(
                  () =>
                    reject({
                      rewardId: winner.rewardId,
                      rejectionReason: reason.trim(),
                    }).unwrap(),
                  "Claim declined",
                );
                setRejectOpen(false);
                setReason("");
              }}
            >
              {rejecting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hand over — the note is optional. */}
      <Dialog open={fulfilOpen} onOpenChange={setFulfilOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark as handed over</DialogTitle>
            <DialogDescription>
              Add a note if it helps — a coupon code, a tracking number, or where
              they collected it. {personName(winner.user)} will see it.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Optional — e.g. Collected at the merch desk"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFulfilOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={fulfilling}
              onClick={async () => {
                await run(
                  () =>
                    fulfil({
                      rewardId: winner.rewardId,
                      fulfilmentNote: note.trim() || undefined,
                    }).unwrap(),
                  "Marked as handed over",
                );
                setFulfilOpen(false);
                setNote("");
              }}
            >
              {fulfilling && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OrganizerRewards() {
  const {
    data: eventsData,
    isLoading: loadingEvents,
    isError: eventsError,
    refetch: refetchEvents,
  } = useGetMyCreatedEventsQuery();
  const events = eventsData?.data?.data ?? [];

  const [selectedId, setSelectedId] = useState<string>("");
  // Default to the first event once they load, without an effect: derived
  // during render, and the user's own choice always wins once made.
  const eventId = selectedId || events[0]?.id || "";

  const { data, isLoading, isError } = useGetEventRewardsOverviewQuery(eventId, {
    skip: !eventId,
  });
  const overview = data?.data;

  if (loadingEvents) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  // A failed request and a genuinely empty list are different things, and
  // saying "no events yet" for both is how a broken endpoint hides as normal
  // behaviour. Keep them distinguishable — with a retry on the failure.
  if (eventsError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-semibold mb-1">Couldn&apos;t load your events</h3>
        <p className="text-sm text-muted-foreground mb-4">
          We can&apos;t tell which events are yours, so there&apos;s nothing to manage yet.
        </p>
        <Button variant="outline" onClick={() => refetchEvents()}>
          Retry
        </Button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Trophy className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">No events yet</h3>
        <p className="text-sm text-muted-foreground">
          Create an event and add prizes to a game — you&apos;ll manage claims here.
        </p>
      </div>
    );
  }

  const byStatus = (s: RewardStatus) =>
    overview?.winners.filter((w) => w.status === s) ?? [];

  // Needs-action first — the whole point of this view is the queue.
  const ordered = [
    ...byStatus("CLAIMED"),
    ...byStatus("APPROVED"),
    ...byStatus("WON"),
    ...byStatus("FULFILLED"),
    ...byStatus("REJECTED"),
  ];

  return (
    <div className="space-y-4">
      {events.length > 1 && (
        <Select value={eventId} onValueChange={setSelectedId}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Choose an event" />
          </SelectTrigger>
          <SelectContent>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {isLoading && <Skeleton className="h-64 w-full rounded-xl" />}

      {isError && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Couldn&apos;t load rewards for this event.
        </p>
      )}

      {overview && (
        <>
          <div className="grid grid-cols-4 gap-2">
            <Stat label="Awaiting review" value={overview.counts.awaitingReview} tone="attention" />
            <Stat label="To hand over" value={overview.counts.awaitingHandover} tone="attention" />
            <Stat label="Unclaimed" value={overview.counts.unclaimed} />
            <Stat label="Received" value={overview.counts.fulfilled} />
          </div>

          {/* Winners and what each one won */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Winners</h3>
              <Badge variant="secondary" className="text-[10px]">
                {overview.winners.length}
              </Badge>
            </div>
            {ordered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No prizes awarded yet.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {ordered.map((w) => (
                  <WinnerRow key={w.rewardId} winner={w} />
                ))}
              </div>
            )}
          </Card>

          {/* What's on offer */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Rewards on offer</h3>
              <Badge variant="secondary" className="text-[10px]">
                {overview.availableRewards.length}
              </Badge>
            </div>
            {overview.availableRewards.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No prizes configured for this event.
              </p>
            ) : (
              <div className="space-y-2">
                {overview.availableRewards.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {t.title || t.type}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Rank {t.rank}
                        {t.value && ` · ${t.value}`}
                      </p>
                    </div>
                    <Badge
                      variant={t.isAwarded ? "secondary" : "outline"}
                      className="text-[10px] shrink-0"
                    >
                      {t.isAwarded ? "Awarded" : "Not yet won"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Who qualified */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Qualified players</h3>
              <Badge variant="secondary" className="text-[10px]">
                {overview.qualifiers.length}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground -mt-2 mb-3">
              Everyone who finished a game and was eligible to place.
            </p>
            {overview.qualifiers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nobody has completed a game yet.
              </p>
            ) : (
              <div className="space-y-1.5">
                {overview.qualifiers.map((q) => (
                  <div
                    key={`${q.gameSessionId}-${q.userId}`}
                    className="flex items-center gap-2.5"
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={q.user.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {personName(q.user)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm flex-1 min-w-0 truncate">
                      {personName(q.user)}
                    </p>
                    {q.sessionRank && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        #{q.sessionRank}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      {q.totalScore}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
