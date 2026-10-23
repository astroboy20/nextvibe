"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReferralLinkCardProps {
  affiliateCode: string;
}

// Always resolves to the real production domain, never localhost.
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://mynextvibe.com";

export function ReferralLinkCard({ affiliateCode }: ReferralLinkCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const shareUrl = `${APP_URL}/signup?ref=${affiliateCode}`;

  const copy = async (text: string, type: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
      toast.success(type === "link" ? "Link copied!" : "Code copied!");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const shareText =
    `🎉 Join NextVibe and let's create unforgettable events together!\n\n` +
    `Use my referral code *${affiliateCode}* when signing up and get 5% off your first event plan.\n\n` +
    `Sign up here 👇\n${shareUrl}`;

  const handleShare = async () => {
    // Use native share sheet on mobile; fall back to clipboard on desktop.
    // We put everything in `text` (code + URL) so messaging apps like
    // WhatsApp show the full message rather than just a bare link preview.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Join me on NextVibe", text: shareText });
      } catch {
        // User dismissed — not an error
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Share text copied to clipboard!");
      } catch {
        toast.error("Could not copy to clipboard.");
      }
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Referral link</h3>
          <span className="text-xs text-muted-foreground">10% per sale</span>
        </div>

        {/* Code row */}
        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Your code
            </p>
            <p className="mt-0.5 truncate font-mono text-sm font-bold text-foreground">
              {affiliateCode}
            </p>
          </div>
          <button
            onClick={() => copy(affiliateCode, "code")}
            className="ml-3 shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
          >
            {copiedCode
              ? <Check className="h-3.5 w-3.5 text-green-600" />
              : <Copy className="h-3.5 w-3.5" />}
            {copiedCode ? "Copied" : "Copy"}
          </button>
        </div>

        {/* URL row */}
        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Share link
            </p>
            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
              {shareUrl}
            </p>
          </div>
          <button
            onClick={() => copy(shareUrl, "link")}
            className="ml-3 shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
          >
            {copiedLink
              ? <Check className="h-3.5 w-3.5 text-green-600" />
              : <Copy className="h-3.5 w-3.5" />}
            {copiedLink ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Share CTA */}
        <Button
          className="w-full gap-2 rounded-xl bg-[#531342] text-white hover:bg-[#531342]/90"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          Share My Referral Link
        </Button>

        <p className="text-[11px] text-muted-foreground">
          Referred organizers get 5% off their first plan. You earn 10% on every plan they ever buy.
        </p>
      </CardContent>
    </Card>
  );
}
