"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import GoogleLoginButton from "@/app/(auth)/components/google-login-button";
import { setIsAuthenticated, setUser } from "@/app/provider/slices/user";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLoginMutation } from "@/app/provider/api/authApi";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginContent = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginMutation, { isLoading }] = useLoginMutation();

  const from = searchParams.get("from") || "/events";
  const defaultRole = searchParams.get("DEFAULT_ROLE") || "";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const queryParams = new URLSearchParams();
  if (searchParams.get("from")) queryParams.set("from", from);
  if (searchParams.get("DEFAULT_ROLE"))
    queryParams.set("DEFAULT_ROLE", defaultRole);

  const registerUrl = `/auth/register${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const handleSubmit = async (values: LoginFormValues) => {
    const { email, password } = values;

    const body = { email, password };
    try {
      const res = await loginMutation(body).unwrap();
      toast.success("Login success");
      dispatch(setIsAuthenticated(true));
      dispatch(setUser({ ...res.data.user }));
      router.replace(from);
    } catch (error: any) {
      toast(error?.data?.message || "Login Error");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex flex-col gap-6">
          <div className="space-y-5">
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
                      className="h-11 rounded-lg border-gray-300 focus-visible:ring-[#5B1A57] focus-visible:border-[#5B1A57]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className="h-11 rounded-lg border-gray-300 pr-10 focus-visible:ring-[#5B1A57] focus-visible:border-[#5B1A57]"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
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

            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold text-gray-700 hover:text-[#5B1A57] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#5B1A57] hover:bg-[#4a1446] text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </Button>
        </div>

        <div className="relative flex items-center gap-3 my-2">
          <Separator className="flex-1" />
          <span className="text-xs text-gray-400 font-medium shrink-0">OR</span>
          <Separator className="flex-1" />
        </div>

        <div className="flex flex-col items-center gap-4 ">
          <div className=" w-full">
            <GoogleLoginButton />
          </div>

          <p className="text-center text-sm font-medium text-gray-600 mt-2">
            Don&apos;t have an account?{" "}
            <Link
              href={registerUrl}
              className="font-bold text-[#5B1A57] hover:underline underline-offset-2 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
};

export default LoginContent;
