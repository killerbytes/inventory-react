import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import type { ControllerRenderProps } from "react-hook-form";
import type { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import React from "react";

interface DateRangePickerProps {
  field: ControllerRenderProps<any, any>;
  className?: string;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
  numberOfMonths?: number;
}

export default function DateRangePicker({
  field,
  className,
  placeholder = "Pick a date range",
  disabled,
  numberOfMonths = 2,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedRange: DateRange | undefined) => {
    if (!selectedRange) {
      field.onChange({ from: undefined, to: undefined });
      return;
    }

    field.onChange(selectedRange);

    // Close the popover only when both dates are selected
    if (selectedRange.from && selectedRange.to) {
      setOpen(false);
    }
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange({ from: undefined, to: undefined });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal group",
            !field.value?.from && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {field.value?.from ? (
            field.value.to ? (
              <>
                {format(field.value.from, "LLL dd, y")} -{" "}
                {format(field.value.to, "LLL dd, y")}
              </>
            ) : (
              format(field.value.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
          {field.value?.from && (
            <span
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
              onClick={clearSelection}
            >
              Clear
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={field.value?.from || new Date()}
          selected={{
            from: field.value?.from,
            to: field.value?.to,
          }}
          onSelect={handleSelect}
          numberOfMonths={numberOfMonths}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
