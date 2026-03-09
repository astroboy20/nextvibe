/* eslint-disable react-hooks/incompatible-library */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/legacy/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GoogleLoginButton from "@/app/(auth)/components/google-login-button";
import { toast } from "sonner";
import { useRegisterMutation } from "@/app/provider/api/authApi";
import PasswordField from "../component/password-field";

const Gender = z.enum(["male", "female"]);
const Role = z.enum(["attendee", "organizer", "sponsor"]);

const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  gender: Gender,
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
});

const step2Schema = z.object({
  role: Role,
});

const brandSchema = z.object({
  brandName: z.string().optional(),
  brandEmail: z.string().optional(),
  brandContact: z.string().optional(),
  brandLogo: z.any().optional(),
  useProfileAsBrand: z.boolean().optional(),
});

const combinedSchema = step1Schema
  .merge(step2Schema)
  .merge(brandSchema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (
      (data.role === "organizer" || data.role === "sponsor") &&
      !data.useProfileAsBrand
    ) {
      if (!data.brandName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Brand name is required",
          path: ["brandName"],
        });
      }

      if (!data.brandEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Brand email is required",
          path: ["brandEmail"],
        });
      }

      if (!data.brandContact) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Brand contact is required",
          path: ["brandContact"],
        });
      }
    }
  });

type FormValues = z.infer<typeof combinedSchema>;

const roles = [
  { value: "attendee", label: "Attendee", img: "/images/attendee.png" },
  {
    value: "organizer",
    label: "Event Organizer",
    img: "/images/organizer.png",
  },
  { value: "sponsor", label: "Brand Sponsor", img: "/images/sponsor.png" },
] as const;

export default function RegisterContent() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "/events";
  const defaultRole = searchParams.get("DEFAULT_ROLE") || "";
  const [registerMutation, { isLoading }] = useRegisterMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      gender: undefined,
      password: "",
      confirmPassword: "",
      role: (defaultRole as any) || undefined,

      brandName: "",
      brandEmail: "",
      brandContact: "",
      brandLogo: undefined,
      useProfileAsBrand: false,
    },
    mode: "onChange",
  });

  const selectedRole = form.watch("role");

  const handleSubmit = async (values: FormValues) => {
    try {
      const res = await registerMutation(values as any).unwrap();
      if (from) localStorage.setItem("redirect_after_auth", from);
      router.push(
        `/check-verification?userId=${res.data.user.id}&name=${res.data.user.name}&email=${res.data.user.email}`
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      const valid = await form.trigger([
        "name",
        "email",
        "phoneNumber",
        "gender",
        "password",
        "confirmPassword",
      ]);
      if (!valid) return;

      setStep(2);
      return;
    }

    if (step === 2) {
      const role = form.getValues("role");

      if (!role) {
        await form.trigger("role");
        return;
      }

      if (role === "attendee") {
        form.handleSubmit(handleSubmit)();
        return;
      }

      if (!selectedRole) {
        toast.error("Please select a role");
        return;
      }

      setStep(3);
    }
  };

  const handleGoBack = () => {
    setStep(1);
  };

  return (
    <div>
      <GoogleLoginButton />

      <div className="py-4 flex items-center gap-2 text-sm text-gray-500">
        <span className="h-px bg-gray-300 flex-1" />
        OR
        <span className="h-px bg-gray-300 flex-1" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter name"
                        className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter email"
                        className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Phone number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Gender
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11! rounded-lg border-gray-300 focus:ring-[#5B1A57] w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <PasswordField
                name="password"
                label="Password"
                placeholder="Enter password"
                control={form.control}
              />

              <PasswordField
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm password"
                control={form.control}
              />

              <Button
                type="button"
                onClick={handleContinue}
                className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <FormField
                control={form.control}
                name="role"
                render={() => (
                  <FormItem>
                    <FormMessage />
                    <div className="grid grid-cols-2 gap-3">
                      {roles.slice(0, 2).map((r) => (
                        <RoleCard
                          key={r.value}
                          role={r}
                          selected={selectedRole === r.value}
                          onSelect={() => form.setValue("role", r.value)}
                        />
                      ))}
                    </div>

                    <div className="mt-3">
                      <RoleCard
                        role={roles[2]}
                        selected={selectedRole === roles[2].value}
                        onSelect={() => form.setValue("role", roles[2].value)}
                      />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleGoBack}
                className="w-full h-11 rounded-lg border-[#5B1A57] text-[#5B1A57] hover:bg-[#5B1A57] hover:text-white transition-colors"
              >
                Go Back
              </Button>

              {/* <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button> */}
              <Button
                type={selectedRole === "attendee" ? "submit" : "button"}
                onClick={
                  selectedRole === "attendee" ? undefined : handleContinue
                }
                disabled={!selectedRole || isLoading}
                className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </span>
                ) : selectedRole === "attendee" ? (
                  "Submit"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <FormField
                control={form.control}
                name="useProfileAsBrand"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                    <FormLabel>
                      Use my profile details as brand details
                    </FormLabel>
                  </FormItem>
                )}
              />

              {!form.watch("useProfileAsBrand") && (
                <>
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter brand name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter brand email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Contact</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter contact number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandLogo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Logo</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="w-full"
              >
                Go Back
              </Button>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium"
              >
                {isLoading ? "Creating account..." : "Submit"}
              </Button>
            </div>
          )}

          <p className="text-center text-sm font-medium text-gray-600 pt-1">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-[#5B1A57] hover:underline underline-offset-2"
            >
              Login
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}

function RoleCard({
  role,
  selected,
  onSelect,
}: {
  role: { value: string; label: string; img: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      className={cn(
        "cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        selected
          ? "border-[#5B1A57] bg-[#5B1A57] text-white shadow-md shadow-[#5B1A57]/20"
          : "border-[#5B1A57]/30 bg-white text-gray-900 hover:border-[#5B1A57]"
      )}
    >
      <div className="relative w-20 h-24">
        <Image
          src={role.img}
          layout="fill"
          objectFit="contain"
          alt={role.label}
        />
      </div>
      <p className="text-center font-bold text-sm">{role.label}</p>
    </Card>
  );
}
