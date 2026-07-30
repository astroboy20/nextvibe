"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarEvent {
  id: string;
  name: string;
  description?: string | null;
  locationName?: string | null;
  virtualLink?: string | null;
  mode?: string | null;
  startsAt: string;
  endsAt?: string | null;
}

// Format ISO date string to Google Calendar format: YYYYMMDDTHHmmssZ
function toGoogleDateFormat(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// Fall back to 3-hour duration if no endsAt — matches backend .ics and reminder emails
function getFallbackEnd(startsAt: string): string {
  return new Date(new Date(startsAt).getTime() + 3 * 60 * 60 * 1000).toISOString();
}

function buildGoogleCalendarLink(event: CalendarEvent): string {
  const start = toGoogleDateFormat(event.startsAt);
  const end = toGoogleDateFormat(event.endsAt ?? getFallbackEnd(event.startsAt));

  // For virtual events, append the join link to the description
  let details = event.description ?? "";
  if (event.mode === "VIRTUAL" && event.virtualLink) {
    details = details
      ? `${details}\n\nJoin here: ${event.virtualLink}`
      : `Join here: ${event.virtualLink}`;
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates: `${start}/${end}`,
    ...(event.locationName ? { location: event.locationName } : {}),
    ...(details ? { details } : {}),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function getIcsUrl(eventId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  return `${base}/events/${eventId}/calendar.ics`;
}

interface AddToCalendarButtonProps {
  event: CalendarEvent;
  className?: string;
}

export function AddToCalendarButton({ event, className }: AddToCalendarButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className ?? ""}`}>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full border-2 border-primary text-primary hover:bg-primary/10 font-semibold gap-1"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Calendar className="h-3.5 w-3.5" />
        Add to Calendar
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-border bg-background shadow-lg overflow-hidden"
          role="menu"
        >
          {/* Google Calendar */}
          <a
            href={buildGoogleCalendarLink(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {/* Google Calendar icon */}
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#dadce0" strokeWidth="1.5" />
              <path d="M16 2v4M8 2v4M3 9h18" stroke="#dadce0" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="3" y="4" width="18" height="5" rx="1" fill="#4285F4" />
              <text x="12" y="19" textAnchor="middle" fontSize="7" fontWeight="700" fill="#4285F4">
                {new Date(event.startsAt).getDate()}
              </text>
            </svg>
            Google Calendar
          </a>

          {/* Apple / Outlook (.ics) */}
          <a
            href={getIcsUrl(event.id)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-accent transition-colors border-t border-border"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            {/* Calendar file icon */}
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="17" rx="2" fill="#fff" stroke="#dadce0" strokeWidth="1.5" />
              <path d="M16 2v4M8 2v4M3 9h18" stroke="#dadce0" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="3" y="4" width="18" height="5" rx="1" fill="#555" />
              <path d="M8 15h8M8 18h5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Apple / Outlook (.ics)
          </a>
        </div>
      )}
    </div>
  );
}
