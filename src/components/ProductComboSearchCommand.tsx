import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import GroupedCommandList from "./GroupedCommandList";
import { ProductCombinations } from "@/types";
import { Button } from "./ui/button";
import * as React from "react";

function ProductComboSearchCommandComponent<T extends ProductCombinations>({
  items,
  onSelect,
  children,
  className,
  renderOptions = ({ items, open, setOpen, onSelect, search }) => (
    <GroupedCommandList
      items={items}
      open={open}
      setOpen={setOpen}
      onSelect={onSelect}
      search={search}
    />
  ),
}: {
  items: T[];
  onSelect?: (item: T) => void;
  children: React.ReactNode;
  className?: string;
  renderOptions?: ({
    items,
    open,
    setOpen,
    onSelect,
  }: {
    items: T[];
    open: boolean;
    setOpen: (open: boolean) => void;
    onSelect?: (item: T) => void;
    search: string;
  }) => React.ReactNode;
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
        <Command onValueChange={(val) => setSearch(val)}>
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onValueChange={(val) => {
              setSearch(val);
              listRef.current?.scrollTo(0, 0);
            }}
          />
          <CommandList ref={listRef} className="overflow-hidden">
            <CommandEmpty>No results found.</CommandEmpty>
            {renderOptions({ items, open, setOpen, onSelect, search })}
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

export default React.memo(
  ProductComboSearchCommandComponent,
) as typeof ProductComboSearchCommandComponent;
