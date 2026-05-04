"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Loader2, Info } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Vibetags from "./vibetag/vibetags";
import { useGetVibeTagsQuery, useGetEventDetailsQuery } from "@/app/provider/api/eventApi";
import { useDispatch } from "react-redux";
import { setView, setTemplate } from "@/app/provider/slices/canvas-slice";

type ActivityTiming = "PRE_EVENT" | "DURING_EVENT" | "POST_EVENT" | "BOTH";

const TIMING_TABS: { value: ActivityTiming; label: string }[] = [
  { value: "PRE_EVENT",    label: "Pre-Event"  },
  { value: "DURING_EVENT", label: "Main Event" },
  { value: "POST_EVENT",   label: "Post-Event" },
  { value: "BOTH",         label: "Both"       },
];

interface VibeTagStudioContentProps {
  eventId: string;
  name?: string;
  vibeTag?: any;
}

const VibeTagStudioContent = ({ eventId, name }: VibeTagStudioContentProps) => {
  const dispatch = useDispatch();
  const [activeTiming, setActiveTiming] = useState<ActivityTiming>("PRE_EVENT");
  const [open, setOpen] = useState(false);

  const handleOpenCreate = () => {
    dispatch(setView("start"));
    dispatch(setTemplate(null));
    setOpen(true);
  };

  const { data, isLoading, refetch } = useGetVibeTagsQuery(
    { eventId },
    { skip: !eventId, refetchOnMountOrArgChange: true }
  );

  const { refetch: refetchEvent } = useGetEventDetailsQuery(eventId, { skip: !eventId });

  const allVibeTags: any[] = (data?.data ?? []).filter(
    (t: any) => t.eventId === eventId
  );

  const hasPreEvent    = allVibeTags.some((t) => t.activityTiming === "PRE_EVENT");
  const hasDuringEvent = allVibeTags.some((t) => t.activityTiming === "DURING_EVENT");

  // "Both" covers PRE_EVENT + DURING_EVENT — if the user already has both
  // individual tags, creating a BOTH tag is redundant, so disable it.
  const isBothDisabled = hasPreEvent && hasDuringEvent;

  // Find the tag that matches the currently active timing exactly
  const existingTag = allVibeTags.find(
    (t: any) => t.activityTiming === activeTiming
  ) ?? null;

  const handleCreated = () => {
    setOpen(false);
    refetch();
    refetchEvent();
  };

  return (
    <>
      {/* Timing tabs */}
      <Tabs
        value={activeTiming}
        onValueChange={(v) => setActiveTiming(v as ActivityTiming)}
        className="mb-4"
      >
        <TabsList className="w-full grid grid-cols-4 h-9">
          {TIMING_TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-[11px]"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Both tab — explain it's covered by the two individual tags */}
      {activeTiming === "BOTH" && isBothDisabled && (
        <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 px-2.5 py-2 mb-3">
          <Info className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
            You already have Pre-Event &amp; Main Event VibeTags — those cover both phases, so a separate <span className="font-medium">Both</span> tag isn&apos;t needed.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : existingTag ? (
          /* ── Existing tag for this timing ── */
          <div className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="h-12 w-10 rounded-lg shrink-0 overflow-hidden bg-muted border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={existingTag.imageUrl}
                alt={existingTag.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-sm truncate">{existingTag.name}</h4>
                <Badge
                  variant="outline"
                  className="border-[#531342]/50 text-[#531342] text-[10px]"
                >
                  {TIMING_TABS.find((t) => t.value === activeTiming)?.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Applied to postcards for this phase
              </p>
            </div>
          </div>
        ) : (
          /* ── No tag yet for this timing ── */
          <>
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                No VibeTag for{" "}
                <span className="font-medium">
                  {TIMING_TABS.find((t) => t.value === activeTiming)?.label}
                </span>{" "}
                yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                Create one to stamp this phase&apos;s identity on every postcard
              </p>
            </div>
            <Button
              size="sm"
              className="w-full gap-1.5 rounded-xl bg-[#531342] hover:bg-[#531342]/90 text-white"
              onClick={handleOpenCreate}
              disabled={activeTiming === "BOTH" && isBothDisabled}
            >
              <Tag className="h-3.5 w-3.5" />
              Create VibeTag for{" "}
              {TIMING_TABS.find((t) => t.value === activeTiming)?.label}
            </Button>
          </>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg h-screen overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>
              Create VibeTag —{" "}
              {TIMING_TABS.find((t) => t.value === activeTiming)?.label}
            </DialogTitle>
          </DialogHeader>
          <Vibetags
            onClose={handleCreated}
            activityTiming={activeTiming}
            eventId={eventId}
            eventName={name}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VibeTagStudioContent;

