"use client";

import { useState } from "react";
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponDetailQuery,
} from "@/app/provider/api/admin";
import type {
  IAdminCoupon,
  IAdminCouponDetail,
  IAdminCouponRedemption,
  ICreateAdminCouponInput,
} from "@/app/provider/api/admin";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Search,
  Eye,
  Copy,
  Check,
  Users,
  Calendar,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// ── helpers ──────────────────────────────────────────────────────────────────

function couponStatus(coupon: IAdminCoupon) {
  if (!coupon.isActive) return "inactive";
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return "expired";
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return "maxed";
  return "active";
}

function StatusBadge({ coupon }: { coupon: IAdminCoupon }) {
  const s = couponStatus(coupon);
  if (s === "active") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>;
  if (s === "expired") return <Badge variant="secondary">Expired</Badge>;
  if (s === "maxed") return <Badge variant="secondary">Limit reached</Badge>;
  return <Badge variant="destructive">Inactive</Badge>;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return format(new Date(d), "MMM d, yyyy");
}

// ── skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-2">
          <Skeleton className="h-5 w-28 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

// ── create form defaults ──────────────────────────────────────────────────────

const emptyCreateForm = {
  code: "",
  discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  discountValue: "",
  usageLimit: "",
  expiresAt: "",
  description: "",
};

// ── coupon detail sheet ───────────────────────────────────────────────────────

