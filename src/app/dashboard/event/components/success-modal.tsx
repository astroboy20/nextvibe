"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutDashboard, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

interface SuccessModalProps {
  eventId: string;
  onClose: () => void;
}

const SuccessModal = ({ eventId, onClose }: SuccessModalProps) => {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-[#5B1A57] px-6 pt-8 pb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-4 ring-white/20">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">
              Event Created Successfully!
            </h2>
            <p className="text-sm text-white/70 mt-0.5">
              What would you like to do next?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-6 flex flex-col gap-3">
          <Button
            onClick={() => router.push(`/dashboard/events`)}
            className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go Dashboard
          </Button>

          <Button
            onClick={() => router.push(`/dashboard/${eventId}`)}
            variant="outline"
            className="w-full h-11 rounded-xl font-medium border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57]/5 transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Continue Editing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
