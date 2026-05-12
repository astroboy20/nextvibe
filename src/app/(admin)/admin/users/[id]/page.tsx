"use client";

import { use, useState } from "react";
import {
  useGetUserDetailQuery,
  useToggleUserBanMutation,
  useUpdateUserRoleMutation,
} from "@/app/provider/api/admin";
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
  ArrowLeft,
  ShieldBan,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  UserCog,
  Image,
  Ticket,
  Gamepad2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

const ROLES = ["USER", "ORGANIZER", "SPONSOR", "ADMIN", "SUPER_ADMIN"] as const;

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return format(new Date(d), "MMM d, yyyy");
}

function roleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  switch (role?.toUpperCase()) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "default";
    case "ORGANIZER":
    case "SPONSOR":
      return "secondary";
    default:
      return "outline";
  }
}

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: user, isLoading, isError } = useGetUserDetailQuery(id);
  const [toggleBan, { isLoading: banning }] = useToggleUserBanMutation();
  const [updateRole, { isLoading: updatingRole }] = useUpdateUserRoleMutation();

  const [showBan, setShowBan] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [newRole, setNewRole] = useState("");

  const handleBanToggle = async () => {
    try {
      await toggleBan(id).unwrap();
      toast.success(user?.isBanned ? "User unbanned" : "User banned");
    } catch {
      toast.error("Failed to update ban status");
    } finally {
      setShowBan(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!newRole) return;
    try {
      await updateRole({ id, role: newRole }).unwrap();
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    } finally {
      setShowRole(false);
      setNewRole("");
    }
  };

  const displayName = user?.displayName ?? user?.username ?? "User";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Failed to load user details.
          </CardContent>
        </Card>
      ) : user ? (
        <>
          {/* Profile card */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl">{displayName}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant={roleBadgeVariant(user.role)}>
                      {user.role ?? "—"}
                    </Badge>
                    {user.isBanned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                    {user.isEmailVerified && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewRole(user.role ?? "");
                    setShowRole(true);
                  }}
                >
                  <UserCog className="w-4 h-4 mr-1" /> Change Role
                </Button>
                <Button
                  variant={user.isBanned ? "outline" : "destructive"}
                  size="sm"
                  onClick={() => setShowBan(true)}
                >
                  {user.isBanned ? (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-1" /> Unban
                    </>
                  ) : (
                    <>
                      <ShieldBan className="w-4 h-4 mr-1" /> Ban
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Username
                  </p>
                  <p className="font-medium">@{user.username ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="font-medium">{user.phone ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    OAuth Provider
                  </p>
                  <p className="font-medium">{user.oauthProvider ?? "Email / Password"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined
                  </p>
                  <p className="font-medium">{fmtDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Last Updated
                  </p>
                  <p className="font-medium">{fmtDate(user.updatedAt)}</p>
                </div>
                {user.isBanned && user.bannedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Banned At
                    </p>
                    <p className="font-medium text-destructive">{fmtDate(user.bannedAt)}</p>
                  </div>
                )}
                {user.bio && (
                  <div className="col-span-full">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      Bio
                    </p>
                    <p className="font-medium">{user.bio}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Aggregate counts */}
          {user.counts && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Ticket className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Purchases</p>
                    <p className="text-xl font-bold tabular-nums">{user.counts.purchases ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(195_100%_42%/0.12)] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[hsl(195,100%,38%)]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Events</p>
                    <p className="text-xl font-bold tabular-nums">{user.counts.events ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(330_70%_55%/0.12)] flex items-center justify-center shrink-0">
                    <Image className="w-5 h-5 text-[hsl(330,70%,50%)]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Postcards</p>
                    <p className="text-xl font-bold tabular-nums">{user.counts.postcards ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent postcards */}
          {user.recentPostcards && user.recentPostcards.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="w-4 h-4" /> Recent Postcards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {user.recentPostcards.map((p: any) => (
                    <div key={p.id} className="rounded-lg border overflow-hidden">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt="Postcard"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-[4/3] w-full bg-muted flex items-center justify-center">
                          <Image className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground p-2 truncate">
                        {fmtDate(p.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent purchases */}
          {user.recentPurchases && user.recentPurchases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Ticket className="w-4 h-4" /> Recent Purchases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.recentPurchases.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{p.event?.title ?? p.eventTitle ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">{fmtDate(p.createdAt)}</p>
                      </div>
                      <p className="font-semibold">{p.amount ? `$${p.amount}` : "—"}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      {/* Ban dialog */}
      <AlertDialog open={showBan} onOpenChange={setShowBan}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user?.isBanned ? "Unban this user?" : "Ban this user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user?.isBanned
                ? "The user will regain access to the platform."
                : "The user will lose access to the platform immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                user?.isBanned ? "" : "bg-destructive text-white hover:bg-destructive/90"
              }
              onClick={handleBanToggle}
              disabled={banning}
            >
              {banning
                ? "Updating..."
                : user?.isBanned
                ? "Yes, unban"
                : "Yes, ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role dialog */}
      <AlertDialog open={showRole} onOpenChange={setShowRole}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Current role: <strong>{user?.role ?? "—"}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-1 py-2">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleUpdate}
              disabled={updatingRole || !newRole}
            >
              {updatingRole ? "Updating..." : "Update Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
