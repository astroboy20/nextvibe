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
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import Cookies from "js-cookie";

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

const combinedSchema = step1Schema
  .merge(step2Schema)
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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

function PasswordField({
  name,
  label,
  placeholder,
  control,
}: {
  name: "password" | "confirmPassword";
  label: string;
  placeholder: string;
  control: any;
}) {
  const [show, setShow] = useState(false);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700">
            {label}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                className="h-11 rounded-lg border-gray-300 pr-10 focus-visible:ring-[#5B1A57]"
                {...field}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {show ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

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
    },
    mode: "onChange",
  });

  const selectedRole = form.watch("role");

  const handleSubmit = async (values: FormValues) => {
    try {
      const res = await registerMutation(values as any).unwrap();
      if (from) localStorage.setItem("redirect_after_auth", from);
      Cookies.set("accessToken", res?.data?.token, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      router.push(`/events`);
      // router.push(
      //   `/check-verification?userId=${res.data.user.id}&name=${res.data.user.name}&email=${res.data.user.email}`
      // );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleContinue = async () => {
    const valid = await form.trigger([
      "name",
      "email",
      "phoneNumber",
      "gender",
      "password",
      "confirmPassword",
    ]);
    if (!valid) return;

    if (defaultRole) {
      form.setValue("role", defaultRole as any);
      form.handleSubmit(handleSubmit)();
      return;
    }

    setStep(2);
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

              <Button
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
