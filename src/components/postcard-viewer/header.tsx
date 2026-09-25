"use client";

import { memo } from "react";
import { ChevronLeft, Plus, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostcardHeaderProps {
  title: string;
  onClose: () => void;
  onAdd?: () => void;
  onFilter?: () => void;
}

export const PostcardHeader = memo(function PostcardHeader({
  title,
  onClose,
  onAdd,
  onFilter,
}: PostcardHeaderProps) {
  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#090D0F] px-4 text-white">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close postcard viewer"
        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:scale-95"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <h1 className="max-w-[55%] truncate text-[17px] font-semibold tracking-[-0.01em]">
        {title || "Postcards"}
      </h1>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add postcard"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:scale-95",
            !onAdd && "opacity-80"
          )}
        >
          <Plus className="h-7 w-7" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={onFilter}
          aria-label="Filter postcards"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:scale-95",
            !onFilter && "opacity-80"
          )}
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
});

export default PostcardHeader;
