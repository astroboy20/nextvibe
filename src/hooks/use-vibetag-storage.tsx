"use client";

import { useGetVibeTagsQuery, useCreateVibeTagMutation } from "@/app/provider/api/eventApi";

export interface VibeTag {
  id: string;
  name: string;
  design_url: string;
  phase: string;
  eventId?: string;
  is_active: boolean;
  createdAt?: string;
}

/**
 * Hook for managing VibeTag data via RTK Query.
 * Replaces the old Supabase-based implementation.
 */
export function useVibeTagStorage(eventId?: string) {
  const {
    data: vibeTagsData,
    isLoading: isLoadingVibeTags,
    refetch: refetchVibeTags,
  } = useGetVibeTagsQuery(eventId ?? "", { skip: !eventId });

  const [createVibeTagMutation, { isLoading: isSaving }] = useCreateVibeTagMutation();

  const vibeTags: VibeTag[] = vibeTagsData?.data ?? [];

  const saveVibeTag = async ({
    name,
    phase,
    eventId: evtId,
    imagekey,
  }: {
    name: string;
    phase: string;
    eventId?: string;
    imagekey?: string;
  }) => {
    try {
      const result = await createVibeTagMutation({
        eventId: evtId,
        name,
        imagekey: imagekey ?? "",
      }).unwrap();
      return result?.data ?? null;
    } catch (err) {
      console.error("Failed to save VibeTag:", err);
      return null;
    }
  };

  return {
    vibeTags,
    isLoadingVibeTags,
    isSaving,
    saveVibeTag,
    refetchVibeTags,
  };
}