function CouponDetailSheet({
  couponId,
  open,
  onClose,
}: {
  couponId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useGetCouponDetailQuery(couponId ?? "", {
    skip: !couponId,
  });

  const coupon = data as IAdminCouponDetail | undefined;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Coupon Detail</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : !coupon ? (
          <p className="text-muted-foreground text-sm">Failed to load coupon.</p>
        ) : (
          <div className="space-y-6 px-5">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-primary/5 p-4">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <BarChart2 className="w-3 h-3 text-primary" /> Redemptions
                </p>
                <p className="text-2xl font-bold tabular-nums text-primary">{coupon.usageCount}</p>
                {coupon.usageLimit && (
                  <p className="text-xs text-muted-foreground">of {coupon.usageLimit} limit</p>
                )}
              </div>
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Expires
                </p>
                <p className="text-sm font-semibold">{fmtDate(coupon.expiresAt)}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Code</span>
                <code className="bg-muted px-2 py-0.5 rounded font-mono font-semibold text-xs">
                  {coupon.code}
                </code>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : `$${coupon.discountValue}`}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge coupon={coupon} />
              </div>
              {coupon.description && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Description</span>
                  <span className="text-right max-w-[60%]">{coupon.description}</span>
                </div>
              )}
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Created</span>
                <span>{fmtDate(coupon.createdAt)}</span>
              </div>
            </div>

            {/* Recent redemptions */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" /> Recent Redemptions
              </h3>
              {!coupon.payments || coupon.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg">
                  No redemptions yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {coupon.payments.map((r: IAdminCouponRedemption) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{r.organizer.displayName ?? r.organizer.email}</p>
                        {r.organizer.email && r.organizer.displayName && (
                          <p className="text-xs text-muted-foreground">{r.organizer.email}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-emerald-600">
                          −${r.couponDiscountAmount}
                        </p>
                        <p className="text-xs text-muted-foreground">{fmtDate(r.paidAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ── edit dialog ───────────────────────────────────────────────────────────────

function EditCouponDialog({
  coupon,
  open,
  onClose,
}: {
  coupon: IAdminCoupon | null;
  open: boolean;
  onClose: () => void;
}) {
  const [updateCoupon, { isLoading }] = useUpdateCouponMutation();

  const [form, setForm] = useState({
    isActive: coupon?.isActive ?? true,
    usageLimit: String(coupon?.usageLimit ?? ""),
    expiresAt: coupon?.expiresAt ? coupon.expiresAt.split("T")[0] : "",
    description: coupon?.description ?? "",
  });

  // Sync when coupon changes
  const syncedId = coupon?.id;
  if (coupon && coupon.id !== syncedId) {
    setForm({
      isActive: coupon.isActive,
      usageLimit: String(coupon.usageLimit ?? ""),
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      description: coupon.description ?? "",
    });
  }

  const handleSave = async () => {
    if (!coupon) return;
    const payload: any = {
      isActive: form.isActive,
      description: form.description || undefined,
    };
    if (form.usageLimit) payload.usageLimit = Number(form.usageLimit);
    if (form.expiresAt) payload.expiresAt = new Date(form.expiresAt).toISOString();

    try {
      await updateCoupon({ id: coupon.id, data: payload }).unwrap();
      toast.success("Coupon updated");
      onClose();
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit Coupon{" "}
            {coupon && (
              <code className="ml-1 text-sm bg-muted px-1.5 py-0.5 rounded font-mono">
                {coupon.code}
              </code>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Toggle to enable or disable this coupon
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-usageLimit">Usage Limit (optional)</Label>
            <Input
              id="edit-usageLimit"
              type="number"
              min="1"
              placeholder="Leave blank for unlimited"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-expiresAt">Expiry Date (optional)</Label>
            <Input
              id="edit-expiresAt"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Internal note about this coupon"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const emptyForm = { ...emptyCreateForm };

export default function CouponsPage() {
  const [page, setPage] = useState(1);
  const { data: result, isLoading, isError } = useGetCouponsQuery();
  const [createCoupon, { isLoading: creating }] = useCreateCouponMutation();
  const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [editCoupon, setEditCoupon] = useState<IAdminCoupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const coupons = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;

  const filtered = coupons.filter((c: IAdminCoupon) =>
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!form.code.trim()) {
      toast.error("Code is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }
    const discountValue = Number(form.discountValue);
    if (!discountValue || discountValue <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }
    if (form.discountType === "PERCENTAGE" && discountValue > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }
    if (!form.usageLimit || Number(form.usageLimit) <= 0) {
      toast.error("Usage limit is required and must be greater than 0");
      return;
    }
    if (!form.expiresAt) {
      toast.error("Expiry date is required");
      return;
    }

    // Build payload with all required fields
    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue,
      usageLimit: Number(form.usageLimit),
      expiresAt: new Date(form.expiresAt + "T23:59:59Z").toISOString(),
    };

    try {
      await createCoupon(payload).unwrap();
      toast.success("Coupon created successfully");
      setShowCreate(false);
      setForm(emptyForm);
    } catch (err: any) {
      toast.error(err?.data?.message ?? err?.message ?? "Failed to create coupon");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCoupon(deleteId).unwrap();
      toast.success("Coupon deactivated");
    } catch {
      toast.error("Failed to deactivate coupon");
    } finally {
      setDeleteId(null);
    }
  };

  // summary stats
  const total = result?.total ?? 0;
  const active = coupons.filter((c: IAdminCoupon) => couponStatus(c) === "active").length;
  const totalRedemptions = coupons.reduce(
    (sum: number, c: IAdminCoupon) => sum + (c.usageCount ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage discount coupon codes and track redemptions.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-(image:--vibe-gradient) text-white hover:opacity-90 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Coupon
        </Button>
      </div>

      {/* Summary stats */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Total Coupons</p>
              <p className="text-2xl font-bold tabular-nums">{total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Active</p>
              <p className="text-2xl font-bold tabular-nums text-emerald-600">{active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Total Redemptions</p>
              <p className="text-2xl font-bold tabular-nums text-primary">{totalRedemptions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>All Coupons</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by code..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <p className="text-center text-muted-foreground py-8">Failed to load coupons.</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={search ? "No matching coupons" : "No coupons yet"}
              description="Create a coupon code to offer discounts."
              icon={<Tag className="w-12 h-12 text-muted-foreground" />}
            />
          ) : (
            <>
              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left py-3 pr-4 font-medium">Code</th>
                      <th className="text-left py-3 pr-4 font-medium">Discount</th>
                      <th className="text-left py-3 pr-4 font-medium">Uses</th>
                      <th className="text-left py-3 pr-4 font-medium">Expires</th>
                      <th className="text-left py-3 pr-4 font-medium">Status</th>
                      <th className="text-left py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((coupon: IAdminCoupon) => (
                      <tr
                        key={coupon.id}
                        className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1.5">
                            <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono font-semibold">
                              {coupon.code}
                            </code>
                            <button
                              onClick={() => copyCode(coupon.code, coupon.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              title="Copy code"
                            >
                              {copiedId === coupon.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-45cate">
                              {coupon.description}
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-4 font-medium">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.discountValue}%`
                            : `$${coupon.discountValue}`}
                          <span className="ml-1 text-xs text-muted-foreground font-normal">
                            {coupon.discountType === "PERCENTAGE" ? "off" : "flat"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          <span className="font-medium text-foreground">{coupon.usageCount ?? 0}</span>
                          {coupon.usageLimit ? (
                            <span> / {coupon.usageLimit}</span>
                          ) : (
                            <span className="text-xs"> ∞</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {fmtDate(coupon.expiresAt)}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge coupon={coupon} />
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View detail"
                              onClick={() => setDetailId(coupon.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit"
                              onClick={() => setEditCoupon(coupon)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Deactivate"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(coupon.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="md:hidden space-y-4">
                {filtered.map((coupon: IAdminCoupon) => (
                  <Card key={coupon.id} className="p-4">
                    <div className="space-y-3">
                      {/* Code and copy button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono font-semibold">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => copyCode(coupon.code, coupon.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Copy code"
                          >
                            {copiedId === coupon.id ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <StatusBadge coupon={coupon} />
                      </div>

                      {/* Description */}
                      {coupon.description && (
                        <p className="text-sm text-muted-foreground">
                          {coupon.description}
                        </p>
                      )}

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Discount</p>
                          <p className="font-medium">
                            {coupon.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}%`
                              : `$${coupon.discountValue}`}
                            <span className="ml-1 text-xs text-muted-foreground font-normal">
                              {coupon.discountType === "PERCENTAGE" ? "off" : "flat"}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Uses</p>
                          <p className="font-medium">
                            {coupon.usageCount ?? 0}
                            {coupon.usageLimit ? (
                              <span className="text-muted-foreground"> / {coupon.usageLimit}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground"> / ∞</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Expires</p>
                          <p className="font-medium">{fmtDate(coupon.expiresAt)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setDetailId(coupon.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditCoupon(coupon)}
                        >
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-2">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Create dialog ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g. LAUNCH50"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g. Launch promo for early organizers"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Discount Type</Label>
              <Select
                value={form.discountType}
                onValueChange={(v: "PERCENTAGE" | "FIXED") =>
                  setForm({ ...form, discountType: v })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discountValue">
                Discount Value{" "}
                {form.discountType === "PERCENTAGE" ? "(%)" : "($)"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                placeholder={form.discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 10"}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min="1"
                placeholder="e.g. 100"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Expiry Date</Label>
              <Input
                id="expiresAt"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !form.code || !form.description || !form.discountValue || !form.usageLimit || !form.expiresAt}
            >
              {creating ? "Creating..." : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <EditCouponDialog
        coupon={editCoupon}
        open={!!editCoupon}
        onClose={() => setEditCoupon(null)}
      />

      {/* ── Detail sheet ── */}
      <CouponDetailSheet
        couponId={detailId}
        open={!!detailId}
        onClose={() => setDetailId(null)}
      />

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate this coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the coupon. Existing redemptions are unaffected, but users
              will no longer be able to apply it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deactivating..." : "Yes, deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
