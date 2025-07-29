import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { SyntheticEvent } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface AutocompleteProps<T> {
  value: string | undefined;
  options: T[];
  placeholder?: string;
  onChange: (e: SyntheticEvent<HTMLSelectElement>) => void;
  valueKey?: string;
  labelKey?: string;
  name?: string;
}

export default function Autocomplete<T>({
  value,
  onChange,
  options = [],
  placeholder = "Type to search...",
  valueKey = "id",
  labelKey = "name",
  name,
}: AutocompleteProps<T>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild className="w-full">
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
          )}
        >
          {value}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup heading="Products">
              {options.map((item) => (
                <CommandItem
                  // disabled={item.quantity === 0}
                  value={item[valueKey]}
                  key={item[valueKey]}
                  onSelect={() => {
                    const e = {
                      target: { value: item[valueKey], name },
                    } as React.ChangeEvent<HTMLSelectElement>;

                    onChange(e);
                    setOpen(false);
                  }}
                >
                  {labelKey.split(".").reduce((obj, key) => obj?.[key], item)}
                  <Check
                    className={cn(
                      "ml-auto",
                      item[valueKey] === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
