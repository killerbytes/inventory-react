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

export default function Autocomplete(props) {
  const { value, items, placeholder, onChange } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild className="w-full">
        {/* <FormControl> */}
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
          )}
        >
          {value
            ? items.find((item) => item.id === value.id)?.name
            : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
        {/* </FormControl> */}
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search product..." className="h-9" />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  value={item.id}
                  key={item.id}
                  onSelect={() => {
                    // form.setValue("productId", item.id);
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
