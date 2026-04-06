/* eslint-disable react-hooks/incompatible-library */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Image as ImageIcon, Plus, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import AddressSearch from "../../../components/address-search";
import { Textarea } from "@/components/ui/textarea";
import { useCreateEventMutation } from "@/app/provider/api/eventApi";
import { useRouter } from "next/navigation";

const basicInfoSchema = z.object({
  flier: z
    .instanceof(File, { message: "Please upload a flyer image" })
    .optional(),
  name: z.string().min(2, "Name must have at least 2 letters"),
  description: z.string().min(2, "Event description is required").optional(),
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
    },
  });

  const flier = watch("flier");
  const locationName = watch("locationName");

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
      flier: values.flier,
      startsAt: values.startsAt?.toISOString(),
    };

    const request = await createEventMutation(body).unwrap();

    if (request?.success) {
      if (typeof window !== "undefined") {
        localStorage.setItem("event_id", request?.data?.id ?? "");
      }
      router.replace(`/dashboard/event/edit/${request?.data?.id}/?step=2`);
    }

    console.log("Final body:", body);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
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

          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="description">Event Title</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Give your event description"
              className=" rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
            />
            {errors.name && (
              <p className="text-xs text-red-500">
                {errors.description?.message}
              </p>
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

          {/* Location — using watch/setValue instead of field/form */}
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
              <label className="h-[250px] flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary hover:bg-muted/30">
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
        </div>
      </div>
      <Button
        type="submit"
        className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 mb-25"
        size="lg"
      >
        <Plus className="mr-2 h-5 w-5" />
        Create Event
      </Button>
    </form>
  );
};

export default BasicInfo;
