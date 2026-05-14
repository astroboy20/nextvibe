"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GoogleLoginButton from "@/app/(auth)/components/google-login-button";
import { toast } from "sonner";
import { useRegisterMutation } from "@/app/provider/api/authApi";
import Cookies from "js-cookie";
import PasswordField from "../component/password-field";
import { useState } from "react";

const registerSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof registerSchema>;

export default function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "/events";
  const [registerMutation, { isLoading }] = useRegisterMutation();
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      displayName: "",
      username: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      const res = await registerMutation(values as any).unwrap();
      if (from) localStorage.setItem("redirect_after_auth", from);
      Cookies.set("accessToken", res?.data?.accessToken, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      Cookies.set("refreshToken", res?.data?.refreshToken, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      toast.success("Account created successfully");
      router.replace(`/dashboard/events`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <GoogleLoginButton onLoadingChange={setGoogleLoading} />

      <div className="py-4 flex items-center gap-2 text-sm text-gray-500">
        <span className="h-px bg-gray-300 flex-1" />
        OR
        <span className="h-px bg-gray-300 flex-1" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Display Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enteryour display name"
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your username"
                      className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57]"
                      {...field}
                    />
                  </FormControl>
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

            <Button
              type="submit"
              disabled={isLoading || googleLoading}
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
