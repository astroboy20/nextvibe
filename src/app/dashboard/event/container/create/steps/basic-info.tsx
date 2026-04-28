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
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_VIDEO_SIZE = 350 * 1024 * 1024;

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
  category: z.string().optional(),
  locationName: z.string().optional(),
  startsAt: z.date().nullable().optional(),
  coordinates: z
    .object({
      lon: z.number().optional(),
      lat: z.number().optional(),
    })
    .optional(),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

const BasicInfo = () => {
  const router = useRouter();
  const [createEventMutation, { isLoading }] = useCreateEventMutation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      locationName: "",
      isPublic: false,
    },
  });

  const flier = watch("flier");
  const locationName = watch("locationName");
  const promotionalVideo = watch("promoVideo");
  const isPublic = watch("isPublic");

  const handleDateTimeChange = (date: string, time: string) => {
    if (date && time) {
      const merged = new Date(`${date}T${time}`);
      if (!isNaN(merged.getTime())) {
        setValue("startsAt", merged, { shouldValidate: true });
      }
    }
  };

  const onSubmit = async (values: BasicInfoFormValues) => {
    const body = {
      name: values.name,
      description: values.description,
      locationName: values.locationName,
      isPublic: values.isPublic,
      flier: values.flier,
      promoVideo: values.promoVideo,
      startsAt: values.startsAt?.toISOString(),
    };

    console.log("Final body:", body);
    const request = await createEventMutation(body).unwrap();

    if (request?.success) {
      if (typeof window !== "undefined") {
        localStorage.setItem("event_id", request?.data?.id ?? "");
      }
      // router.replace(`/dashboard/event/edit/${request?.data?.id}/?step=2`);
    }

    console.log("Final body:", body);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#531342]/10">
            <Calendar className="h-6 w-6 text-[#531342]" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Create Event</h2>
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

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="description">Event Type</Label>
            <Select
              onValueChange={(value) =>
                setValue("isPublic", value === "public", {
                  shouldValidate: true,
                })
              }
              value={
                isPublic === undefined
                  ? undefined
                  : isPublic
                  ? "public"
                  : "private"
              }
            >
              <SelectTrigger className="rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] w-full h-11!">
                <SelectValue placeholder="Select event mode" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>

            {errors.isPublic && (
              <p className="text-xs text-red-500">{errors.isPublic?.message}</p>
            )}
          </div>

          {/* Date & Time → merged into startsAt */}
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
            {flier ? (
              <div className="flex flex-col gap-2">
                <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-200">
                  <Image
                    src={URL.createObjectURL(flier)}
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
                        const file = (e.target as HTMLInputElement).files?.[0];
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
                    if (file) setValue("flier", file, { shouldValidate: true });
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

          <div className="space-y-2">
            <Label>Promotional Video</Label>
            {promotionalVideo ? (
              <div className="flex flex-col gap-2">
                <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-black">
                  <video
                    src={URL.createObjectURL(promotionalVideo)}
                    controls
                    className="w-full max-h-64 object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {(promotionalVideo.size / (1024 * 1024)).toFixed(1)} MB / 350
                  MB max
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
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          if (file.size > MAX_VIDEO_SIZE) {
                            alert("Video must be 350MB or less");
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
                      alert("Video must be 350MB or less");
                      e.target.value = "";
                      return;
                    }
                    setValue("promoVideo", file, {
                      shouldValidate: true,
                    });
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
        <Plus className="mr-2 h-5 w-5" />
        {isLoading ? <Loader2 className="animate-spin" /> : "Create Event"}
      </Button>
    </form>
  );
};

export default BasicInfo;
