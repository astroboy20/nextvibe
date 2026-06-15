"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Bell,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  XCircle,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetRemindersQuery,
  useUpsertReminderMutation,
  useToggleReminderMutation,
  useDeleteReminderMutation,
  useGetReminderLogsQuery,
  ReminderTiming,
  RsvpStatus,
  ReminderTemplate,
} from "@/app/provider/api/reminderApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIMINGS: { value: ReminderTiming; label: string; description: string }[] =
  [
    {
      value: "SEVEN_DAYS",
      label: "7 Days Before",
      description: "One-week heads up",
    },
    {
      value: "FIVE_DAYS",
      label: "5 Days Before",
      description: "Mid-week awareness",
    },
    {
      value: "THREE_DAYS",
      label: "3 Days Before",
      description: "Prep reminder",
    },
    {
      value: "ONE_DAY",
      label: "1 Day Before",
      description: "Final nudge",
    },
  ];

const RSVP_STATUSES: { value: RsvpStatus; label: string }[] = [
  { value: "CONFIRMED", label: "Going ✓" },
  { value: "WAITLISTED", label: "Maybe" },
];

const PLACEHOLDER_CHIPS = [
  { token: "{{name}}", hint: "Attendee's display name", sample: "Alex" },
  { token: "{{eventName}}", hint: "The event name", sample: "Summer Bash 2026" },
  { token: "{{date}}", hint: "Event date & time", sample: "Monday, June 23, 2026, 07:00 PM" },
  { token: "{{location}}", hint: "Venue / location", sample: "The Rooftop, Lagos" },
];

