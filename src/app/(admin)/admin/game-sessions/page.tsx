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
import { ChevronLeft, ChevronRight, Search, Gamepad2 } from "lucide-react";
import { format } from "date-fns";

const PAGE_SIZE = 20;

function fmtDate(d?: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "MMM d, yyyy"); } catch { return "—"; }
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
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toUpperCase()) {
    case "ACTIVE": return "default";
    case "ENDED": return "secondary";
    case "PENDING": return "outline";
    case "CANCELLED": return "destructive";
    default: return "outline";
  }
}

export default function GameSessionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: result, isLoading, isError } = useGetGameSessionsQuery({ page, limit: PAGE_SIZE });

  // Real API fields: id, title, scheduleType, status, startsAt, endsAt, createdAt,
  //                  event.{ id, name, organizer.{ id, username } }, _count.{ sessionEntries, rounds }
  const sessions = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  const filtered = sessions.filter((s: IAdminGameSession) => {
    const q = search.toLowerCase();
    return (
      (s.title ?? "").toLowerCase().includes(q) ||
      (s.event?.name ?? "").toLowerCase().includes(q) ||
      (s.event?.organizer?.username ?? "").toLowerCase().includes(q) ||
      (s.scheduleType ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Game Sessions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All game sessions across the platform.</p>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="font-medium">{total.toLocaleString()} total sessions</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>All Sessions</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search title, event..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <p className="text-center text-muted-foreground py-8">Failed to load game sessions.</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={search ? "No matching sessions" : "No game sessions yet"}
              description="Game sessions will appear here once organizers create them."
              icon={<Gamepad2 className="w-12 h-12 text-muted-foreground" />}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left py-3 pr-4 font-medium">Title</th>
                      <th className="text-left py-3 pr-4 font-medium">Event</th>
                      <th className="text-left py-3 pr-4 font-medium">Organizer</th>
                      <th className="text-left py-3 pr-4 font-medium">Schedule</th>
                      <th className="text-right py-3 pr-4 font-medium">Rounds</th>
                      <th className="text-right py-3 pr-4 font-medium">Players</th>
                      <th className="text-left py-3 pr-4 font-medium">Created</th>
                      <th className="text-left py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((session: IAdminGameSession) => (
                      <tr key={session.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="py-3 pr-4 font-medium max-w-[140px] truncate">
                          {session.title ?? "—"}
                        </td>
                        <td className="py-3 pr-4 max-w-[160px] truncate text-muted-foreground">
                          {session.event?.name ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {session.event?.organizer?.username ?? "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {session.scheduleType ? (
                            <Badge variant="outline" className="text-xs capitalize">
                              {session.scheduleType.replace(/_/g, " ").toLowerCase()}
                            </Badge>
                          ) : "—"}
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">
                          {session._count?.rounds ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">
                          {session._count?.sessionEntries ?? "—"}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs whitespace-nowrap">
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

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-2">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
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
