import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "./ui/button";

type BaseProps = {
  id: string | number;
  name: string;
};

function renderOptionsDefault<T extends BaseProps>(
  items: T[],
  setOpen: (open: boolean) => void,
  onSelect?: (item: T) => void,
) {
  return (
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
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export default function ProductComboSearchCommand<T extends BaseProps>({
  items,
  onSelect,
  children,
  className,
  renderOptions = renderOptionsDefault,
}: {
  items: T[];
  onSelect?: (item: T) => void;
  children: React.ReactNode;
  className?: string;
  renderOptions?: (
    items: T[],
    setOpen: (open: boolean) => void,
    onSelect?: (item: T) => void,
  ) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

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
        asChild
      >
        {children}
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {renderOptions(items, setOpen, onSelect)}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
