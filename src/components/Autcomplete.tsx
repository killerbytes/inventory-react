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
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface AutocompleteProps<T> {
  value: string | undefined;
  onChange: (item: T) => void;
  options: T[];
  placeholder?: string;
}

function renderOptionsDefault<T extends { id: number | string; name: string }>({
  options,
  setOpen,
  onChange,
  value,
}: {
  options: T[];
  setOpen: (open: boolean) => void;
  onChange: (item: T) => void;
  value: string | undefined;
}) {
  return (
    <CommandGroup>
      {options.map((item) => (
        <CommandItem
          value={String(item.id)}
          key={item.id}
          onSelect={() => {
            onChange(item);
            setOpen(false);
          }}
        >
          {item.name}
          <Check
            className={cn(
              "ml-auto",
              item.id === value ? "opacity-100" : "opacity-0",
            )}
          />
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export default function Autocomplete<T>({
  value,
  onChange,
  options = [],
  placeholder = "Type to search...",
}: AutocompleteProps<T>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild className="w-full">
        <Button
          variant="outline"
          role="combobox"
          autoFocus
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
            {renderOptionsDefault({ options, open, setOpen, onChange, value })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
