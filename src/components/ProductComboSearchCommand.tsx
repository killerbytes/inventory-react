import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { UseFormReturn } from "react-hook-form";
import { Button } from "./ui/button";
import * as React from "react";

type BaseProps = {
  id: string | number;
  name: string;
};

const RenderOptionsDefault = React.memo(function RenderOptionsDefault<
  T extends BaseProps,
>({
  items,
  open,
  setOpen,
  onSelect,
}: {
  items: T[];
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelect?: (item: T) => void;
}) {
  return (
    <CommandGroup>
      {open &&
        items.map((item) => (
          <CommandItem
            value={String(item.name)}
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
});

function ProductComboSearchCommandComponent<T extends BaseProps>({
  items,
  onSelect,
  children,
  className,
  renderOptions = (items, open, setOpen, onSelect) => (
    <RenderOptionsDefault
      items={items}
      open={open}
      setOpen={setOpen}
      onSelect={onSelect}
    />
  ),
}: {
  items: T[];
  onSelect?: (item: T) => void;
  children: React.ReactNode;
  className?: string;
  renderOptions?: (
    items: T[],
    open: boolean,
    setOpen: (open: boolean) => void,
    onSelect?: (item: T) => void,
  ) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

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
        <Command
          filter={(value, search) => {
            if (value.toLowerCase() === search.toLowerCase()) {
              return 100; // exact match → highest priority
            }
            if (value.toLowerCase().startsWith(search.toLowerCase())) {
              return 50; // startsWith → next
            }
            return value.toLowerCase().includes(search) ? 10 : 0; // include or hide
          }}
        >
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onValueChange={(val) => {
              setSearch(val);
              listRef.current?.scrollTo(0, 0);
            }}
          />
          <CommandList ref={listRef}>
            <CommandEmpty>No results found.</CommandEmpty>
            {renderOptions(items, open, setOpen, onSelect)}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

export default React.memo(
  ProductComboSearchCommandComponent,
) as typeof ProductComboSearchCommandComponent;
