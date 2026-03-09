"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  Upload,
  Gamepad2,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  X,
} from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  nextStep,
  prevStep,
  selectEventFormData,
  updateData,
} from "@/app/provider/slices/eventformslice";
import { toast } from "sonner";
import DesignTemplate from "./design-templates";
import { SimplifiedGamificationForm } from "./simplified-gamification-form";

type ActivityTiming = "pre-event" | "during-event" | "both";
type ActiveMode = "pre-event" | "during-event" | "summary" | null;

const PRIMARY_COLOR = "#5B1A57";

const activityTimingOptions = [
  {
    name: "Pre-Event Activities",
    value: "pre-event" as ActivityTiming,
    description:
      "Set up games and vibe tags before the main event to engage attendees early.",
  },
  {
    name: "Main Event Activities",
    value: "during-event" as ActivityTiming,
    description:
      "Set up games and vibe tags during the main event to enhance attendee participation.",
  },
  {
    name: "Pre-Event & Main Event Activities",
    value: "both" as ActivityTiming,
    description:
      "Incorporate games and vibe tags both before and during the main event for maximum engagement.",
  },
];

export default function StepFour() {
  const dispatch = useDispatch();
  const data = useSelector(selectEventFormData);

  const [activeMode, setActiveMode] = useState<ActiveMode>(
    data.activityTiming === "both" || data.activityTiming === "pre-event"
      ? "pre-event"
      : data.activityTiming === "during-event"
      ? "during-event"
      : null
  );

  const [drawerOpen, setDrawerOpen] = useState(
    data.activityTiming === undefined || data.activityTiming === null
  );

  const [activityTiming, setActivityTiming] = useState<ActivityTiming | null>(
    (data.activityTiming as ActivityTiming) ?? null
  );

  const [activities, setActivities] = useState(
    data.activities ?? {
      preEvent: { games: null, vibetag: null },
      duringEvent: { games: null, vibetag: null },
    }
  );

  const handleConfirmActivityTiming = () => {
    if (!activityTiming) {
      toast.warning("Please select an activity timing option");
      return;
    }
    setActiveMode(
      activityTiming === "both" || activityTiming === "pre-event"
        ? "pre-event"
        : "during-event"
    );
    setDrawerOpen(false);
  };

  const handleNext = () => {
    dispatch(updateData({ activityTiming, activities }));
    dispatch(nextStep());
  };

  const handleBack = () => {
    if (activeMode === "during-event" && activityTiming === "both") {
      setActiveMode("pre-event");
    } else {
      dispatch(prevStep());
    }
  };

  const handleContinueFromPreEvent = () => {
    if (activityTiming === "both") setActiveMode("during-event");
    else setActiveMode("summary");
  };

  const handleContinueFromDuringEvent = () => setActiveMode("summary");

  return (
    <div className="relative">
      {activeMode === "pre-event" && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold text-[#5B1A57]">
            Pre-Event Activities
          </p>
          <ActivitySetup
            timing="pre-event"
            data={activities?.preEvent}
            onUpdate={(d) =>
              setActivities((prev: any) => ({ ...prev, preEvent: d }))
            }
            onBack={handleBack}
            onNext={handleContinueFromPreEvent}
          />
        </div>
      )}

      {activeMode === "during-event" && (
        <div className="flex flex-col gap-4">
          <p className="text-lg font-semibold text-[#5B1A57]">
            Main Event Activities
          </p>
          <ActivitySetup
            timing="during-event"
            data={activities?.duringEvent}
            onUpdate={(d) =>
              setActivities((prev: any) => ({ ...prev, duringEvent: d }))
            }
            onBack={handleBack}
            onNext={handleContinueFromDuringEvent}
          />
        </div>
      )}

      {activeMode === "summary" && (
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <p className="text-lg font-semibold text-[#5B1A57]">
              Activities Summary
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Review your activity setup before proceeding.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {activities?.preEvent && (
              <ActivitySummary
                title="Pre-Event Activities"
                data={activities.preEvent}
                onEdit={() => setActiveMode("pre-event")}
              />
            )}
            {activities?.duringEvent && (
              <ActivitySummary
                title="Main Event Activities"
                data={activities.duringEvent}
                onEdit={() => setActiveMode("during-event")}
              />
            )}
          </div>

          <div className="flex flex-col gap-2 mt-10">
            <Button
              onClick={handleNext}
              disabled={!activityTiming}
              className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      <Dialog open={drawerOpen} onOpenChange={() => {}}>
        <DialogContent
          className="fixed bottom-0 left-0 right-0 top-auto translate-x-0 translate-y-0 max-w-full rounded-t-2xl rounded-b-none p-5 sm:max-w-full data-[state=open]:slide-in-from-bottom"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Choose Activity Timing
            </DialogTitle>
            <p className="text-sm text-gray-500">
              Select when you want to set up activities (games and vibe tags)
              for your event.
            </p>
          </DialogHeader>

          <RadioGroup
            value={activityTiming ?? ""}
            onValueChange={(v) => setActivityTiming(v as ActivityTiming)}
            className="flex flex-col gap-2 mt-2"
          >
            {activityTimingOptions.map((option) => {
              const isActive = activityTiming === option.value;
              return (
                <label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    "flex items-start justify-between gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all",
                    isActive
                      ? "border-[#5B1A57] bg-[#5B1A57]/5"
                      : "border-gray-200 hover:border-[#5B1A57]/30"
                  )}
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{option.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="mt-0.5 border-[#5B1A57] text-[#5B1A57] shrink-0"
                  />
                </label>
              );
            })}
          </RadioGroup>

          <Button
            onClick={handleConfirmActivityTiming}
            disabled={!activityTiming}
            className="w-full h-11 mt-3 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ActivitySetupProps {
  timing: "pre-event" | "during-event";
  data?: { games?: any; vibetag?: File | null };
  onUpdate: (data: { games?: any; vibetag?: File | null }) => void;
  onBack: () => void;
  onNext: () => void;
}

function ActivitySetup({
  timing,
  data,
  onUpdate,
  onBack,
  onNext,
}: ActivitySetupProps) {
  const formData = useSelector(selectEventFormData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localVibetag, setLocalVibetag] = useState<File | null>(
    data?.vibetag ?? null
  );
  const [gamesModalOpen, setGamesModalOpen] = useState(false);

  const label = timing === "pre-event" ? "Pre-Event" : "Main Event";

  const handleVibetagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.onload = () => {
      if (img.width === 1080 && img.height === 1920) {
        setLocalVibetag(file);
        onUpdate({ ...data, vibetag: file });
        toast.success("Vibe tag uploaded successfully!");
      } else {
        toast.warning(
          `Vibe tag must be 1080x1920 pixels. Your image is ${img.width}x${img.height} pixels.`
        );
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleContinue = () => {
    if (!localVibetag) {
      toast.warning(
        `Please upload a vibe tag (1080x1920 pixels) for ${timing} activities`
      );
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-semibold mb-1">
          {label} Vibe Tag{" "}
          <span className="text-red-500 text-xs font-semibold">*Required</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Upload a vibe tag or design with our templates that will be used as a
          watermark for {timing} content
        </p>

        {localVibetag ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Vibe Tag Preview</p>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1080×1920 pixels
              </span>
            </div>
            <div className="relative w-full max-w-50 rounded-xl overflow-hidden border-2 border-gray-200">
              <Image
                src={URL.createObjectURL(localVibetag)}
                alt="Vibe tag preview"
                width={200}
                height={356}
                className="object-cover w-full"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit border-red-300 text-red-500 hover:bg-red-50"
              onClick={() => {
                setLocalVibetag(null);
                onUpdate({ ...data, vibetag: null });
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <X className="w-3.5 h-3.5 mr-1.5" /> Remove
            </Button>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleVibetagUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-5 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white shrink-0"
                  style={{ borderColor: PRIMARY_COLOR }}
                >
                  <Plus className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold leading-tight">
                    Upload Vibe Tag
                  </p>
                  <p className="text-xs text-gray-500">
                    Required: 1080×1920 pixels
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-7 h-7" style={{ color: PRIMARY_COLOR }} />
                <p className="text-sm text-gray-500">
                  Click to upload (PNG or JPEG)
                </p>
                <p className="text-xs text-gray-400">
                  Image must be exactly 1080×1920 pixels
                </p>
              </div>
            </button>
          </>
        )}
      </div>

      {/* ── Design Template (only when no vibetag) ── */}
      {!localVibetag && (
        <DesignTemplate
          onSaveVibeTag={(file) => {
            setLocalVibetag(file);
            onUpdate({ ...data, vibetag: file });
            toast.success("Vibe tag saved from template!");
          }}
        />
      )}

      {/* ── Games ── */}
      <div>
        <p className="text-sm font-semibold mb-1">{label} Games</p>
        <p className="text-xs text-gray-500 mb-3">
          Set up engaging games for your attendees including trivia, word
          puzzles, this or that, and more.
        </p>

        <button
          type="button"
          onClick={() => setGamesModalOpen(true)}
          className={cn(
            "w-full rounded-xl border-2 p-4 text-left transition-all",
            data?.games
              ? "border-emerald-400 bg-emerald-50"
              : "border-[#5B1A57] bg-transparent hover:bg-[#5B1A57]/5"
          )}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-full border flex items-center justify-center shrink-0"
              style={{ borderColor: PRIMARY_COLOR }}
            >
              <Gamepad2 className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">
                {data?.games ? "Edit Games" : "Set Up Games"}
              </p>
              <p className="text-xs text-gray-500">
                {data?.games
                  ? `${data.games.games?.length ?? 0} game round(s) configured`
                  : "Trivia, word puzzles, this or that, and more"}
              </p>
            </div>
          </div>
          {data?.games && (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Games configured
            </p>
          )}
        </button>
      </div>

      {/* ── Games Modal ── */}
      <Dialog open={gamesModalOpen} onOpenChange={setGamesModalOpen}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {label} Games Setup
            </DialogTitle>
          </DialogHeader>
          <SimplifiedGamificationForm
            eventGamificationType={
              timing === "pre-event" ? "pre-event" : "main-event"
            }
            initialData={data?.games ?? null}
            onNext={(gameData: any) => {
              onUpdate({ ...data, games: gameData });
              setGamesModalOpen(false);
              toast.success("Games configuration saved!");
            }}
            onBack={() => setGamesModalOpen(false)}
            eventStartDate={formData.startDateTime}
            eventEndDate={formData.endDateTime}
          />
        </DialogContent>
      </Dialog>

      {/* ── Actions ── */}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          onClick={handleContinue}
          className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
        >
          Continue
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="w-full h-11 text-gray-700 hover:text-gray-900 font-medium"
        >
          Back
        </Button>
      </div>
    </div>
  );
}

interface ActivitySummaryProps {
  title: string;
  data: { games?: any; vibetag?: File | null };
  onEdit: () => void;
}

function ActivitySummary({ title, data, onEdit }: ActivitySummaryProps) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">{title}</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="h-7 text-xs border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white transition-colors"
        >
          <Pencil className="w-3 h-3 mr-1" /> Edit
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {data.vibetag ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Vibe Tag:</span>
            <span className="font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded (1080×1920)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm text-red-500 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Vibe Tag Required
            (1080×1920)
          </div>
        )}
        {data.games && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Games:</span>
            <span className="font-medium">Configured</span>
          </div>
        )}
      </div>
    </div>
  );
}
