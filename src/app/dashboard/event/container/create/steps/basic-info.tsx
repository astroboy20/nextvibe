/* eslint-disable react-hooks/incompatible-library */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Video,
  X,
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import AddressSearch from "../../../components/address-search";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateEventMutation,
  useUploadIntentMutation,
} from "@/app/provider/api/eventApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useEffect, useState } from "react";
import { toast } from "sonner";
import SuccessModal from "../../../components/success-modal";
import { Badge } from "@/components/ui/badge";
import { errorHandler } from "@/utils/errorHandler";

const MAX_VIDEO_SIZE = 350 * 1024 * 1024;

const eventTypes = [
  { id: "concert", name: "Concert" },
  { id: "conference", name: "Conference" },
  { id: "workshop", name: "Workshop" },
  { id: "webinar", name: "Webinar" },
  { id: "festival", name: "Festival" },
  { id: "party", name: "Party" },
  { id: "sports", name: "Sports Event" },
  { id: "exhibition", name: "Exhibition" },
  { id: "networking", name: "Networking Event" },
  { id: "seminar", name: "Seminar" },
  { id: "wedding", name: "Wedding" },
  { id: "birthday", name: "Birthday Party" },
  { id: "religious", name: "Religious Event" },
  { id: "launch", name: "Product Launch" },
  { id: "others", name: "Others" },
];

