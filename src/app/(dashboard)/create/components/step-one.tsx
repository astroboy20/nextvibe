/* eslint-disable react-hooks/incompatible-library */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CalendarIcon, Clock, X, ImageIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import {
  nextStep,
  selectEventFormData,
  updateData,
} from "@/app/provider/slices/eventformslice";
import { useDispatch, useSelector } from "react-redux";
import { eventType } from "@/data";
import FileUpload from "./file-upload";
import { MIME_TYPES } from "@/lib/mime-types";
import { toast } from "sonner";
import AddressSearch from "./address-search";

// ── Helpers ────────────────────────────────────────────────────────────────────
const createDefaultTime = (hours: number, minutes = 0) => {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

// ── Schema ─────────────────────────────────────────────────────────────────────
const basicInfoSchema = z
  .object({
    flier: z
      .any()
      .refine((f) => f != null, { message: "Event flyer is required" }),
    promotionalVideo: z.any().optional(),
    name: z.string().min(2, "Name must have at least 2 letters"),
    description: z.string().min(2, "Event description is required"),
    category: z.string().min(1, "Category is required"),
    location: z.string().optional(),
    isMultiDay: z.boolean(),
    date: z.date({ message: "Start date is required" }),
    endDate: z.date().nullable().optional(),
    startTime: z.date().nullable().optional(),
    coordinates: z.object({
      lon: z.number().optional(),
      lat: z.number().optional(),
    }),
    eventMode: z
      .enum(["virtual", "hybrid", "onsite"])
      .refine((value) => !!value, {
        message: "Event mode is required",
      }),
    tags: z.array(z.string()).optional(),
    promoteEvent: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    allowSponsorship: z.boolean().optional(),
    requiresApproval: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.eventMode !== "virtual" && !data.location) {
      ctx.addIssue({
        code: "custom",
        message: "Location is required for onsite and hybrid events",
        path: ["location"],
      });
    }
    if (data.isMultiDay) {
      if (!data.endDate) {
        ctx.addIssue({
          code: "custom",
          message: "End date is required for multi-day events",
          path: ["endDate"],
        });
      }
      if (data.endDate && data.endDate < data.date) {
        ctx.addIssue({
          code: "custom",
          message: "End date must be after start date",
          path: ["endDate"],
        });
      }
    }
    if (!data.isMultiDay && !data.startTime) {
      ctx.addIssue({
        code: "custom",
        message: "Start time is required",
        path: ["startTime"],
      });
    }
  });

type FormValues = z.infer<typeof basicInfoSchema>;

