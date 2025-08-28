import { Search } from "lucide-react";
import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatCurrency } from "@/utils/formatters";
import { UNIT_COLOR } from "@/utils/definitions";
import { useNavigate } from "react-router";
import ColorBadge from "./ColorBadge";
import { Button } from "./ui/button";
export default function ProductComboSearchCommand<T>({
  items,
  onSelect,
  children,
  className,
}: {
  items: T[];
  onSelect?: (item: T) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className={className}>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
      >
        {children}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                value={item.id}
                key={item.id}
                onSelect={() => {
                  setOpen(false);
                  onSelect?.(item);
                }}
                className="flex items-center gap-2 justify-between"
              >
                {item.name}
                <div className="flex gap-2">
                  {item.inventory.quantity}
                  <span>{formatCurrency(item.price)}</span>
                  <ColorBadge colorMap={UNIT_COLOR}>{item.unit}</ColorBadge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
