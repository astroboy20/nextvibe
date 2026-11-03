"use client";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/shared/lib/error-handler";
import { formatMoney } from "@/shared/lib/money";
import {
  uploadFileToCDN,
  useUploadIntentMutation,
} from "@/shared/api/uploads-api";
import {
  useCreateWishlistItemMutation,
  useDeleteWishlistItemMutation,
  useReorderWishlistItemsMutation,
  useGetContributionsQuery,
  useGetOrganizerWishlistQuery,
  useReviewContributionMutation,
  useSetWishlistItemFulfilledMutation,
  useUpdateWishlistItemMutation,
  useUpsertWishlistMutation,
} from "@/features/wishlist/api/wishlist-api";
import type {
  ContributionStatus,
  OrganizerWishlist,
  OrganizerWishlistItem,
} from "@/features/wishlist/types";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface WishlistManagerContentProps {
  eventId: string;
}

/**
 * Organizer side of the wishlist: bank details and the on/off switch, the
 * items, and the queue of gift reports to confirm against the bank app.
 */
export function WishlistManagerContent({ eventId }: WishlistManagerContentProps) {
  const { data: wishlist, isLoading, error } = useGetOrganizerWishlistQuery(eventId);
  const notSetUp = (error as { status?: number } | undefined)?.status === 404;

  if (isLoading) return <Skeleton className="mt-4 h-40 w-full rounded-xl" />;

  if (error && !notSetUp) {
    return (
      <p className="mt-4 text-sm text-destructive">
        {apiErrorMessage(error) ?? "Couldn't load the wishlist."}
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      {/* Keyed by updatedAt so the form re-seeds from the server after a save. */}
      <WishlistSettings
        key={wishlist?.updatedAt ?? "new"}
        eventId={eventId}
        wishlist={wishlist ?? null}
      />
      {wishlist && (
        <>
          <WishlistTotals wishlist={wishlist} />
          <WishlistItems eventId={eventId} wishlist={wishlist} />
          <ContributionQueue eventId={eventId} currency={wishlist.currency} />
        </>
      )}
    </div>
  );
}

// ── Settings ───────────────────────────────────────────────────────────────

function WishlistSettings({
  eventId,
  wishlist,
}: {
  eventId: string;
  wishlist: OrganizerWishlist | null;
}) {
  const [upsert, { isLoading }] = useUpsertWishlistMutation();
  const [bankName, setBankName] = useState(wishlist?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState(
    wishlist?.accountNumber ?? "",
  );
  const [accountName, setAccountName] = useState(wishlist?.accountName ?? "");

  const isValid =
    bankName.trim() && accountNumber.trim() && accountName.trim();
  const isDirty =
    !wishlist ||
    bankName !== wishlist.bankName ||
    accountNumber !== wishlist.accountNumber ||
    accountName !== wishlist.accountName;

  const save = async (isEnabled?: boolean) => {
    if (!isValid) return;
    try {
      await upsert({
        eventId,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        ...(isEnabled !== undefined && { isEnabled }),
      }).unwrap();
      toast.success(
        !wishlist
          ? "Wishlist is on"
          : isEnabled === undefined
            ? "Account details saved"
            : isEnabled
              ? "Wishlist is on"
              : "Wishlist is hidden",
      );
    } catch (err) {
      toast.error(apiErrorMessage(err) ?? "Couldn't save the wishlist.");
    }
  };

  return (
    <section className="space-y-3">
      {wishlist ? (
        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
          <div>
            <p className="text-sm font-medium">Show wishlist to guests</p>
            <p className="text-xs text-muted-foreground">
              Turning it off hides it but keeps everything.
            </p>
          </div>
          <Switch
            checked={wishlist.isEnabled}
            disabled={isLoading}
            onCheckedChange={(checked) => save(checked)}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Let guests give towards things you want. They send money straight to
          your account, then tell you how much they sent, and you confirm it.
        </p>
      )}

      <div className="space-y-1">
        <p className="text-sm font-medium">Where guests send money</p>
        <p className="text-xs text-muted-foreground">
          Guests see these details when they tap Contribute. You can use a
          different account from your payout account.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="wl-bank">Bank</Label>
          <Input
            id="wl-bank"
            value={bankName}
            maxLength={100}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="GTBank"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wl-number">Account number</Label>
          <Input
            id="wl-number"
            value={accountNumber}
            maxLength={34}
            inputMode="numeric"
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="0123456789"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wl-name">Account name</Label>
          <Input
            id="wl-name"
            value={accountName}
            maxLength={150}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Tolu Adeyemi"
          />
        </div>
      </div>
      {isDirty && (
        <Button
          size="sm"
          disabled={!isValid || isLoading}
          onClick={() => save(wishlist ? undefined : true)}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {wishlist ? "Save account details" : "Turn on wishlist"}
        </Button>
      )}
    </section>
  );
}

// ── Totals ─────────────────────────────────────────────────────────────────

function WishlistTotals({ wishlist }: { wishlist: OrganizerWishlist }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border p-3">
        <p className="text-xs text-muted-foreground">Confirmed</p>
        <p className="text-lg font-semibold">
          {formatMoney(wishlist.confirmedTotal, wishlist.currency)}
        </p>
      </div>
      <div className="rounded-lg border p-3">
        <p className="text-xs text-muted-foreground">Waiting for you</p>
        <p className="text-lg font-semibold">
          {formatMoney(wishlist.pendingTotal, wishlist.currency)}
        </p>
      </div>
    </div>
  );
}

// ── Items ──────────────────────────────────────────────────────────────────

function WishlistItems({
  eventId,
  wishlist,
}: {
  eventId: string;
  wishlist: OrganizerWishlist;
}) {
  const [editing, setEditing] = useState<OrganizerWishlistItem | "new" | null>(
    null,
  );
  const [setFulfilled] = useSetWishlistItemFulfilledMutation();
  const [deleteItem] = useDeleteWishlistItemMutation();
  const [reorder, { isLoading: isReordering }] =
    useReorderWishlistItemsMutation();

  // Sends the whole order, not a swap, so it stays right even if two items
  // ever share a sortOrder.
  const move = async (index: number, direction: -1 | 1) => {
    const ids = wishlist.items.map((i) => i.id);
    const target = index + direction;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorder({ eventId, itemIds: ids }).unwrap();
    } catch (err) {
      toast.error(apiErrorMessage(err) ?? "Couldn't reorder the items.");
    }
  };

  const toggleFulfilled = async (item: OrganizerWishlistItem) => {
    try {
      await setFulfilled({
        eventId,
        itemId: item.id,
        fulfilled: !item.fulfilledAt,
      }).unwrap();
    } catch (err) {
      toast.error(apiErrorMessage(err) ?? "Couldn't update the item.");
    }
  };

  const remove = async (item: OrganizerWishlistItem) => {
    const hasGifts = item.confirmedCount + item.pendingCount > 0;
    const prompt = hasGifts
      ? `Remove "${item.name}"? Guests have already given to it. Their gifts stay in your list.`
      : `Remove "${item.name}"?`;
    if (!window.confirm(prompt)) return;
    try {
      await deleteItem({ eventId, itemId: item.id }).unwrap();
      toast.success("Item removed");
    } catch (err) {
      toast.error(apiErrorMessage(err) ?? "Couldn't remove the item.");
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Items</p>
        <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
          <Plus className="mr-1 h-4 w-4" />
          Add item
        </Button>
      </div>

      {wishlist.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No items yet. Add what you&apos;d love to receive, or a &quot;just
          give&quot; item with no price.
        </p>
      ) : (
        <ul className="space-y-2">
          {wishlist.items.map((item, index) => (
            <li key={item.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium leading-tight">
                    {item.name}
                    {item.fulfilledAt && (
                      <Badge className="ml-2 bg-green-500/10 text-green-600 text-xs">
                        Fulfilled
                      </Badge>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatMoney(item.confirmedTotal, wishlist.currency)}{" "}
                    {item.price !== null
                      ? `of ${formatMoney(item.price, wishlist.currency)}`
                      : "given (just give)"}
                    {item.pendingCount > 0 &&
                      ` · ${formatMoney(item.pendingTotal, wishlist.currency)} waiting`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <div className="flex flex-col">
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Move up"
                      disabled={index === 0 || isReordering}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronUp />
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Move down"
                      disabled={
                        index === wishlist.items.length - 1 || isReordering
                      }
                      onClick={() => move(index, 1)}
                    >
                      <ChevronDown />
                    </Button>
                  </div>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={item.fulfilledAt ? "Reopen" : "Mark as fulfilled"}
                    title={item.fulfilledAt ? "Reopen" : "Mark as fulfilled"}
                    onClick={() => toggleFulfilled(item)}
                  >
                    {item.fulfilledAt ? (
                      <RotateCcw className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() => setEditing(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Remove"
                    onClick={() => remove(item)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ItemDialog
        key={editing === null ? "closed" : editing === "new" ? "new" : editing.id}
        eventId={eventId}
        currency={wishlist.currency}
        item={editing}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}

function ItemDialog({
  eventId,
  currency,
  item,
  onClose,
}: {
  eventId: string;
  currency: string;
  item: OrganizerWishlistItem | "new" | null;
  onClose: () => void;
}) {
  const isNew = item === "new";
  const [createItem, createState] = useCreateWishlistItemMutation();
  const [updateItem, updateState] = useUpdateWishlistItemMutation();
  const isSaving = createState.isLoading || updateState.isLoading;

  // The parent keys this dialog by item, so these seed fresh for each one.
  const existing = item === "new" || item === null ? null : item;
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [isJustGive, setIsJustGive] = useState(
    existing ? existing.price === null : false,
  );
  const [price, setPrice] = useState(existing?.price ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    existing?.imageUrl ?? null,
  );
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [uploadIntent] = useUploadIntentMutation();
  const isUploading = uploadPct !== null;

  const handleImage = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.warning("Please upload a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.warning("Image must be 5 MB or less.");
      return;
    }
    setUploadPct(0);
    try {
      const intent = await uploadIntent({
        filename: file.name,
        contentType: file.type,
        folder: "wishlist",
      }).unwrap();
      await uploadFileToCDN(file, intent.data.uploadUrl, setUploadPct);
      setImageUrl(intent.data.fileUrl);
    } catch {
      toast.error("Image upload failed. Please try again.");
    } finally {
      setUploadPct(null);
    }
  };

  const priceNumber = Number(price);
  const isValid =
    name.trim().length > 0 &&
    (isJustGive || (Number.isFinite(priceNumber) && priceNumber > 0));

  const save = async () => {
    if (!isValid || item === null) return;
    const body = {
      name: name.trim(),
      description: description.trim() || undefined,
      // null on an edit clears a removed photo.
      imageUrl,
      price: isJustGive ? null : priceNumber,
    };
    try {
      if (isNew) await createItem({ eventId, ...body }).unwrap();
      else await updateItem({ eventId, itemId: item.id, ...body }).unwrap();
      toast.success(isNew ? "Item added" : "Item updated");
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err) ?? "Couldn't save the item.");
    }
  };

  return (
    <Dialog open={item !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95%] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add item" : "Edit item"}</DialogTitle>
          <DialogDescription>
            Prices are in {currency}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wl-item-name">Name</Label>
            <Input
              id="wl-item-name"
              value={name}
              maxLength={150}
              onChange={(e) => setName(e.target.value)}
              placeholder="Stand mixer"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wl-item-desc">Description (optional)</Label>
            <Textarea
              id="wl-item-desc"
              value={description}
              maxLength={1000}
              rows={2}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
            <div>
              <p className="text-sm font-medium">Just give</p>
              <p className="text-xs text-muted-foreground">
                No price. Guests give any amount.
              </p>
            </div>
            <Switch checked={isJustGive} onCheckedChange={setIsJustGive} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wl-item-image">Photo (optional)</Label>
            <div className="flex items-center gap-3">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="h-14 w-14 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <Input
                  id="wl-item-image"
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  disabled={isUploading}
                  onChange={(e) => handleImage(e.target.files?.[0])}
                />
                {isUploading && (
                  <p className="text-xs text-muted-foreground">
                    Uploading… {uploadPct}%
                  </p>
                )}
                {imageUrl && !isUploading && (
                  <button
                    type="button"
                    className="self-start text-xs text-destructive"
                    onClick={() => setImageUrl(null)}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>
          {!isJustGive && (
            <div className="space-y-1.5">
              <Label htmlFor="wl-item-price">Price ({currency})</Label>
              <Input
                id="wl-item-price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          )}
          <Button className="w-full" disabled={!isValid || isSaving} onClick={save}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNew ? "Add item" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Contribution review ────────────────────────────────────────────────────

const FILTERS: { value: ContributionStatus; label: string }[] = [
  { value: "PENDING", label: "To confirm" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "REJECTED", label: "Rejected" },
];

function ContributionQueue({
  eventId,
  currency,
}: {
  eventId: string;
  currency: string;
}) {
  const [status, setStatus] = useState<ContributionStatus>("PENDING");
  const [page, setPage] = useState(1);
  const { data, isFetching } = useGetContributionsQuery({
    eventId,
    status,
    page,
  });
  const [review, { isLoading: isReviewing, originalArgs }] =
    useReviewContributionMutation();

  const act = async (
    contributionId: string,
    next: Exclude<ContributionStatus, "PENDING">,
  ) => {
    try {
      await review({ eventId, contributionId, status: next }).unwrap();
      toast.success(next === "CONFIRMED" ? "Gift confirmed" : "Gift rejected");
    } catch (err) {
      toast.error(apiErrorMessage(err) ?? "Couldn't update the gift.");
    }
  };

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">Gifts</p>
        <p className="text-xs text-muted-foreground">
          Check each one against your bank app before confirming. Only
          confirmed gifts count and show to guests.
        </p>
      </div>

      <div className="flex gap-1">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={status === f.value ? "default" : "ghost"}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {!data && isFetching ? (
        <Skeleton className="h-20 w-full" />
      ) : !data || data.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here.</p>
      ) : (
        <ul className="space-y-2">
          {data.data.map((c) => {
            const busy = isReviewing && originalArgs?.contributionId === c.id;
            return (
              <li key={c.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium leading-tight">
                      {c.name}
                      {c.isAnonymous && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Anonymous to guests
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.item.name}
                      {c.item.deletedAt && " (removed)"}
                      {c.email && ` · ${c.email}`}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold">
                    {formatMoney(c.amount, currency)}
                  </p>
                </div>
                {c.message && (
                  <p className="text-sm text-muted-foreground">
                    &ldquo;{c.message}&rdquo;
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  {c.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => act(c.id, "REJECTED")}
                    >
                      <X className="mr-1 h-4 w-4" />
                      {c.status === "CONFIRMED" ? "Undo" : "Not received"}
                    </Button>
                  )}
                  {c.status !== "CONFIRMED" && (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => act(c.id, "CONFIRMED")}
                    >
                      {busy ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-1 h-4 w-4" />
                      )}
                      Received
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data && (page > 1 || data.meta.hasNext) && (
        <div className={cn("flex", page > 1 ? "justify-between" : "justify-end")}>
          {page > 1 && (
            <Button size="sm" variant="ghost" onClick={() => setPage((p) => p - 1)}>
              Newer
            </Button>
          )}
          {data.meta.hasNext && (
            <Button size="sm" variant="ghost" onClick={() => setPage((p) => p + 1)}>
              Older
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
