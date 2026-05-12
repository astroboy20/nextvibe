"use client";

import { useState } from "react";
import { useGetGameSessionsQuery } from "@/app/provider/api/admin";
import type { IAdminGameSession } from "@/app/provider/api/admin";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Gamepad2,
  Users,
  Trophy,
} from "lucide-react";
import { format } from "date-fns";

const PAGE_SIZE = 20;

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return format(new Date(d), "MMM d, yyyy");
}

function TableSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-3 border-b last:border-0">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toLowerCase()) {
    case "active":
    case "in_progress":
      return "default";
    case "completed":
      return "secondary";
    case "abandoned":
      return "destructive";
    default:
      return "outline";
  }
}

export default function GameSessionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: result, isLoading, isError } = useGetGameSessionsQuery({ page, limit: PAGE_SIZE });

  const sessions = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  const filtered = sessions.filter((s: IAdminGameSession) => {
    const q = search.toLowerCase();
    return (
      (s.user?.displayName ?? s.user?.username ?? "").toLowerCase().includes(q) ||
      (s.event?.title ?? "").toLowerCase().includes(q) ||
      (s.gameType ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Game Sessions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All game sessions across the platform.
          </p>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
            <Gamepad2 className="w-4 h-4" />
            <span>{total.toLocaleString()} total sessions</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>All Sessions</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search user, event, type..."
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
            <p className="text-center text-muted-foreground py-8">
              Failed to load game sessions.
            </p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={search ? "No matching sessions" : "No game sessions yet"}
              description="Game sessions will appear here once users start playing."
              icon={<Gamepad2 className="w-12 h-12 text-muted-foreground" />}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left py-3 pr-4 font-medium">User</th>
                      <th className="text-left py-3 pr-4 font-medium">Event</th>
                      <th className="text-left py-3 pr-4 font-medium">Game Type</th>
                      <th className="text-right py-3 pr-4 font-medium">
                        <span className="flex items-center justify-end gap-1">
                          <Trophy className="w-3.5 h-3.5" /> Score
                        </span>
                      </th>
                      <th className="text-right py-3 pr-4 font-medium">
                        <span className="flex items-center justify-end gap-1">
                          <Users className="w-3.5 h-3.5" /> Players
                        </span>
                      </th>
                      <th className="text-left py-3 pr-4 font-medium">Started</th>
                      <th className="text-left py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((session: IAdminGameSession) => (
                      <tr
                        key={session.id}
                        className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="font-medium">
                            {session.user?.displayName ??
                              session.user?.username ??
                              "—"}
                          </div>
                          {session.user?.email && (
                            <div className="text-xs text-muted-foreground">
                              {session.user.email}
                            </div>
                          )}
                        </td>
                        <td className="py-3 pr-4 max-w-[180px]">
                          <span className="truncate block">
                            {session.event?.title ?? "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {session.gameType ? (
                            <Badge variant="outline" className="text-xs capitalize">
                              {session.gameType}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium">
                          {session.score ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">
                          {session.participantCount ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {fmtDate(session.createdAt)}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusVariant(session.status)}>
                            {session.status ?? "—"}
                          </Badge>
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
    </div>
  );
}
