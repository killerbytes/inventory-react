"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ControllerRenderProps } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DatePickerProps {
  field: ControllerRenderProps<any, any>;
  disabled?: (date: Date) => boolean;
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
  align?: "start" | "end" | "center";
  fromYear?: number;
  toYear?: number;
}

export default function DatePicker({
  field,
  disabled = (date) => date > new Date() || date < new Date("1900-01-01"),
  className,
  buttonClassName,
  placeholder = "Pick a date",
  align = "start",
  fromYear,
  toYear,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full pl-3 text-left font-normal",
            !field.value && "text-muted-foreground",
            buttonClassName,
          )}
        >
          {field.value ? (
            format(new Date(field.value), "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-auto p-0", className)} align={align}>
        <Calendar
          mode="single"
          selected={field.value ? new Date(field.value) : undefined}
          onSelect={(value) => {
            setOpen(false);
            field.onChange(value);
          }}
          disabled={disabled}
          initialFocus
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  );
}
