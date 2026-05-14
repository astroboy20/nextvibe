"use client";

import { useState } from "react";
import { useGetPostcardsQuery } from "@/app/provider/api/admin";
import type { IAdminPostcard } from "@/app/provider/api/admin";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Search, ImageIcon, Heart, MessageCircle } from "lucide-react";
import { format } from "date-fns";

const PAGE_SIZE = 20;

function fmtDate(d?: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "MMM d, yyyy"); } catch { return "—"; }
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function PostcardsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: result, isLoading, isError } = useGetPostcardsQuery({ page, limit: PAGE_SIZE });

  // Real API fields: id, caption, visibility, likeCount, commentCount, createdAt,
  //                  author.{ id, username, displayName }, event.{ id, name }
  const postcards = result?.data ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  const filtered = postcards.filter((p: IAdminPostcard) => {
    const q = search.toLowerCase();
    return (
      (p.author?.displayName ?? p.author?.username ?? "").toLowerCase().includes(q) ||
      (p.event?.name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Postcards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All postcards uploaded on the platform.</p>
        </div>
        {!isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="font-medium">{total.toLocaleString()} total postcards</span>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle>All Postcards</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by user or event..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <GridSkeleton />
          ) : isError ? (
            <p className="text-center text-muted-foreground py-8">Failed to load postcards.</p>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={search ? "No matching postcards" : "No postcards yet"}
              description="Postcards uploaded by users will appear here."
              icon={<ImageIcon className="w-12 h-12 text-muted-foreground" />}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((postcard: IAdminPostcard) => (
                  <div key={postcard.id} className="rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                    {/* Placeholder thumbnail — API doesn't return imageUrl in list */}
                    <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-medium truncate">
                        {postcard.author?.displayName ?? postcard.author?.username ?? "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {postcard.event?.name ?? "No event"}
                      </p>
                      {postcard.caption && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{postcard.caption}</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs text-muted-foreground">{fmtDate(postcard.createdAt)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Heart className="w-3 h-3" />{postcard.likeCount ?? 0}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MessageCircle className="w-3 h-3" />{postcard.commentCount ?? 0}
                          </span>
                        </div>
                      </div>
                      <Badge variant={postcard.visibility === "PUBLIC" ? "secondary" : "outline"} className="text-xs">
                        {postcard.visibility ?? "PUBLIC"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
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