// ── Tags input ─────────────────────────────────────────────────────────────────
function TagsInput({
  value = [],
  onChange,
  placeholder,
}: {
  value?: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = inputRef.current?.value.trim();
      if (val && !value.includes(val)) {
        onChange([...value, val]);
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div className="flex flex-wrap gap-1.5 min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-[#5B1A57] focus-within:border-[#5B1A57] transition-all">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-[#5B1A57]/10 text-[#5B1A57] text-xs font-medium rounded-full px-2.5 py-1"
        >
          {tag}
          <button type="button" onClick={() => remove(tag)}>
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : "Add more..."}
        className="flex-1 min-w-30 text-sm outline-none bg-transparent"
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function StepOne() {
  const dispatch = useDispatch();
  const data = useSelector(selectEventFormData);
  const startTimePickerRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      flier: data.flier ?? null,
      promotionalVideo: data.promotionalVideo ?? null,
      name: data.name ?? "",
      description: data.description ?? "",
      category: data.category ?? "",
      location: data.location ?? "",
      promoteEvent: data.promoteEvent ?? false,
      isPublic: data.isPublic ?? true,
      allowSponsorship: data.allowSponsorship ?? true,
      isMultiDay: data.isMultiDay ?? false,
      date: data.startDateTime ? new Date(data.startDateTime) : new Date(),
      endDate: data.endDateTime ? new Date(data.endDateTime) : null,
      startTime: data.startDateTime
        ? new Date(data.startDateTime)
        : createDefaultTime(9),
      coordinates: data.coordinates ?? { lon: 0, lat: 0 },
      eventMode: data.eventMode ?? "",
      tags: data.tags ?? [],
      requiresApproval: data.requiresApproval ?? false,
    },
  });

  const isMultiDay = form.watch("isMultiDay");
  const isPublic = form.watch("isPublic");
  const eventMode = form.watch("eventMode");
  //   const flier = form.watch("flier");

  const handleNextStep = (values: FormValues) => {
    let startDateTime: Date;
    let endDateTime: Date;

    if (values.isMultiDay) {
      startDateTime = new Date(values.date);
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime = new Date(values.endDate!);
      endDateTime.setHours(23, 59, 59, 999);
    } else {
      startDateTime = new Date(values.date);
      startDateTime.setHours(values.startTime?.getHours() ?? 0);
      startDateTime.setMinutes(values.startTime?.getMinutes() ?? 0);
      startDateTime.setSeconds(0);
      startDateTime.setMilliseconds(0);
      endDateTime = new Date(values.date);
      endDateTime.setHours(23, 59, 59, 999);
    }

    dispatch(
      updateData({
        ...values,
        allowSponsorship: values.allowSponsorship,
        isPublic: values.isPublic,
        requiresApproval: values.requiresApproval,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        coordinates: {
          lon: values.coordinates?.lon ?? 0,
          lat: values.coordinates?.lat ?? 0,
        },
      })
    );
    dispatch(nextStep());
  };

  // ── Field wrapper for consistent spacing ──
  //   const Field = ({ children }: { children: React.ReactNode }) => (
  //     <div className="flex flex-col gap-1.5">{children}</div>
  //   );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleNextStep)}
        className="space-y-5 mb-10"
      >
        {/* ── Flyer upload ── */}
        <FormField
          control={form.control}
          name="flier"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Upload your Event Flyer
              </FormLabel>
              <FormControl>
                <>
                  {field.value ? (
                    <div className="flex flex-col gap-2">
                      <div className="relative w-full h-66.5 rounded-xl overflow-hidden border border-gray-200">
                        <Image
                          src={URL.createObjectURL(field.value)}
                          alt="Event flyer preview"
                          fill
                          className="object-cover w-full "
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white transition-colors"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/png,image/jpeg";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement)
                              .files?.[0];
                            if (file) field.onChange(file);
                          };
                          input.click();
                        }}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Change Flyer
                      </Button>
                    </div>
                  ) : (
                    <FileUpload
                      uploadMessage="event flyer"
                      value={field.value}
                      onChange={field.onChange}
                      maxSize={5}
                    />
                  )}
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Promotional video ── */}
        <FormField
          control={form.control}
          name="promotionalVideo"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FileUpload
                  label="Upload your Promotional Video"
                  uploadMessage="promotional video"
                  value={field.value}
                  accept={[MIME_TYPES.mp4]}
                  onChange={field.onChange}
                  maxSize={350}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Event name ── */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter event name"
                  className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Description ── */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter event description"
                  rows={6}
                  className="resize-none rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Category ── */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11! w-full rounded-lg border-gray-300 focus:ring-[#5B1A57]">
                    <SelectValue placeholder="Select event category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventType.map((et: { label: string; value: string }) => (
                    <SelectItem key={et.value} value={et.value}>
                      {et.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Tags ── */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagsInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Type a tag and press Enter (e.g., music, concert)"
                />
              </FormControl>
              <FormDescription className="text-xs">
                Add relevant tags to help attendees find your event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Promote event ── */}
        <FormField
          control={form.control}
          name="promoteEvent"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2.5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[#5B1A57] data-[state=checked]:border-[#5B1A57]"
                />
              </FormControl>
              <FormLabel className="mt-0! font-medium cursor-pointer">
                Promote Event
              </FormLabel>
            </FormItem>
          )}
        />

        {/* ── Allow sponsorship ── */}
        <FormField
          control={form.control}
          name="allowSponsorship"
          render={({ field }) => (
            <FormItem className="flex items-start gap-2.5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5 data-[state=checked]:bg-[#5B1A57] data-[state=checked]:border-[#5B1A57]"
                />
              </FormControl>
              <div>
                <FormLabel className="mt-0! font-medium cursor-pointer">
                  Allow brand sponsorships to enhance event credibility
                </FormLabel>
                <FormDescription className="text-xs mt-0.5">
                  Enable brands to sponsor your event with banners and
                  promotions
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* ── Event visibility ── */}
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Visibility</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value ? "public" : "private"}
                  onValueChange={(v) => field.onChange(v === "public")}
                  className="flex flex-col gap-3 mt-1"
                >
                  <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-[#5B1A57]/40 transition-colors cursor-pointer">
                    <RadioGroupItem
                      value="public"
                      id="public"
                      className="mt-0.5 border-[#5B1A57] text-[#5B1A57]"
                    />
                    <div>
                      <Label
                        htmlFor="public"
                        className="font-medium cursor-pointer"
                      >
                        Public
                      </Label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Anyone can discover and join this event
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-[#5B1A57]/40 transition-colors cursor-pointer">
                    <RadioGroupItem
                      value="private"
                      id="private"
                      className="mt-0.5 border-[#5B1A57] text-[#5B1A57]"
                    />
                    <div>
                      <Label
                        htmlFor="private"
                        className="font-medium cursor-pointer"
                      >
                        Private
                      </Label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Invite-only event (pool parties, weddings, house
                        parties)
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Private event settings ── */}
        {isPublic === false && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col gap-3">
            <p className="text-sm font-semibold text-[#5B1A57]">
              Private Event Settings
            </p>
            <FormField
              control={form.control}
              name="requiresApproval"
              render={({ field }) => (
                <FormItem className="flex items-start gap-2.5">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5 data-[state=checked]:bg-[#5B1A57] data-[state=checked]:border-[#5B1A57]"
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="mt-0! font-medium cursor-pointer">
                      Require approval for RSVPs
                    </FormLabel>
                    <FormDescription className="text-xs mt-0.5">
                      Guests must request access and wait for your approval
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <p className="text-xs text-gray-400 leading-relaxed">
              💡 After creating your event, you&apos;ll receive a unique invite
              link and QR code to share with your guests.
            </p>
          </div>
        )}

        {/* ── Multi-day toggle ── */}
        <FormField
          control={form.control}
          name="isMultiDay"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2.5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-[#5B1A57] data-[state=checked]:border-[#5B1A57]"
                />
              </FormControl>
              <FormLabel className="mt-0! text-sm font-medium cursor-pointer">
                Event spans multiple days
              </FormLabel>
            </FormItem>
          )}
        />

        {/* ── Date / time fields ── */}
        {isMultiDay ? (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                        className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] pr-10"
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        min={
                          form.getValues("date")?.toISOString().split("T")[0]
                        }
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          const startDate = form.getValues("date");
                          if (val && startDate && val < startDate) {
                            toast("End date cannot be before start date");
                            return;
                          }
                          field.onChange(val);
                        }}
                        className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] pr-10"
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                        className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] pr-10"
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="time"
                        ref={startTimePickerRef}
                        defaultValue={
                          field.value
                            ? `${String(field.value.getHours()).padStart(
                                2,
                                "0"
                              )}:${String(field.value.getMinutes()).padStart(
                                2,
                                "0"
                              )}`
                            : "09:00"
                        }
                        onChange={(e) => {
                          const val = e.currentTarget.value;
                          if (!val) return;
                          const [hours, minutes] = val.split(":").map(Number);
                          const d = new Date();
                          d.setHours(hours, minutes, 0, 0);
                          field.onChange(d);
                        }}
                        className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          startTimePickerRef.current?.showPicker?.()
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* ── Event mode ── */}
        <FormField
          control={form.control}
          name="eventMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Mode</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11! w-full rounded-lg border-gray-300 focus:ring-[#5B1A57]">
                    <SelectValue placeholder="Select event mode" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Location ── */}
        {eventMode !== "virtual" && (
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AddressSearch
                    value={field.value ?? ""}
                    onChange={(value, coordinates) => {
                      field.onChange(value);
                      if (coordinates)
                        form.setValue("coordinates", coordinates);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* ── Submit ── */}
        <Button
          type="submit"
          className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </Button>
      </form>
    </Form>
  );
}
