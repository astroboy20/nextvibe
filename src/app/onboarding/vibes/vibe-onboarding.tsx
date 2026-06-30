"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { InterestSelector } from "@/app/(auth)/components/interest-selector";
import { useSaveUserVibesMutation } from "@/app/provider/api/discoverApi";

export default function VibeOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saveVibes, { isLoading }] = useSaveUserVibesMutation();

  // Where to go after completing onboarding — default /events
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("/auth")
      ? rawNext
      : "/events";

  const handleComplete = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one vibe to continue.");
      return;
    }

    try {
      await saveVibes({ tagIds: selectedIds }).unwrap();
      toast.success("Vibes saved! Your feed is now personalised 🎉");
      router.replace(next);
    } catch (err: any) {
      const msg =
        err?.data?.error?.message ??
        err?.message ??
        "Failed to save vibes. Please try again.";

      toast.error(msg);
    }
  };

  return (
    <InterestSelector onComplete={handleComplete} isSubmitting={isLoading} />
  );
}
