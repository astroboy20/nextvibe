/* eslint-disable @next/next/no-img-element */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Download, Share2, Copy, Check } from "lucide-react";
import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface EventQRTabProps {
  event: any;
}

export function EventQRTab({ event }: EventQRTabProps) {
  const [copied, setCopied] = useState(false);
  const domain = typeof window !== "undefined" ? window.location.origin : "";
  const eventUrl = `${domain}/dashboard/events/${event.id || "1"}`;
  const qrRef = useRef<SVGSVGElement | null>(null);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.name,
          text: "Check out this event",
          url: eventUrl,
        });
      } else {
        await navigator.clipboard.writeText(eventUrl);
        alert("Link copied to clipboard");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `${event.name}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgString);
  };

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
            <QRCodeSVG value={event?.qrCode} size={200} ref={qrRef} />
            {/* <img src={qrCodeUrl} alt="Event QR Code" className="h-48 w-48" /> */}
          </div>
          <h3 className="font-display text-lg font-bold text-foreground text-center">
            {event.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Scan to view event details
          </p>
        </CardContent>
      </Card>

      {/* Event Link */}
      <div className="w-full max-w-md">
        <p className="text-xs text-muted-foreground mb-2">Event Link</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 rounded-xl border border-border bg-muted/50 px-4 py-3">
            <p className="text-sm font-medium truncate">{eventUrl}</p>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-xl shrink-0"
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
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4 rounded-2xl"
          onClick={handleDownload}
        >
          <Download className="h-5 w-5" />
          <span className="text-sm">Download QR</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto flex-col gap-2 py-4 rounded-2xl"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5" />
          <span className="text-sm">Share Event</span>
        </Button>
      </div>

      {/* Usage Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">Pro Tip</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Print this QR code on your event flyers, banners, or share it on
                social media to help guests quickly access event details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
