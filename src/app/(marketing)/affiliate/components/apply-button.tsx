"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <Button asChild size={size} variant={variant} className={`rounded-lg ${className}`}>
      <Link href="/auth/register">
        Become an affiliate <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </Button>
  );
}
