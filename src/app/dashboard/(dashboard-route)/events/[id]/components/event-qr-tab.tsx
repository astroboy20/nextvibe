/* eslint-disable @next/next/no-img-element */
"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Download, Share2, Copy, Check } from "lucide-react";
import { useState } from "react";

interface EventQRTabProps {
  event: {
    title: string;
    id?: string;
  };
}

export function EventQRTab({ event }: EventQRTabProps) {
  const [copied, setCopied] = useState(false);
  const eventUrl = `nextvibe.com/event/${event.id || "1"}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(eventUrl)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* QR Code Display */}
      <Card className="overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center">
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-lg">
            <img 
              src={qrCodeUrl} 
              alt="Event QR Code"
              className="h-48 w-48"
            />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground text-center">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Scan to view event details
          </p>
        </CardContent>
      </Card>

      {/* Event Link */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Event Link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-xl border border-border bg-muted/50 px-4 py-3">
            <p className="text-sm font-medium truncate">{eventUrl}</p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-xl flex-shrink-0"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 rounded-2xl">
          <Download className="h-5 w-5" />
          <span className="text-sm">Download QR</span>
        </Button>
        <Button variant="outline" className="h-auto flex-col gap-2 py-4 rounded-2xl">
          <Share2 className="h-5 w-5" />
          <span className="text-sm">Share Event</span>
        </Button>
      </div>

      {/* Usage Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">Pro Tip</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Print this QR code on your event flyers, banners, or share it on social media to help guests quickly access event details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
