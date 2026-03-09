"use client";

import * as React from "react";
import { Input } from "./input";
import { Label } from "./label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateTimePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
}

export function DateTimePicker({ label, value, onChange, required }: DateTimePickerProps) {
  const [dateInput, setDateInput] = React.useState(value ? format(value, "yyyy-MM-dd") : "");
  const [timeInput, setTimeInput] = React.useState(value ? format(value, "HH:mm") : "");

  React.useEffect(() => {
    if (value) {
      setDateInput(format(value, "yyyy-MM-dd"));
      setTimeInput(format(value, "HH:mm"));
    }
  }, [value]);

  const handleChange = () => {
    if (!dateInput || !timeInput) {
      onChange(null);
      return;
    }
    const combined = new Date(`${dateInput}T${timeInput}`);
    onChange(combined);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <Label>{label}{required ? " *" : ""}</Label>}
      <div className="flex gap-2 items-center">
        <Input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          onBlur={handleChange}
        />
        <Input
          type="time"
          value={timeInput}
          onChange={(e) => setTimeInput(e.target.value)}
          onBlur={handleChange}
        />
        <CalendarIcon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
}