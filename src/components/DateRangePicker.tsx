import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { endOfDay, format, startOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, X } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (value: DateRange) => void;
  className?: string;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  numberOfMonths?: number;
}

export default function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date range",
  disabled,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    if (!selectedRange) {
      onChange({ from: undefined, to: undefined });
      return;
    }
    const { from, to } = selectedRange;
    onChange({
      from: from,
      to: to,
    });
    // Close the popover only when both dates are selected
    if (selectedRange.from && selectedRange.to) {
      // setOpen(false);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: undefined, to: undefined });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal group",
            !value?.from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "LLL dd, y")} -{" "}
                {format(value.to, "LLL dd, y")}
              </>
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
          {value?.from && (
            <span
              className="ml-auto transition-opacity text-muted-foreground"
              onClick={clearSelection}
            >
              <X />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={value?.from || new Date()}
          selected={{
            from: value?.from ? startOfDay(value.from) : undefined,
            to: value?.to ? endOfDay(value.to) : undefined,
          }}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
