/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Bell, Clock, Info, Calendar, Plus, Trash2 } from "lucide-react";
import { AutomatedReminder, ReminderType } from "@/types/event.type";
import { toast } from "sonner";

interface AutomatedReminderConfigProps {
  eventId?: string;
  existingReminders: AutomatedReminder[];
  onSave: (
    reminders: Omit<
      AutomatedReminder,
      "id" | "eventId" | "sentCount" | "lastSentAt"
    >[] | any []
  ) => void;
  isSaving?: boolean;
}

interface ReminderConfig {
  type: ReminderType;
  enabled: boolean;
  message: string;
  recipientFilter: "all" | "rsvp_confirmed" | "rsvp_pending";
  triggerTime?: string;
}

interface CustomReminder {
  id: string;
  message: string;
  recipientFilter: "all" | "rsvp_confirmed" | "rsvp_pending";
  customDaysBefore: number;
  customTimeOfDay: string;
}

const DEFAULT_REMINDERS: Record<
  Exclude<ReminderType, "custom">,
  ReminderConfig
> = {
  one_day_before: {
    type: "one_day_before",
    enabled: false,
    message:
      "Tomorrow's the day! {eventName} is happening. We can't wait to see you there!",
    recipientFilter: "rsvp_confirmed",
    triggerTime: "09:00",
  },
  one_hour_before: {
    type: "one_hour_before",
    enabled: false,
    message: "{eventName} starts in 1 hour! Time to get ready. See you soon!",
    recipientFilter: "rsvp_confirmed",
  },
  event_day: {
    type: "event_day",
    enabled: false,
    message: "Today's the day! {eventName} is happening. Get ready!",
    recipientFilter: "rsvp_confirmed",
    triggerTime: "08:00",
  },
};

const REMINDER_INFO = {
  one_day_before: "Sent 24 hours before event start time",
  one_hour_before: "Sent 1 hour before event start time",
  event_day: "Sent on the morning of the event",
};

export function AutomatedReminderConfig({
  existingReminders,
  onSave,
  isSaving = false,
}: AutomatedReminderConfigProps) {
  const [reminders, setReminders] = useState({ ...DEFAULT_REMINDERS });

  const [customReminders, setCustomReminders] = useState<CustomReminder[]>([]);

  useEffect(() => {
    if (!existingReminders?.length) return;

    const updated = { ...DEFAULT_REMINDERS };

    Object.keys(DEFAULT_REMINDERS).forEach((type) => {
      const existing = existingReminders.find(
        (r) => r.type === type && r.type !== "custom"
      );

      if (existing) {
        updated[type as keyof typeof updated] = {
          type: existing.type as any,
          enabled: existing.enabled,
          message: existing.message,
          recipientFilter: existing.recipientFilter,
          triggerTime: existing.triggerTime,
        };
      }
    });

    setReminders(updated);

    setCustomReminders(
      existingReminders
        .filter((r) => r.type === "custom")
        .map((r, i) => ({
          id: r.id || `custom-${i}`,
          message: r.message,
          recipientFilter: r.recipientFilter,
          customDaysBefore: (r as any).customDaysBefore || 3,
          customTimeOfDay: r.triggerTime || "10:00",
        }))
    );
  }, [existingReminders]);

  const updateReminder = (
    type: keyof typeof reminders,
    updates: Partial<ReminderConfig>
  ) => {
    setReminders((prev) => ({
      ...prev,
      [type]: { ...prev[type], ...updates },
    }));
  };

  const addCustomReminder = () =>
    setCustomReminders((p) => [
      ...p,
      {
        id: `custom-${Date.now()}`,
        message: "Hey {attendeeName}! Friendly reminder about {eventName}.",
        recipientFilter: "all",
        customDaysBefore: 3,
        customTimeOfDay: "10:00",
      },
    ]);

  const deleteCustomReminder = (id: string) =>
    setCustomReminders((p) => p.filter((r) => r.id !== id));

  const handleSave = () => {
    const active = Object.values(reminders)
      .filter((r) => r.enabled)
      .map((r) => ({
        ...r,
        triggerCondition: "scheduled" as const,
      }));

    const custom = customReminders.map((r) => ({
      type: "custom" as const,
      enabled: true,
      message: r.message,
      recipientFilter: r.recipientFilter,
      triggerTime: r.customTimeOfDay,
      customDaysBefore: r.customDaysBefore,
      triggerCondition: "scheduled" as const,
    }));

    onSave([...active, ...custom]);

    toast.success("Reminder message(s) saved successfully!");
  };

  const enabledCount =
    Object.values(reminders).filter((r) => r.enabled).length +
    customReminders.length;


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            Automated Reminders
            {enabledCount > 0 && <Badge>{enabledCount} active</Badge>}
          </CardTitle>
          <Bell className="w-5 h-5 text-pink-500" />
        </div>

        <CardDescription>
          Set up automated reminders to boost show-up rates.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Events with automated reminders see up to{" "}
            <strong>60% higher</strong> show-up rates!
          </AlertDescription>
        </Alert>

        {Object.keys(DEFAULT_REMINDERS).map((type) => {
          const reminder = reminders[type as keyof typeof reminders];

          return (
            <Card key={type} className="p-4 space-y-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold capitalize">
                    {type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground flex gap-1 items-center">
                    <Clock className="w-3 h-3" />
                    {REMINDER_INFO[type]}
                  </p>
                </div>

                <Switch
                  checked={reminder.enabled}
                  onCheckedChange={(v) =>
                    updateReminder(type as any, { enabled: v })
                  }
                />
              </div>

              {reminder.enabled && (
                <>
                  <Textarea
                    value={reminder.message}
                    onChange={(e) =>
                      updateReminder(type as any, {
                        message: e.target.value,
                      })
                    }
                  />

                  <Select
                    value={reminder.recipientFilter}
                    onValueChange={(v) =>
                      updateReminder(type as any, {
                        recipientFilter: v as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Send to" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Attendees</SelectItem>
                      <SelectItem value="rsvp_confirmed">
                        Confirmed RSVPs
                      </SelectItem>
                      <SelectItem value="rsvp_pending">
                        Pending RSVPs
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </Card>
          );
        })}

        <Separator />

        {customReminders.map((c) => (
          <Card key={c.id} className="p-4 space-y-3">
            <div className="flex justify-between">
              <p className="font-semibold flex gap-2 items-center">
                <Calendar className="w-4 h-4" />
                Custom Reminder
              </p>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteCustomReminder(c.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>

            <Textarea
              value={c.message}
              onChange={(e) =>
                setCustomReminders((prev) =>
                  prev.map((r) =>
                    r.id === c.id ? { ...r, message: e.target.value } : r
                  )
                )
              }
            />

            <Input
              type="number"
              value={c.customDaysBefore}
              onChange={(e) =>
                setCustomReminders((prev) =>
                  prev.map((r) =>
                    r.id === c.id
                      ? {
                          ...r,
                          customDaysBefore: Number(e.target.value),
                        }
                      : r
                  )
                )
              }
            />
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={addCustomReminder}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Reminder
        </Button>

        <Separator />

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={enabledCount === 0 || isSaving}
            className="bg-linear-to-r from-pink-500 to-purple-600 text-white"
          >
            {isSaving ? "Saving..." : "Save Reminder Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
