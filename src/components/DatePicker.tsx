"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DatePickerProps {
  onChange: (value: string) => void;
  value?: string;
  className?: string;
  placeholder?: string;
  align?: "start" | "end" | "center";
  disabled?: boolean;
  readOnly?: boolean;
}

export default function DatePicker({
  onChange,
  value,
  className,
  disabled,
  placeholder = "Pick a date",
  align = "start",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          {value ? format(new Date(value), "PPP") : <span>{placeholder}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", className)} align={align}>
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(value) => {
            setOpen(false);
            if (value) {
              onChange(value.toISOString());
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
