import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import React from "react";

interface AutocompleteProps {
  value: string | undefined;
  onChange: (item: option) => void;
  options: option[];
  placeholder?: string;
}
type option = {
  id?: number | string;
  name: string;
};

function renderOptionsDefault({
  options,
  setOpen,
  onChange,
  value,
}: {
  options: option[];
  setOpen: (open: boolean) => void;
  onChange: (item: option) => void;
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

export default function Autocomplete({
  value,
  onChange,
  options = [],
  placeholder = "Type to search...",
}: AutocompleteProps) {
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
            {renderOptionsDefault({ options, setOpen, onChange, value })}

            <CommandSeparator />
            <CommandGroup>
              <CommandItem>
                <Plus />
                <span>Add New {placeholder}</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
