"use client";

import { useState } from "react";
import {
  useGetUsersQuery,
  useToggleUserBanMutation,
  useUpdateUserRoleMutation,
} from "@/app/provider/api/admin";
import type { IAdminUser } from "@/app/provider/api/admin";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
  ShieldBan,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const ROLES = ["USER", "ORGANIZER", "SPONSOR", "ADMIN", "SUPER_ADMIN"] as const;

function TableSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 border-b last:border-0">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
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

function Avatar({ user }: { user: IAdminUser }) {
  const name = user.displayName ?? user.username ?? "?";
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={name}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
      {name[0].toUpperCase()}
    </div>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const queryParams = {
    page,
    limit: PAGE_SIZE,
    ...(roleFilter !== "all" ? { role: roleFilter } : {}),
  };

  const { data: result, isLoading, isError } = useGetUsersQuery(queryParams);
  const [toggleBan, { isLoading: banning }] = useToggleUserBanMutation();
  const [updateRole, { isLoading: updatingRole }] = useUpdateUserRoleMutation();

  const [banTarget, setBanTarget] = useState<{ id: string; isBanned: boolean; name: string } | null>(null);
  const [roleTarget, setRoleTarget] = useState<{ id: string; currentRole: string; name: string } | null>(null);
  const [newRole, setNewRole] = useState("");

  const users = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  // client-side search within current page
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.displayName ?? "").toLowerCase().includes(q) ||
      (u.username ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q)
    );
  });

  const handleBanToggle = async () => {
    if (!banTarget) return;
    try {
      await toggleBan(banTarget.id).unwrap();
      toast.success(banTarget.isBanned ? `${banTarget.name} unbanned` : `${banTarget.name} banned`);
    } catch {
      toast.error("Failed to update ban status");
    } finally {
      setBanTarget(null);
    }
  };

  const handleRoleUpdate = async () => {
    if (!roleTarget || !newRole) return;
    try {
      await updateRole({ id: roleTarget.id, role: newRole }).unwrap();
      toast.success(`Role updated for ${roleTarget.name}`);
    } catch {
      toast.error("Failed to update role");
    } finally {
      setRoleTarget(null);
      setNewRole("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage all users on the platform.
          </p>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
            <Users className="w-4 h-4" />
            <span>{total.toLocaleString()} total users</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
          <CardTitle>All Users</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Role filter */}
            <Select
              value={roleFilter}
              onValueChange={(v) => { setRoleFilter(v); setPage(1); }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <p className="text-center text-muted-foreground py-8">Failed to load users.</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={search ? "No matching users" : "No users yet"}
              description={search ? "Try a different search term." : "Users will appear here once they register."}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left py-3 pr-4 font-medium">User</th>
                      <th className="text-left py-3 pr-4 font-medium">Role</th>
                      <th className="text-left py-3 pr-4 font-medium">Verified</th>
                      <th className="text-left py-3 pr-4 font-medium">Joined</th>
                      <th className="text-left py-3 pr-4 font-medium">Status</th>
                      <th className="text-left py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <Avatar user={user} />
                            <div>
                              <div className="font-medium">
                                {user.displayName ?? user.username}
                              </div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={roleBadgeVariant(user.role)}>
                            {user.role ?? "—"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          {user.isEmailVerified ? (
                            <span className="text-emerald-600 text-xs font-medium">✓ Verified</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unverified</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {user.isBanned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" asChild title="View details">
                              <Link href={`/admin/users/${user.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title={user.isBanned ? "Unban user" : "Ban user"}
                              className={
                                user.isBanned
                                  ? "text-emerald-600 hover:text-emerald-700"
                                  : "text-destructive hover:text-destructive"
                              }
                              onClick={() =>
                                setBanTarget({
                                  id: user.id,
                                  isBanned: user.isBanned,
                                  name: user.displayName ?? user.username,
                                })
                              }
                            >
                              {user.isBanned ? (
                                <ShieldCheck className="w-4 h-4" />
                              ) : (
                                <ShieldBan className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Change role"
                              onClick={() => {
                                setRoleTarget({
                                  id: user.id,
                                  currentRole: user.role ?? "",
                                  name: user.displayName ?? user.username,
                                });
                                setNewRole(user.role ?? "");
                              }}
                            >
                              <UserCog className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Ban confirmation */}
      <AlertDialog open={!!banTarget} onOpenChange={(open) => !open && setBanTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banTarget?.isBanned
                ? `Unban ${banTarget?.name}?`
                : `Ban ${banTarget?.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banTarget?.isBanned
                ? "The user will regain full access to the platform."
                : "The user will immediately lose access to the platform."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                banTarget?.isBanned
                  ? ""
                  : "bg-destructive text-white hover:bg-destructive/90"
              }
              onClick={handleBanToggle}
              disabled={banning}
            >
              {banning
                ? "Updating..."
                : banTarget?.isBanned
                ? "Yes, unban"
                : "Yes, ban"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role update dialog */}
      <AlertDialog open={!!roleTarget} onOpenChange={(open) => !open && setRoleTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Role — {roleTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Current role:{" "}
              <strong>{roleTarget?.currentRole || "None"}</strong>
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