const SAMPLE_VALUES: Record<string, string> = Object.fromEntries(
  PLACEHOLDER_CHIPS.map((c) => [c.token, c.sample])
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Replace every known {{token}} with its sample value.
 * Returns segments so we can highlight substituted parts in the preview.
 */
function applyPreview(text: string): string {
  return Object.entries(SAMPLE_VALUES).reduce(
    (acc, [token, val]) => acc.replaceAll(token, val),
    text
  );
}

/**
 * Returns a JSX array where {{tokens}} are highlighted in the preview panel.
 */
function renderPreviewHighlighted(text: string): React.ReactNode[] {
  const tokenPattern = /(\{\{[^}]+\}\})/g;
  const parts = text.split(tokenPattern);
  return parts.map((part, i) => {
    const chip = PLACEHOLDER_CHIPS.find((c) => c.token === part);
    if (chip) {
      return (
        <span
          key={i}
          className="inline rounded bg-primary/15 px-1 text-primary font-medium"
        >
          {chip.sample}
        </span>
      );
    }
    // unknown token — flag it
    if (/^\{\{[^}]+\}\}$/.test(part)) {
      return (
        <span key={i} className="inline rounded bg-destructive/15 px-1 text-destructive font-medium">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function hasUnknownTokens(text: string): boolean {
  const found = text.match(/\{\{[^}]+\}\}/g) ?? [];
  const known = PLACEHOLDER_CHIPS.map((c) => c.token);
  return found.some((t) => !known.includes(t));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatusDotProps {
  template?: ReminderTemplate;
}
function StatusDot({ template }: StatusDotProps) {
  if (!template) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-gray-300" />
        Not set
      </span>
    );
  }
  if (template.enabled) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Active
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-amber-600">
      <span className="h-2 w-2 rounded-full bg-amber-400" />
      Paused
    </span>
  );
}

interface PlaceholderChipsProps {
  /** Which field is currently focused — chips insert into that field */
  activeField: "subject" | "message";
  onInsert: (token: string) => void;
}
function PlaceholderChips({ activeField, onInsert }: PlaceholderChipsProps) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground">
        Click a token to insert at cursor{" "}
        <span className="text-primary font-medium">
          ({activeField === "subject" ? "subject" : "message"})
        </span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PLACEHOLDER_CHIPS.map((chip) => (
          <button
            key={chip.token}
            type="button"
            title={chip.hint}
            onClick={() => onInsert(chip.token)}
            className="group flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs text-primary hover:bg-primary/20 hover:border-primary/60 active:scale-95 transition-all"
          >
            <span className="font-mono">{chip.token}</span>
            <span className="text-[9px] text-muted-foreground group-hover:text-primary/70 hidden sm:inline">
              → {chip.sample}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Per-card reminder editor ─────────────────────────────────────────────────

interface ReminderCardProps {
  eventId: string;
  timing: ReminderTiming;
  rsvpStatus: RsvpStatus;
  template?: ReminderTemplate;
  eventStartsAt?: string;
}

function ReminderCard({
  eventId,
  timing,
  rsvpStatus,
  template,
  eventStartsAt,
}: ReminderCardProps) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [message, setMessage] = useState(template?.message ?? "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Track which field was last focused so chips know where to insert
  const [activeField, setActiveField] = useState<"subject" | "message">("subject");

  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const [upsert, { isLoading: isSaving }] = useUpsertReminderMutation();
  const [toggle, { isLoading: isToggling }] = useToggleReminderMutation();
  const [remove, { isLoading: isDeleting }] = useDeleteReminderMutation();

  const templateSubject = template?.subject ?? "";
  const templateMessage = template?.message ?? "";
  const isDirty = subject !== templateSubject || message !== templateMessage;

  // Days-before warning
  let daysWarning: string | null = null;
  if (eventStartsAt && timing) {
    const daysMap: Record<ReminderTiming, number> = {
      ONE_DAY: 1,
      THREE_DAYS: 3,
      FIVE_DAYS: 5,
      SEVEN_DAYS: 7,
    };
    const daysNeeded = daysMap[timing];
    const daysUntil = Math.ceil(
      (new Date(eventStartsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil < daysNeeded) {
      daysWarning = `Event is ${daysUntil <= 0 ? "in the past" : `${daysUntil}d away`} — this reminder won't send.`;
    }
  }

  // Validation
  const subjectErr =
    subject.length > 0 && subject.length < 3
      ? "Min 3 characters"
      : subject.length > 150
      ? "Max 150 characters"
      : null;
  const messageErr =
    message.length > 0 && message.length < 10
      ? "Min 10 characters"
      : message.length > 2000
      ? "Max 2000 characters"
      : null;
  const unknownSubject = hasUnknownTokens(subject);
  const unknownMessage = hasUnknownTokens(message);
  const canSave =
    subject.length >= 3 &&
    subject.length <= 150 &&
    message.length >= 10 &&
    message.length <= 2000 &&
    !unknownSubject &&
    !unknownMessage;

  // Has any content worth previewing
  const hasContent = subject.length > 0 || message.length > 0;

  function insertAtCursor(token: string) {
    if (activeField === "subject" && subjectRef.current) {
      const el = subjectRef.current;
      const start = el.selectionStart ?? subject.length;
      const end = el.selectionEnd ?? subject.length;
      const next = subject.slice(0, start) + token + subject.slice(end);
      setSubject(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + token.length, start + token.length);
      });
    } else if (activeField === "message" && messageRef.current) {
      const el = messageRef.current;
      const start = el.selectionStart ?? message.length;
      const end = el.selectionEnd ?? message.length;
      const next = message.slice(0, start) + token + message.slice(end);
      setMessage(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + token.length, start + token.length);
      });
    }
  }

  async function handleSave() {
    try {
      await upsert({ eventId, timing, rsvpStatus, subject, message }).unwrap();
      toast.success("Reminder saved");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to save reminder");
    }
  }

  async function handleToggle(enabled: boolean) {
    if (!template) return;
    try {
      await toggle({ eventId, templateId: template.id, enabled }).unwrap();
      toast.success(enabled ? "Reminder enabled" : "Reminder paused");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to toggle reminder");
    }
  }

  async function handleDelete() {
    if (!template) return;
    try {
      await remove({ eventId, templateId: template.id }).unwrap();
      toast.success("Reminder deleted");
      setSubject("");
      setMessage("");
      setShowDeleteConfirm(false);
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete reminder");
    }
  }

  const rsvpLabel =
    RSVP_STATUSES.find((r) => r.value === rsvpStatus)?.label ?? rsvpStatus;

  // Preview content — shown when there's any content
  const previewSubject = subject ? renderPreviewHighlighted(subject) : null;
  const previewMessage = message ? renderPreviewHighlighted(message) : null;

  return (
    <div
      className={cn(
        "rounded-xl border border-border transition-all duration-200",
        open && "ring-1 ring-primary/20"
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Badge
            variant="outline"
            className="shrink-0 text-[10px] border-primary/30 text-primary"
          >
            {rsvpLabel}
          </Badge>
          <StatusDot template={template} />
        </div>
        <div className="flex items-center gap-2">
          {template && (
            <Switch
              checked={template.enabled}
              disabled={isToggling}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={handleToggle}
              className="scale-75"
            />
          )}
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="border-t border-border px-3 pb-3 pt-3 space-y-3">
          {/* Days warning */}
          {daysWarning && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {daysWarning}
              </p>
            </div>
          )}

          {/* Editor + Live Preview side-by-side on wider screens */}
          <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">

            {/* ── Left: editor fields ── */}
            <div className="flex-1 space-y-3 min-w-0">

              {/* Subject */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Subject
                  </label>
                  <span
                    className={cn(
                      "text-[10px]",
                      subject.length > 150 ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {subject.length}/150
                  </span>
                </div>
                <input
                  ref={subjectRef}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onFocus={() => setActiveField("subject")}
                  placeholder="e.g. {{eventName}} is almost here!"
                  className={cn(
                    "w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors",
                    activeField === "subject"
                      ? "border-primary/50"
                      : "border-border"
                  )}
                />
                {subjectErr && (
                  <p className="text-[10px] text-destructive">{subjectErr}</p>
                )}
                {unknownSubject && (
                  <p className="text-[10px] text-amber-500">
                    Unknown token in subject
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Message
                  </label>
                  <span
                    className={cn(
                      "text-[10px]",
                      message.length > 2000 ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {message.length}/2000
                  </span>
                </div>
                <textarea
                  ref={messageRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onFocus={() => setActiveField("message")}
                  rows={5}
                  placeholder={`Hey {{name}}, just a reminder — {{eventName}} is happening on {{date}} at {{location}}. See you there!`}
                  className={cn(
                    "w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-colors",
                    activeField === "message"
                      ? "border-primary/50"
                      : "border-border"
                  )}
                />
                {messageErr && (
                  <p className="text-[10px] text-destructive">{messageErr}</p>
                )}
                {unknownMessage && (
                  <p className="text-[10px] text-amber-500">
                    Unknown token in message
                  </p>
                )}
              </div>

              {/* Token chips — shared, inserts into whichever field is active */}
              <PlaceholderChips
                activeField={activeField}
                onInsert={insertAtCursor}
              />
            </div>

            {/* ── Right: live preview panel ── */}
            <div className="lg:w-56 xl:w-64 shrink-0">
              <div
                className={cn(
                  "rounded-xl border h-full transition-colors",
                  hasContent
                    ? "border-primary/20 bg-primary/[0.03]"
                    : "border-dashed border-border bg-muted/20"
                )}
              >
                {/* Preview header */}
                <div className="flex items-center gap-1.5 border-b border-inherit px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-primary/40" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Live Preview
                  </span>
                </div>

                {/* Preview body */}
                <div className="px-3 py-2.5 space-y-2">
                  {hasContent ? (
                    <>
                      {/* Simulated email "from" line */}
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Bell className="h-2.5 w-2.5 text-primary" />
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">
                          NextVibe · Event Reminder
                        </span>
                      </div>

                      {/* Subject line */}
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground mb-0.5">
                          Subject
                        </p>
                        <p className="text-xs font-semibold text-foreground leading-snug">
                          {previewSubject ?? (
                            <span className="italic text-muted-foreground font-normal">
                              No subject yet
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-border/60" />

                      {/* Message body */}
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground mb-0.5">
                          Message
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {previewMessage ?? (
                            <span className="italic">No message yet</span>
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                      <Bell className="h-5 w-5 text-muted-foreground/40" />
                      <p className="text-[10px] text-muted-foreground">
                        Start typing to see
                        <br />
                        a live preview here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              disabled={!canSave || isSaving || !isDirty}
              onClick={handleSave}
              className="h-8 rounded-lg bg-[#531342] hover:bg-[#531342]/90 text-white text-xs flex-1"
            >
              {isSaving ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving…
                </span>
              ) : (
                "Save"
              )}
            </Button>
            {template && !showDeleteConfirm && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                title="Delete reminder"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {showDeleteConfirm && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-destructive">Delete?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="h-7 px-2 text-xs rounded-lg"
                >
                  {isDeleting ? "…" : "Yes"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-7 px-2 text-xs rounded-lg"
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Delivery Logs Panel ──────────────────────────────────────────────────────

interface LogsPanelProps {
  eventId: string;
}
function LogsPanel({ eventId }: LogsPanelProps) {
  const { data, isLoading } = useGetReminderLogsQuery(eventId);
  const [filter, setFilter] = useState<{
    timing: string;
    rsvpStatus: string;
    sent: string;
  }>({ timing: "all", rsvpStatus: "all", sent: "all" });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  const summary = data?.summary;
  const logs = data?.logs ?? [];

  const filtered = logs.filter((l) => {
    if (filter.timing !== "all" && l.timing !== filter.timing) return false;
    if (filter.rsvpStatus !== "all" && l.rsvpStatus !== filter.rsvpStatus)
      return false;
    if (filter.sent === "sent" && !l.sent) return false;
    if (filter.sent === "pending" && l.sent) return false;
    return true;
  });

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;
  const hasErrors = logs.some((l) => l.error);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-2">
          {TIMINGS.map(({ value, label }) => {
            const s = summary[value];
            if (!s) return null;
            return (
              <div
                key={value}
                className="rounded-xl border border-border bg-muted/30 p-3 space-y-1"
              >
                <p className="text-[10px] text-muted-foreground font-medium">
                  {label}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    {s.sent}
                  </span>
                  {s.failed > 0 && (
                    <span className="flex items-center gap-1 text-xs text-destructive">
                      <XCircle className="h-3 w-3" />
                      {s.failed}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {s.pending}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      {logs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <select
            value={filter.timing}
            onChange={(e) => {
              setFilter((f) => ({ ...f, timing: e.target.value }));
              setPage(1);
            }}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="all">All intervals</option>
            {TIMINGS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={filter.rsvpStatus}
            onChange={(e) => {
              setFilter((f) => ({ ...f, rsvpStatus: e.target.value }));
              setPage(1);
            }}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="all">All RSVP</option>
            <option value="CONFIRMED">Going</option>
            <option value="WAITLISTED">Maybe</option>
          </select>
          <select
            value={filter.sent}
            onChange={(e) => {
              setFilter((f) => ({ ...f, sent: e.target.value }));
              setPage(1);
            }}
            className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
          >
            <option value="all">All status</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      )}

      {/* Logs table */}
      {filtered.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground py-6">
          No delivery logs yet.
        </p>
      ) : (
        <div className="space-y-1.5">
          {paginated.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {log.user.displayName || log.user.username}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {TIMINGS.find((t) => t.value === log.timing)?.label} ·{" "}
                  {log.rsvpStatus === "CONFIRMED" ? "Going" : "Maybe"}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {log.sent ? (
                  <span className="flex items-center gap-1 text-[10px] text-green-600">
                    <Send className="h-3 w-3" />
                    Sent
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Pending
                  </span>
                )}
                {hasErrors && log.error && (
                  <span
                    title={log.error}
                    className="cursor-help text-[10px] text-destructive"
                  >
                    ⚠️
                  </span>
                )}
              </div>
            </div>
          ))}
          {hasMore && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full text-center text-xs text-primary underline-offset-2 hover:underline py-1"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface EventRemindersContentProps {
  eventId: string;
  eventStartsAt?: string;
  eventStatus?: string;
}

export default function EventRemindersContent({
  eventId,
  eventStartsAt,
  eventStatus,
}: EventRemindersContentProps) {
  const { data: templates = [], isLoading } = useGetRemindersQuery(eventId);
  const [showLogs, setShowLogs] = useState(false);

  // Build a lookup map: `${timing}_${rsvpStatus}` → template
  const templateMap = templates.reduce<Record<string, ReminderTemplate>>(
    (acc, t) => {
      acc[`${t.timing}_${t.rsvpStatus}`] = t;
      return acc;
    },
    {}
  );

  const activeCount = templates.filter((t) => t.enabled).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 space-y-0.5">
        <p className="text-xs font-medium text-foreground">
          Automated email reminders
        </p>
        <p className="text-[11px] text-muted-foreground">
          The backend sends these automatically — no scheduling needed. Up to 8
          templates (4 intervals × 2 RSVP statuses). Each attendee receives each
          reminder at most once.
        </p>
        {eventStatus === "DRAFT" && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-amber-600">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            Reminders only send for PUBLISHED events.
          </div>
        )}
      </div>

      {/* Interval rows */}
      {TIMINGS.map(({ value: timing, label, description }) => (
        <div key={timing} className="space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-primary/70" />
            <span className="text-xs font-semibold text-foreground">
              {label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              — {description}
            </span>
          </div>
          <div className="space-y-2 pl-5">
            {RSVP_STATUSES.map(({ value: rsvpStatus }) => (
              <ReminderCard
                key={`${timing}_${rsvpStatus}`}
                eventId={eventId}
                timing={timing}
                rsvpStatus={rsvpStatus}
                template={templateMap[`${timing}_${rsvpStatus}`]}
                eventStartsAt={eventStartsAt}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Delivery logs toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowLogs((s) => !s)}
          className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors"
        >
          <span className="flex items-center gap-2 text-xs font-medium text-foreground">
            <BarChart2 className="h-4 w-4 text-primary" />
            Delivery Logs
            {activeCount > 0 && (
              <Badge className="bg-primary/10 text-primary text-[10px]">
                {activeCount} active
              </Badge>
            )}
          </span>
          {showLogs ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {showLogs && (
          <div className="mt-3">
            <LogsPanel eventId={eventId} />
          </div>
        )}
      </div>
    </div>
  );
}
