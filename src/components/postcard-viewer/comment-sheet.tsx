/* eslint-disable @next/next/no-img-element */
"use client";

import { memo, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCommentOnPostcardMutation,
  useGetPostcardCommentsQuery,
} from "@/store/api/endpoints/postcards";
import type { CommentData } from "./types";

interface CommentSheetProps {
  postcardId: string;
  onClose: () => void;
}

export const CommentSheet = memo(function CommentSheet({
  postcardId,
  onClose,
}: CommentSheetProps) {
  const [body, setBody] = useState("");
  const [postComment, { isLoading: isPosting }] =
    useCommentOnPostcardMutation();
  const {
    data: commentsData,
    isLoading: loadingComments,
    refetch,
  } = useGetPostcardCommentsQuery(postcardId);

  const comments: CommentData[] = commentsData?.data ?? commentsData ?? [];

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || isPosting) return;

    setBody("");

    try {
      await postComment({ postcardId, content: trimmed }).unwrap();
      refetch();
    } catch {
      setBody(trimmed);
      toast.error("Could not post comment.");
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-base font-semibold">
          Comments {comments.length > 0 && `(${comments.length})`}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
          aria-label="Close comments"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {loadingComments ? (
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No comments yet. Be the first!
          </p>
        ) : (
          comments.map((comment) => {
            const name =
              comment.author?.displayName ?? comment.author?.username ?? "User";

            return (
              <div key={comment.id} className="flex gap-3">
                {comment.author?.avatarUrl ? (
                  <img
                    src={comment.author.avatarUrl}
                    alt={name}
                    loading="lazy"
                    decoding="async"
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                    {name[0]?.toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold">{name}</span>
                  <p className="mt-0.5 text-sm text-foreground">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-border bg-background px-4 py-3">
        <input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Add a comment…"
          className="min-w-0 flex-1 rounded-full border border-border bg-muted px-4 py-2 text-sm outline-none focus:border-primary"
          autoFocus
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!body.trim() || isPosting}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          aria-label="Post comment"
        >
          {isPosting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
});

export default CommentSheet;
