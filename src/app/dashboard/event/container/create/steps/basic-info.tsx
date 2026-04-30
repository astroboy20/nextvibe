/* eslint-disable react-hooks/incompatible-library */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
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
import { useCreateEventMutation } from "@/app/provider/api/eventApi";
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
  isPublic: z.boolean({
    error: "Event mode is required",
  }),
  tags: z.array(z.string()).min(1, "Select at least one event category"),
  locationName: z.string().optional(),
  startsAt: z.date().nullable().optional(),
  eventMode: z.enum(["ONSITE", "HYBRID", "VIRTUAL"], {
    error: "Event mode is required",
  }),
  coordinates: z
    .object({
      lon: z.number().optional(),
      lat: z.number().optional(),
    })
    .optional(),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

const BasicInfo = () => {
  const [createEventMutation, { isLoading }] = useCreateEventMutation();
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      locationName: "",
      isPublic: false,
      tags: [],
    },
  });

  const flier = watch("flier");
  const locationName = watch("locationName");
  const promotionalVideo = watch("promoVideo");
  const isPublic = watch("isPublic");

  const flierUrl = useMemo(() => {
    if (!flier) return null;
    return URL.createObjectURL(flier);
  }, [flier]);

  const promoVideoUrl = useMemo(() => {
    if (!promotionalVideo) return null;
    return URL.createObjectURL(promotionalVideo);
  }, [promotionalVideo]);

  useEffect(() => {
    return () => {
      if (flierUrl) URL.revokeObjectURL(flierUrl);
    };
  }, [flierUrl]);

  useEffect(() => {
    return () => {
      if (promoVideoUrl) URL.revokeObjectURL(promoVideoUrl);
    };
  }, [promoVideoUrl]);

  const handleDateTimeChange = (date: string, time: string) => {
    if (date && time) {
      const merged = new Date(`${date}T${time}`);
      if (!isNaN(merged.getTime())) {
        setValue("startsAt", merged, { shouldValidate: true });
      }
    }
  };

  const handleTagSelect = (tagId: string) => {
    // Don't add if already selected
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

  // Options not yet selected
  const availableTags = eventTypes.filter((t) => !selectedTags.includes(t.id));

  const onSubmit = async (values: BasicInfoFormValues) => {
    const body = {
      name: values.name,
      description: values.description,
      locationName: values.locationName,
      isPublic: values.isPublic,
      // tagIds: values.tags,
      mode: values.eventMode,
      flier: values.flier,
      promoVideo: values.promoVideo,
      startsAt: values.startsAt?.toISOString(),
    };
    console.log(body)

    const request = await createEventMutation(body).unwrap();

    if (request?.success) {
      const eventId = request?.data?.id ?? "";
      if (typeof window !== "undefined") {
        localStorage.setItem("event_id", eventId);
      }
      setCreatedEventId(eventId);
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
        <div className="">
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
                {...register("name")}
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
                {...register("description")}
                placeholder="Give your event description"
                className="rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
              />
              {errors.description && (
                <p className="text-xs text-red-500">
                  {errors.description?.message}
                </p>
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

            {/* Event Tags — multi-select */}
            <div className="space-y-2">
              <Label>Event Tags</Label>

              {/* Dropdown — only shows unselected options */}
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

              {/* Selected tags */}
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
                  if (coordinates) {
                    setValue("coordinates", coordinates, {
                      shouldValidate: true,
                    });
                  }
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
              {flier && flierUrl ? (
                <div className="flex flex-col gap-2">
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200">
                    <Image
                      src={flierUrl}
                      alt="Event flyer preview"
                      className="object-cover w-full h-full"
                      width={100}
                      height={100}
                    />
                  </div>
                  <div className="flex gap-2 mx-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white transition-colors"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/png,image/jpeg";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file)
                            setValue("flier", file, { shouldValidate: true });
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
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-colors"
                      onClick={() =>
                        setValue("flier", undefined, { shouldValidate: true })
                      }
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
                      if (file)
                        setValue("flier", file, { shouldValidate: true });
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
              {promotionalVideo && promoVideoUrl ? (
                <div className="flex flex-col gap-2">
                  <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-black">
                    <video
                      src={promoVideoUrl}
                      controls
                      className="w-full max-h-64 object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {(promotionalVideo.size / (1024 * 1024)).toFixed(1)} MB /
                    350 MB max
                  </p>
                  <div className="flex gap-2 mx-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white transition-colors"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "video/*";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) {
                            if (file.size > MAX_VIDEO_SIZE) {
                              toast.warning("Video must be 350MB or less");
                              return;
                            }
                            setValue("promoVideo", file, {
                              shouldValidate: true,
                            });
                          }
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
                      className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-colors"
                      onClick={() =>
                        setValue("promoVideo", undefined, {
                          shouldValidate: true,
                        })
                      }
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
                      if (!file) return;
                      if (file.size > MAX_VIDEO_SIZE) {
                        toast.warning("Video must be 350MB or less");
                        e.target.value = "";
                        return;
                      }
                      setValue("promoVideo", file, { shouldValidate: true });
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
          disabled={isLoading}
          className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 mb-25"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
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