const basicInfoSchema = z.object({
  flier: z
    .instanceof(File, { message: "Please upload a flyer image" })
    .optional(),
  promoVideo: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_VIDEO_SIZE,
      "Video must be 350MB or less"
    )
    .optional(),
  name: z.string().min(2, "Name must have at least 2 letters"),
  description: z.string().min(2, "Event description is required").optional(),
  isPublic: z.boolean({ error: "Event mode is required" }),
  tags: z.array(z.string()).min(1, "Select at least one event category"),
  tier: z.enum(["MICRO", "SMALL", "MEDIUM", "LARGE", "ENTERPRISE"], {
    error: "Event tier is required",
  }),
  locationName: z.string().optional(),
  startsAt: z.date().nullable().optional(),
  eventMode: z.enum(["ONSITE", "HYBRID", "VIRTUAL"], {
    error: "Event mode is required",
  }),
  coordinates: z
    .object({ lon: z.number().optional(), lat: z.number().optional() })
    .optional(),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

interface UploadState {
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  url: string | null;
}

const IDLE: UploadState = { status: "idle", progress: 0, url: null };

const BasicInfo = () => {
  const [createEventMutation, { isLoading }] = useCreateEventMutation();
  const [uploadIntent] = useUploadIntentMutation();
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [flierUpload, setFlierUpload] = useState<UploadState>(IDLE);
  const [videoUpload, setVideoUpload] = useState<UploadState>(IDLE);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { locationName: "", isPublic: false, tags: [] },
  });

  const flier = watch("flier");
  const locationName = watch("locationName");
  const promotionalVideo = watch("promoVideo");
  const isPublic = watch("isPublic");
  // Need to re-register text fields since we dropped spread register
  const name = watch("name");
  const description = watch("description");

  const flierPreviewUrl = useMemo(
    () => (flier ? URL.createObjectURL(flier) : null),
    [flier]
  );
  const videoPreviewUrl = useMemo(
    () => (promotionalVideo ? URL.createObjectURL(promotionalVideo) : null),
    [promotionalVideo]
  );

  useEffect(() => {
    return () => {
      if (flierPreviewUrl) URL.revokeObjectURL(flierPreviewUrl);
    };
  }, [flierPreviewUrl]);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const uploadFile = (
    file: File,
    uploadUrl: string,
    onProgress?: (pct: number) => void
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable)
            onProgress(Math.round((e.loaded * 100) / e.total));
        };
      }
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload failed: ${xhr.status}`));
      xhr.onerror = () => reject(new Error("Upload network error"));
      xhr.send(file);
    });

  const handleFlierChange = async (file: File) => {
    setValue("flier", file, { shouldValidate: true });
    setFlierUpload({ status: "uploading", progress: 0, url: null });
    try {
      const intent = await uploadIntent({
        filename: file.name,
        contentType: file.type,
        folder: "events",
      }).unwrap();
      await uploadFile(file, intent.data.uploadUrl, (pct) =>
        setFlierUpload((prev) => ({ ...prev, progress: pct }))
      );
      setFlierUpload({
        status: "done",
        progress: 100,
        url: intent.data.fileUrl,
      });
    } catch {
      setFlierUpload({ status: "error", progress: 0, url: null });
      toast.error(errorHandler("Flyer upload failed. You can retry."));
    }
  };

  const handleVideoChange = async (file: File) => {
    if (file.size > MAX_VIDEO_SIZE) {
      toast.warning("Video must be 350MB or less");
      return;
    }
    setValue("promoVideo", file, { shouldValidate: true });
    setVideoUpload({ status: "uploading", progress: 0, url: null });
    try {
      const intent = await uploadIntent({
        filename: file.name,
        contentType: file.type,
        folder: "events",
      }).unwrap();
      await uploadFile(file, intent.data.uploadUrl, (pct) =>
        setVideoUpload((prev) => ({ ...prev, progress: pct }))
      );
      setVideoUpload({
        status: "done",
        progress: 100,
        url: intent.data.fileUrl,
      });
    } catch {
      setVideoUpload({ status: "error", progress: 0, url: null });
      toast.error("Video upload failed. You can retry.");
    }
  };

  const handleDateTimeChange = (date: string, time: string) => {
    if (date && time) {
      const merged = new Date(`${date}T${time}`);
      if (!isNaN(merged.getTime()))
        setValue("startsAt", merged, { shouldValidate: true });
    }
  };

  const handleTagSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) return;
    const updated = [...selectedTags, tagId];
    setSelectedTags(updated);
    setValue("tags", updated, { shouldValidate: true, shouldDirty: true });
  };

  const handleTagRemove = (tagId: string) => {
    const updated = selectedTags.filter((t) => t !== tagId);
    setSelectedTags(updated);
    setValue("tags", updated, { shouldValidate: true, shouldDirty: true });
  };

  const getTagName = (tagId: string) =>
    eventTypes.find((t) => t.id === tagId)?.name ?? tagId;

  const availableTags = eventTypes.filter((t) => !selectedTags.includes(t.id));

  const anyUploading =
    flierUpload.status === "uploading" || videoUpload.status === "uploading";

  const onSubmit = async (values: BasicInfoFormValues) => {
    if (anyUploading) {
      toast.warning("Please wait for uploads to finish.");
      return;
    }
    if (
      (values.flier && flierUpload.status === "error") ||
      (values.promoVideo && videoUpload.status === "error")
    ) {
      toast.error("Some uploads failed. Please retry before submitting.");
      return;
    }
    try {
      const body = {
        name: values.name,
        description: values.description,
        locationName: values.locationName,
        isPublic: values.isPublic,
        mode: values.eventMode,
        startsAt: values.startsAt?.toISOString(),
        tier: values.tier,
        ...(flierUpload.url && { flierUrl: flierUpload.url }),
        ...(videoUpload.url && { promoVideoUrl: videoUpload.url }),
      };

      const request = await createEventMutation(body).unwrap();
      if (request?.success) {
        const eventId = request?.data?.id ?? "";
        if (typeof window !== "undefined")
          localStorage.setItem("event_id", eventId);
        setCreatedEventId(eventId);
      }
    } catch (err: any) {
      toast.error(errorHandler(err));
    }
  };

  return (
    <>
      {createdEventId && (
        <SuccessModal
          eventId={createdEventId}
          onClose={() => setCreatedEventId(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#531342]/10">
              <Calendar className="h-6 w-6 text-[#531342]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold">
                Create Event
              </h2>
              <p className="text-sm text-muted-foreground">
                Share your next experience
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="name">Event Title</Label>
              <Input
                id="name"
                type="text"
                value={name ?? ""}
                onChange={(e) =>
                  setValue("name", e.target.value, { shouldValidate: true })
                }
                placeholder="Give your event a name"
                className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Event Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Event Description</Label>
              <Textarea
                id="description"
                value={description ?? ""}
                onChange={(e) =>
                  setValue("description", e.target.value, {
                    shouldValidate: true,
                  })
                }
                placeholder="Give your event description"
                className="rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description?.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Event Tier</Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "tier",
                    value as
                      | "MICRO"
                      | "SMALL"
                      | "MEDIUM"
                      | "LARGE"
                      | "ENTERPRISE",
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] w-full h-11!">
                  <SelectValue placeholder="Select event tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MICRO">Micro — 50 Attendees</SelectItem>
                  <SelectItem value="SMALL">Small — 200 Attendees</SelectItem>
                  <SelectItem value="MEDIUM">Medium — 500 Attendees</SelectItem>
                  <SelectItem value="LARGE">Large — 2,000 Attendees</SelectItem>
                  <SelectItem value="ENTERPRISE">
                    Enterprise — Unlimited
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.tier && (
                <p className="text-xs text-red-500">{errors.tier.message}</p>
              )}
            </div>
            {/* Event Type (public/private) */}
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                onValueChange={(value) =>
                  setValue("isPublic", value === "public", {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                value={isPublic ? "public" : "private"}
              >
                <SelectTrigger className="rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] w-full h-11!">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              {errors.isPublic && (
                <p className="text-xs text-red-500">
                  {errors.isPublic?.message}
                </p>
              )}
            </div>

            {/* Event Tags */}
            <div className="space-y-2">
              <Label>Event Tags</Label>
              {availableTags.length > 0 && (
                <Select onValueChange={handleTagSelect} value="">
                  <SelectTrigger className="rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] w-full h-11!">
                    <SelectValue
                      placeholder={
                        selectedTags.length > 0
                          ? `${selectedTags.length} tags selected`
                          : "Select event category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tagId) => (
                    <Badge
                      key={tagId}
                      className="gap-1 bg-[#531342]/10 text-[#531342] hover:bg-[#531342]/20 border border-[#531342]/20 pr-1"
                    >
                      {getTagName(tagId)}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tagId)}
                        className="ml-1 rounded-full hover:bg-[#531342]/20 p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {errors.tags && (
                <p className="text-xs text-red-500">{errors.tags.message}</p>
              )}
            </div>

            {/* Event Mode */}
            <div className="space-y-2">
              <Label>Event Mode</Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "eventMode",
                    value as "ONSITE" | "HYBRID" | "VIRTUAL",
                    { shouldValidate: true, shouldDirty: true }
                  )
                }
              >
                <SelectTrigger className="rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] w-full h-11!">
                  <SelectValue placeholder="Select event mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONSITE">Onsite</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
                  <SelectItem value="VIRTUAL">Virtual</SelectItem>
                </SelectContent>
              </Select>
              {errors.eventMode && (
                <p className="text-xs text-red-500">
                  {errors.eventMode.message}
                </p>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Date</Label>
                <Input
                  id="eventDate"
                  type="date"
                  className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                  onChange={(e) => {
                    const time =
                      (document.getElementById("eventTime") as HTMLInputElement)
                        ?.value ?? "";
                    handleDateTimeChange(e.target.value, time);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventTime">Time</Label>
                <Input
                  id="eventTime"
                  type="time"
                  className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                  onChange={(e) => {
                    const date =
                      (document.getElementById("eventDate") as HTMLInputElement)
                        ?.value ?? "";
                    handleDateTimeChange(date, e.target.value);
                  }}
                />
              </div>
            </div>
            {errors.startsAt && (
              <p className="text-xs text-red-500">{errors.startsAt.message}</p>
            )}

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="eventLocation">Location</Label>
              <AddressSearch
                value={locationName ?? ""}
                onChange={(value, coordinates) => {
                  setValue("locationName", value, { shouldValidate: true });
                  if (coordinates)
                    setValue("coordinates", coordinates, {
                      shouldValidate: true,
                    });
                }}
              />
              {errors.locationName && (
                <p className="text-xs text-red-500">
                  {errors.locationName.message}
                </p>
              )}
            </div>

            {/* Flyer Upload */}
            <div className="space-y-2">
              <Label>Event Flyer</Label>
              {flier && flierPreviewUrl ? (
                <div className="flex flex-col gap-2">
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200">
                    <Image
                      src={flierPreviewUrl}
                      alt="Event flyer preview"
                      className="object-cover w-full h-full"
                      width={600}
                      height={256}
                    />

                    {/* Uploading overlay */}
                    {flierUpload.status === "uploading" && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 p-6">
                        <Loader2 className="h-7 w-7 text-white animate-spin" />
                        <div className="w-4/5 space-y-1.5">
                          <div className="flex justify-between text-white text-xs font-medium">
                            <span>Uploading…</span>
                            <span>{flierUpload.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                            <div
                              className="h-full bg-white transition-all duration-150"
                              style={{ width: `${flierUpload.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Done badge */}
                    {flierUpload.status === "done" && (
                      <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm rounded-full p-1">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {/* Error overlay */}
                    {flierUpload.status === "error" && (
                      <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="h-7 w-7 text-white" />
                        <p className="text-white text-sm font-medium">
                          Upload failed
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleFlierChange(flier)}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mx-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={flierUpload.status === "uploading"}
                      className="border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white transition-colors"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/png,image/jpeg";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) handleFlierChange(file);
                        };
                        input.click();
                      }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Change Flyer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={flierUpload.status === "uploading"}
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-colors"
                      onClick={() => {
                        setValue("flier", undefined, { shouldValidate: true });
                        setFlierUpload(IDLE);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="h-62.5 flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-[#531342] hover:bg-muted/30">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload flyer image
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFlierChange(file);
                    }}
                  />
                </label>
              )}
              {errors.flier && (
                <p className="text-xs text-red-500">
                  {errors.flier.message as string}
                </p>
              )}
            </div>

            {/* Promotional Video */}
            <div className="space-y-2">
              <Label>Promotional Video</Label>
              {promotionalVideo && videoPreviewUrl ? (
                <div className="flex flex-col gap-2">
                  <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <video
                      src={videoPreviewUrl}
                      controls={videoUpload.status !== "uploading"}
                      className="w-full max-h-64 object-contain"
                    />

                    {/* Uploading overlay */}
                    {videoUpload.status === "uploading" && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 p-6">
                        <Loader2 className="h-7 w-7 text-white animate-spin" />
                        <div className="w-4/5 space-y-1.5">
                          <div className="flex justify-between text-white text-xs font-medium">
                            <span>Uploading…</span>
                            <span>{videoUpload.progress}%</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                            <div
                              className="h-full bg-white transition-all duration-150"
                              style={{ width: `${videoUpload.progress}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-white/70 text-xs">
                          {(promotionalVideo.size / (1024 * 1024)).toFixed(1)}{" "}
                          MB
                        </p>
                      </div>
                    )}

                    {/* Done badge */}
                    {videoUpload.status === "done" && (
                      <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm rounded-full p-1">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {/* Error overlay */}
                    {videoUpload.status === "error" && (
                      <div className="absolute inset-0 bg-red-900/60 flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="h-7 w-7 text-white" />
                        <p className="text-white text-sm font-medium">
                          Upload failed
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleVideoChange(promotionalVideo)}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>

                  {videoUpload.status !== "uploading" && (
                    <p className="text-xs text-muted-foreground text-center">
                      {(promotionalVideo.size / (1024 * 1024)).toFixed(1)} MB /
                      350 MB max
                    </p>
                  )}

                  <div className="flex gap-2 mx-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={videoUpload.status === "uploading"}
                      className="border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white transition-colors"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "video/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) handleVideoChange(file);
                        };
                        input.click();
                      }}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Change Video
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={videoUpload.status === "uploading"}
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-colors"
                      onClick={() => {
                        setValue("promoVideo", undefined, {
                          shouldValidate: true,
                        });
                        setVideoUpload(IDLE);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="h-62.5 flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-[#531342] hover:bg-muted/30">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Upload promotional video
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (max 350MB)
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoChange(file);
                    }}
                  />
                </label>
              )}
              {errors.promoVideo && (
                <p className="text-xs text-red-500">
                  {errors.promoVideo.message as string}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || anyUploading}
          className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 mb-25"
          size="lg"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              Creating event…
            </span>
          ) : anyUploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              Uploading files…
            </span>
          ) : (
            <>
              <Plus className="mr-2 h-5 w-5" /> Create Event
            </>
          )}
        </Button>
      </form>
    </>
  );
};

export default BasicInfo;
