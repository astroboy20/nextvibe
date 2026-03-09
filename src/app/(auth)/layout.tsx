"use client";


import { NewLogo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-6 sm:px-6">
      <div
        className="
          w-full
          max-w-md
          rounded-xl
          border
          bg-card/95
          backdrop-blur
          text-card-foreground
          shadow-lg
          p-6 sm:p-8 md:p-10
        "
      >
        <div className="space-y-2 text-center pb-6">
          <Link href="/" className="flex justify-center mb-2">
            <NewLogo />
          </Link>

          <h1 className="font-display text-xl sm:text-2xl font-semibold">
            {pathname.startsWith("/auth/login")
              ? "Welcome back"
              : "Join NextVibe"}
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground">
            {pathname.startsWith("/auth/login")
              ? "Sign in to continue your vibe"
              : "Create your account and start vibing"}
          </p>
        </div>

        <div
          className={cn(
            "w-full",
            pathname.startsWith("/auth/register") &&
              "max-h-[60vh] overflow-y-auto no-scrollbar"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
