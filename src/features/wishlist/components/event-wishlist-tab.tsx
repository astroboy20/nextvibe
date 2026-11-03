"use client";
import { useState } from "react";
import Image from "next/image";
import { Gift, PartyPopper, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/empty-state";
import { formatMoney } from "@/shared/lib/money";
import {
  useGetItemContributorsQuery,
  useGetWishlistQuery,
} from "@/features/wishlist/api/wishlist-api";
import type { PublicWishlistItem } from "@/features/wishlist/types";
import { ContributeDialog } from "./contribute-dialog";

interface EventWishlistTabProps {
  eventId: string;
}

export function EventWishlistTab({ eventId }: EventWishlistTabProps) {
  const { data: wishlist, isLoading, isError } = useGetWishlistQuery(eventId);
  const [givingTo, setGivingTo] = useState<PublicWishlistItem | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !wishlist || wishlist.items.length === 0) {
    return (
      <EmptyState
        icon={<Gift className="w-10 h-10 text-muted-foreground" />}
        title="No wishes yet"
        description="The organizer hasn't added anything to the wishlist."
      />
    );
  }

  return (
    <div className="space-y-3">
      {wishlist.items.map((item) => (
        <WishlistItemCard
          key={item.id}
          eventId={eventId}
          item={item}
          currency={wishlist.currency}
          onGive={() => setGivingTo(item)}
        />
      ))}

      <ContributeDialog
        key={givingTo?.id ?? "closed"}
        eventId={eventId}
        currency={wishlist.currency}
        item={givingTo}
        onOpenChange={(open) => !open && setGivingTo(null)}
      />
    </div>
  );
}

function WishlistItemCard({
  eventId,
  item,
  currency,
  onGive,
}: {
  eventId: string;
  item: PublicWishlistItem;
  currency: string;
  onGive: () => void;
}) {
  const [showGivers, setShowGivers] = useState(false);
  const isJustGive = item.price === null;

  // Bar width only — a display ratio, not money arithmetic. Totals and the
  // remaining amount come from the server.
  const percent = isJustGive
    ? 0
    : Math.min(100, (Number(item.confirmedTotal) / Number(item.price)) * 100);
  const goalReached = !isJustGive && Number(item.remainingAmount) <= 0;

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex gap-3">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[#531342]/10 text-[#531342]">
            <Gift className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-tight">{item.name}</p>
            {item.isFulfilled && (
              <Badge className="shrink-0 bg-green-500/10 text-green-600">
                Fulfilled
              </Badge>
            )}
          </div>
          {item.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {isJustGive ? (
        <p className="text-sm">
          <span className="font-semibold">
            {formatMoney(item.confirmedTotal, currency)}
          </span>{" "}
          <span className="text-muted-foreground">given so far</span>
        </p>
      ) : (
        <div className="space-y-1.5">
          <Progress value={percent} className="h-2" />
          <p className="text-sm">
            <span className="font-semibold">
              {formatMoney(item.confirmedTotal, currency)}
            </span>{" "}
            <span className="text-muted-foreground">
              of {formatMoney(item.price, currency)}
            </span>
            {goalReached && (
              <span className="ml-1 inline-flex items-center gap-1 text-green-600">
                · Goal reached <PartyPopper className="h-3.5 w-3.5" />
              </span>
            )}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {item.contributorCount > 0 ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setShowGivers((v) => !v)}
          >
            <Users className="h-3.5 w-3.5" />
            {item.contributorCount}{" "}
            {item.contributorCount === 1 ? "person" : "people"} gave
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">
            Be the first to give
          </span>
        )}
        {!item.isFulfilled && (
          <Button size="sm" onClick={onGive}>
            <Gift className="mr-1.5 h-4 w-4" />
            Contribute
          </Button>
        )}
      </div>

      {showGivers && <ItemGivers eventId={eventId} itemId={item.id} />}
    </div>
  );
}

function ItemGivers({ eventId, itemId }: { eventId: string; itemId: string }) {
  const [page, setPage] = useState(1);
  const { data, isFetching } = useGetItemContributorsQuery({
    eventId,
    itemId,
    page,
  });

  if (!data && isFetching) return <Skeleton className="h-12 w-full" />;
  if (!data) return null;

  return (
    <div className="space-y-2 border-t pt-3">
      {data.data.map((giver) => (
        <div key={giver.id} className="text-sm">
          <p className="font-medium">{giver.name}</p>
          {giver.message && (
            <p className="text-muted-foreground">{giver.message}</p>
          )}
        </div>
      ))}
      <div className="flex justify-between">
        {page > 1 && (
          <Button variant="ghost" size="sm" onClick={() => setPage((p) => p - 1)}>
            Newer
          </Button>
        )}
        {data.meta.hasNext && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setPage((p) => p + 1)}
          >
            Older
          </Button>
        )}
      </div>
    </div>
  );
}
