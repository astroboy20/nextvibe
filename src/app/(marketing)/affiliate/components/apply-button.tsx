"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

interface ApplyButtonProps {
  className?: string;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
}

export default function ApplyButton({
  className = "",
  variant = "default",
  size = "lg",
}: ApplyButtonProps) {
  // If the user already has a session, send them straight to the dashboard.
  // Otherwise, send them to register so the referral attribution still works
  // (they can log in from there if they already have an account).
  const isLoggedIn = !!Cookies.get("accessToken");
  const href = isLoggedIn ? "/affiliates" : "/auth/register";

  return (
    <Button asChild size={size} variant={variant} className={`rounded-lg ${className}`}>
      <Link href={href}>
        {isLoggedIn ? "Go to Dashboard" : "Become an affiliate"}{" "}
        <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </Button>
  );
}
