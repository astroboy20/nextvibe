"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Link2 } from "lucide-react";
import { toast } from "sonner";

interface ReferralLinkCardProps {
  affiliateCode: string;
}

export function ReferralLinkCard({ affiliateCode }: ReferralLinkCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?ref=${affiliateCode}`
      : `https://mynextvibe.com/signup?ref=${affiliateCode}`;

  const copyText = async (text: string, type: "link" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
      toast.success(
        type === "link" ? "Referral link copied!" : "Affiliate code copied!"
      );
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4 text-primary" />
          Your Referral Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Share URL */}
        <div className="flex gap-2">
          <Input
            readOnly
            value={shareUrl}
            className="h-9 rounded-xl text-xs font-mono bg-muted/50 flex-1 min-w-0"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl shrink-0 gap-1.5"
            onClick={() => copyText(shareUrl, "link")}
          >
            {copiedLink ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedLink ? "Copied" : "Copy Link"}
          </Button>
        </div>

        {/* Affiliate code */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
              Your Code
            </p>
            <p className="font-mono text-lg font-bold text-primary">
              {affiliateCode}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 rounded-lg"
            onClick={() => copyText(affiliateCode, "code")}
          >
            {copiedCode ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copiedCode ? "Copied" : "Copy Code"}
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Share this link with event organizers. They get 5% off their first
          plan purchase, and you earn 10% commission on every plan they buy.
        </p>
      </CardContent>
    </Card>
  );
}
