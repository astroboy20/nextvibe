/* eslint-disable react-hooks/incompatible-library */
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Sparkles, Image as ImageIcon, Plus, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import AddressSearch from "../../components/address-search";
import { useState } from "react";
import Games from "./steps/games/games";
import BasicInfo from "./steps/basic-info";

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

const Create = () => {
  const [step, setStep] = useState(1);
  const [gamesData, setGamesData] = useState<any>(null);

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
  const startsAt = watch("startsAt");

  const handleDateTimeChange = (date: string, time: string) => {
    if (date && time) {
      const merged = new Date(`${date}T${time}`);
      if (!isNaN(merged.getTime())) {
        setValue("startsAt", merged, { shouldValidate: true });
      }
    }
  };

  const onSubmit = (values: BasicInfoFormValues) => {
    console.log("Form values:", values);
    console.log("startsAt ISO:", values.startsAt?.toISOString());
  };

  return (
    <div className="min-h-screen pb-20">
      <main className="container">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 animate-fade-in"
        >
          {step === 1 && <BasicInfo />}
          {step === 2 && (
            <Games
              initialData={gamesData}
              eventStartDate={startsAt?.toISOString()}
              onSave={(data) => {
                setGamesData(data);
                setStep(1);
              }}
              onBack={() => setStep(1)}
            />
          )}

          {step === 2 || step === 3 ? (
            ""
          ) : (
            <>
              {/* Quick Action Cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                  <span className="text-sm font-medium">Add Games</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-card"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Add VibeTag</span>
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium transition-colors"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Event
              </Button>
            </>
          )}
        </form>
      </main>
    </div>
  );
};

export default Create;
