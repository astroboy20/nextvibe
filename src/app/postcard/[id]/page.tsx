"use client";

import { use } from "react";
import { useGetPostcardQuery } from "@/app/provider/api/eventApi";
import { Skeleton } from "@/components/ui/skeleton";
import { PostcardViewer } from "@/components/postcard-viewer";

export default function PostcardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: response, isLoading } = useGetPostcardQuery(id!, {
    skip: !id,
  });

  const postcard = response?.data ?? response;

  const dashboardUrl =
    typeof window !== "undefined"
      ? window.location.hostname === "localhost"
        ? "http://localhost:3000/dashboard/events"
        : `${window.location.origin}/dashboard/events`
      : "/dashboard/events";

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col gap-4 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        <Skeleton className="flex-1 rounded-2xl" />
      </div>
    );
  }

  if (!postcard) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Postcard not found.</p>
      </div>
    );
  }

  return (
    <PostcardViewer
      postcard={postcard}
      eventId={postcard.eventId ?? ""}
      eventName={postcard.event?.name ?? ""}
      onClose={() => {
        window.location.href = dashboardUrl;
      }}
    />
  );
}