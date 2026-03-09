"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CustomInviteMessageProps {
  eventName: string;
  defaultMessage: string;
  onSave: (message: string) => void;
  isSaving?: boolean;
}

export function CustomInviteMessage({
  defaultMessage,
  onSave,
  isSaving = false,
}: CustomInviteMessageProps) {

  const [message, setMessage] = useState(defaultMessage);
  const [preview] = useState("");
  const [showPreview] = useState(false);

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  const maxLength = 500;
  const remainingChars = maxLength - message.length;

  const handleSave = () => {
    onSave(message);

    toast.success("Confirmation message saved successfully!");
  };

  const hasTemplateVariables = message.includes("{");

  return (
    <Card className="border rounded-xl">
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            RSVP Confirmation Message
          </CardTitle>

          <Mail className="w-5 h-5 text-pink-500" />
        </div>

        <CardDescription>
          Customize the message attendees receive when they RSVP to your event.
          Use template variables like{" "}
          <span className="font-medium text-purple-600">
            {"{attendeeName}"}
          </span>
          ,{" "}
          <span className="font-medium text-purple-600">
            {"{eventName}"}
          </span>
          ,{" "}
          <span className="font-medium text-purple-600">
            {"{eventDate}"}
          </span>
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* TEXTAREA */}
        <div className="space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Example: Thanks for confirming, {attendeeName}! We're excited to see you at {eventName} on {eventDate}. 🎉"
            rows={6}
            maxLength={maxLength}
            className="resize-none"
          />

          <div className="flex justify-between text-xs">
            <span
              className={
                remainingChars < 50 ? "text-red-500" : "text-muted-foreground"
              }
            >
              {remainingChars} characters remaining
            </span>

            {hasTemplateVariables && (
              <span className="text-purple-600">
                ✓ Template variables detected
              </span>
            )}
          </div>
        </div>

        {/* PREVIEW */}
        {showPreview && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Preview</AlertTitle>
            <AlertDescription>{preview}</AlertDescription>
          </Alert>
        )}

        {/* TIP ALERT */}
        <Alert className="bg-purple-50 border-purple-200">
          <AlertCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-sm">
            💡 <strong>Tip:</strong> A warm confirmation message makes attendees
            feel valued and increases show-up rates.
          </AlertDescription>
        </Alert>

        {/* ACTION */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!message.trim() || isSaving}
            className="bg-linear-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
          >
            {isSaving ? "Saving..." : "Save Confirmation Message"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}