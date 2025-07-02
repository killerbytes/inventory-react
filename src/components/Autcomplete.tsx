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
import { FormControl } from "./ui/form";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface AutocompleteProps<T> {
  value: T;
  items: T[];
  placeholder: string;
  onChange: (value: T) => void;
  valueKey?: string;
}

export default function Autocomplete<T>({
  value,
  items,
  placeholder,
  onChange,
  valueKey = "name",
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
          {value
            ? valueKey.split(".").reduce(
                (obj, key) => obj?.[key],
                items.find((item) => {
                  return item.id === value?.id;
                }),
              )
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search product..." className="h-9" />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  disabled={item.quantity === 0}
                  value={item.id}
                  key={item.id}
                  onSelect={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  {valueKey.split(".").reduce((obj, key) => obj?.[key], item)}
                  <Check
                    className={cn(
                      "ml-auto",
                      item.id === value ? "opacity-100" : "opacity-0",
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
