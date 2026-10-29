"use client";
import Link from "next/link";
import { ArrowRight, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useState } from "react";
import { useGetAffiliateStatusQuery } from "@/features/affiliate/api/affiliate-api";
import { toast } from "sonner";

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
  const [copied, setCopied] = useState(false);

  const isLoggedIn = !!Cookies.get("accessToken");

  // Only fire this query when the user has a session — no point hitting the
  // endpoint for logged-out visitors browsing the marketing page.
  const { data: affiliateStatus, isLoading } = useGetAffiliateStatusQuery(
    undefined,
    { skip: !isLoggedIn }
  );

  // Backend wraps: { success, data: { isAffiliate, profile } }
  const isAffiliate = isLoggedIn && affiliateStatus?.data?.isAffiliate === true;
  const affiliateCode = affiliateStatus?.data?.profile?.affiliateCode;

  const shareUrl =
    typeof window !== "undefined" && affiliateCode
      ? `${window.location.origin}/auth/register?ref=${affiliateCode}`
      : null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  // Still loading affiliate status
  if (isLoggedIn && isLoading) {
    return (
      <Button size={size} variant={variant} disabled className={`rounded-lg ${className}`}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading…
      </Button>
    );
  }

  // Already an affiliate — show copy-link + go-to-dashboard options
  if (isAffiliate && affiliateCode) {
    return (
      <div className="flex flex-col items-center gap-2 sm:flex-row">
        <Button
          size={size}
          variant={variant}
          className={`rounded-lg ${className}`}
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy My Referral Link
            </>
          )}
        </Button>

        <Button
          asChild
          size={size}
          variant="outline"
          className={`rounded-lg ${className}`}
        >
          <Link href="/affiliates">
            Dashboard <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  // Logged in but not yet an affiliate — go to dashboard to register
  if (isLoggedIn) {
    return (
      <Button asChild size={size} variant={variant} className={`rounded-lg ${className}`}>
        <Link href="/affiliates">
          Become an affiliate <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    );
  }

  // Logged out — go to register
  return (
    <Button asChild size={size} variant={variant} className={`rounded-lg ${className}`}>
      <Link href="/auth/register">
        Become an affiliate <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </Button>
  );
}
