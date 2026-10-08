"use client";

import { memo } from "react";
import { ChevronLeft } from "lucide-react";

interface PostcardHeaderProps {
  title: string;
  onClose: () => void;
  onAdd?: () => void;
  onFilter?: () => void;
}

export const PostcardHeader = memo(function PostcardHeader({
  title,
  onClose,
}: PostcardHeaderProps) {
  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#090D0F] px-4 text-white">
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
    </header>
  );
});

export default PostcardHeader;
