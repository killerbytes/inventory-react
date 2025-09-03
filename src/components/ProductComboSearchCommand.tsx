import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  search,
}: {
  items: T[];
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelect?: (item: T) => void;
  search: string;
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
  renderOptions = ({ items, open, setOpen, onSelect }) => (
    <RenderOptionsDefault
      items={items}
      open={open}
      setOpen={setOpen}
      onSelect={onSelect}
      search
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
        <Command
          onValueChange={(val) => setSearch(val)}
          // filter={(value, search) => {
          //   // Normalize: lowercase + remove non-alphanumeric characters
          //   const normalize = (str: string) =>
          //     str.toLowerCase().replace(/[^a-z0-9]/gi, "");

          //   const v = normalize(value);
          //   const s = normalize(search);

          //   if (!s) return 1; // if no search, show all

          //   if (v === s) return 100; // exact match
          //   if (v.startsWith(s)) return 50; // startsWith
          //   if (v.includes(s)) return 10; // substring

          //   return 0; // no match
          // }}
          // filter={(value, search) => {
          //   // Normalize: lowercase + remove non-alphanumeric
          //   const normalize = (str: string) =>
          //     str
          //       .toLowerCase()
          //       .replace(/[^a-z0-9 ]/gi, " ")
          //       .trim();

          //   const v = normalize(value);
          //   const s = normalize(search);

          //   if (!s) return 1; // show all if search is empty

          //   // === Exact, startsWith, includes ===
          //   // if (v === s) return 100;
          //   // if (v.startsWith(s)) return 80;
          //   // if (v.includes(s)) return 50;

          //   // === Multi-word token match ===
          //   const searchWords = s.split(/\s+/).filter(Boolean);
          //   let matched = 0;
          //   for (const word of searchWords) {
          //     if (v.includes(word)) matched++;
          //   }
          //   // if (matched === searchWords.length) return 40; // all words matched (order ignored)
          //   if (matched > 0 && matched < 3) return 1; // partial match
          //   if (matched >= 3) return 100; // partial match
          //   console.log(v, matched, searchWords);

          //   return 0;
          // }}
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
