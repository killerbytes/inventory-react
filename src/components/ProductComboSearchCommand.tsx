import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import GroupedCommandList, { BaseProps } from "./GroupedCommandList";
import useDebounce from "@/hooks/useDebounce";
import { Button } from "./ui/button";
import * as React from "react";
import Loader from "./Loader";

function ProductComboSearchCommandComponent<T extends BaseProps>({
  onSelect,
  onSearch,
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
  onSelect?: (item: T) => void;
  children: React.ReactNode;
  onSearch: (search: string) => Promise<T[]>;
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
  const [items, setItems] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debouncedQuery = useDebounce(search, 300);

  React.useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const data = await onSearch(debouncedQuery);
      setItems(data);
      setLoading(false);
    };
    if (debouncedQuery) {
      getData();
    }
  }, [debouncedQuery, onSearch]);

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

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0, 0);
    }
  }, [items]);

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
      <CommandDialog open={open} onOpenChange={setOpen} className="md:!w-[80%]">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList ref={listRef} className="md:max-h-160 overflow-y-auto">
            {loading && (
              <CommandEmpty>
                <Loader />
              </CommandEmpty>
            )}
            {!loading && debouncedQuery && items.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandEmpty>Type to search for products...</CommandEmpty>
            )}
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
